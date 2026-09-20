import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getSupabase, getSupabasePublicConfig, isSupabaseConfigured } from "../src/lib/supabase";
import { UserFacingError } from "../src/lib/client-errors";
import { isVisitDate, legacyVisitsToImport } from "../src/features/tour-stamps/visit-dates";
import { deleteVisitRecord, importVisitRecords, listVisitRecords, saveVisitRecord } from "../src/features/tour-stamps/visit-repository";
import { listCustomPlaces, saveCustomPlace } from "../src/features/custom-places/account-repository";
import { deleteVisitPhoto, listVisitPhotos, releasePhotoPreviews, uploadVisitPhoto } from "../src/features/place-detail/photo-repository";

async function main() {
  // Synthetic credentials only. All Auth, Database and Storage calls below are mocked.
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  assert.equal(isSupabaseConfigured(), false);
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " synthetic-anon ";
  assert.equal(isSupabaseConfigured(), true);
  assert.equal(getSupabasePublicConfig().key, "synthetic-anon");
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "synthetic-publishable";
  assert.equal(getSupabasePublicConfig().key, "synthetic-anon");
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " ";
  assert.equal(getSupabasePublicConfig().key, "synthetic-publishable");
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "synthetic-anon";

  assert(isVisitDate("2024-02-29", "2026-09-21"));
  for (const date of ["2025-02-29", "2026-02-30", "2026-9-1", "2026-09-22", "invalid"]) assert(!isVisitDate(date, "2026-09-21"));
  const legacy = [
    { placeId: "1", visitedAt: "2024-02-29T16:00:00Z" },
    { placeId: "2", visitedAt: "2024-01-01" },
    { placeId: "other-users-place", visitedAt: "2024-01-01" },
    { placeId: "3", visitedAt: "invalid" },
  ];
  assert.deepEqual(legacyVisitsToImport(legacy, ["1", "2", "3"], [{ placeId: "2", visitedAt: "2024-03-01" }]), [{ placeId: "1", visitedAt: "2024-03-01" }]);
  assert.equal(legacy[0].visitedAt, "2024-02-29T16:00:00Z", "local original preserved");

  const db = getSupabase();
  let account: { id: string } | null = { id: "11111111-1111-4111-8111-111111111111" };
  const owner = account.id;
  const calls: { method: string; args: any[] }[] = [];
  const replies: { data: any; error: any }[] = [];
  const reply = (data: any = null, error: any = null) => replies.push({ data, error });
  db.auth.getUser = (async () => ({ data: { user: account }, error: null })) as typeof db.auth.getUser;
  db.from = ((table: string) => {
    calls.push({ method: "from", args: [table] });
    const query: any = {};
    for (const method of ["select", "insert", "upsert", "delete", "eq", "order", "single", "maybeSingle"]) query[method] = (...args: any[]) => { calls.push({ method, args }); return query; };
    query.then = (resolve: any, reject: any) => {
      assert(replies.length, "unexpected Database query");
      return Promise.resolve(replies.shift()).then(resolve, reject);
    };
    return query;
  }) as typeof db.from;
  const last = (method: string) => calls.filter(call => call.method === method).at(-1)!.args;
  const hasOwnerFilter = () => assert(calls.some(call => call.method === "eq" && call.args[0] === "user_id" && call.args[1] === owner));

  reply([{ place_id: "1", visited_at: "2024-01-01" }]);
  assert.deepEqual(await listVisitRecords(owner), [{ placeId: "1", visitedAt: "2024-01-01" }]); hasOwnerFilter();
  reply({ place_id: "1", visited_at: "2024-02-01" });
  assert.equal((await saveVisitRecord("1", "2024-02-01", owner)).visitedAt, "2024-02-01");
  assert.equal(last("upsert")[0].user_id, owner);
  assert.equal(last("upsert")[1].onConflict, "user_id,place_id");
  reply([{ place_id: "2", visited_at: "2024-03-01" }]);
  await importVisitRecords([{ placeId: "2", visitedAt: "2024-03-01" }], owner);
  assert.equal(last("upsert")[1].ignoreDuplicates, true);
  calls.length = 0; reply(); await deleteVisitRecord("1", owner); hasOwnerFilter();
  assert(calls.some(call => call.method === "eq" && call.args[0] === "place_id" && call.args[1] === "1"));
  const failure = new Error("synthetic connection failure"); reply(null, failure);
  await assert.rejects(() => saveVisitRecord("1", "2024-02-01", owner), failure);
  await assert.rejects(() => saveVisitRecord("1", "2024-02-30", owner), UserFacingError);
  account = { id: "22222222-2222-4222-8222-222222222222" };
  calls.length = 0;
  await assert.rejects(() => saveVisitRecord("1", "2024-01-01", owner), (e: UserFacingError) => e.code === "AUTH_CHANGED");
  assert.equal(calls.length, 0, "stale account cannot start a Database write");
  account = null;
  await assert.rejects(() => deleteVisitRecord("1", owner), (e: UserFacingError) => e.code === "AUTH");
  assert.deepEqual(await listCustomPlaces(), []);
  account = { id: owner };
  reply(); const place = await saveCustomPlace({ name: "테스트", address: "테스트 주소", lat: 37, lng: 127, category: "NATURE" });
  assert(place.id.startsWith("user-"));
  assert.equal(last("insert")[0].user_id, owner, "custom place owner is the verified Auth user");
  calls.length = 0; reply([{ data: place }]); assert.equal((await listCustomPlaces())[0].id, place.id); hasOwnerFilter();

  const storageCalls: { method: string; args: any[] }[] = [];
  const jpeg = new Blob(["pixel-only JPEG mock"], { type: "image/jpeg" });
  db.storage.from = ((bucket: string) => {
    assert.equal(bucket, "visit-photos");
    return Object.fromEntries(["upload", "remove", "download"].map(method => [method, async (...args: any[]) => {
      storageCalls.push({ method, args }); return { data: method === "download" ? jpeg : {}, error: null };
    }]));
  }) as unknown as typeof db.storage.from;
  Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, value: async () => ({ width: 20, height: 20, close() {} }) });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => ({ getContext: () => ({ fillRect() {}, drawImage() {} }), toBlob: (callback: (b: Blob) => void) => callback(jpeg) }) } });
  const file = Object.assign(new Blob(["private source metadata"], { type: "image/png" }), { name: "test.png" }) as File;
  reply(); await uploadVisitPhoto("1", file, "  가족 사진  ");
  const upload = storageCalls.find(call => call.method === "upload")!;
  assert(upload.args[0].startsWith(owner + "/")); assert.equal(upload.args[1], jpeg); assert.equal(upload.args[2].upsert, false);
  const metadata = last("insert")[0]; assert.equal(metadata.title, "가족 사진"); assert.equal(metadata.place_id, "1"); assert.equal(metadata.user_id, owner);
  calls.length = 0; reply([{ ...metadata, user_id: owner, created_at: "2024-01-01" }]);
  const photos = await listVisitPhotos("1"); hasOwnerFilter(); assert(photos[0].previewUrl?.startsWith("blob:")); releasePhotoPreviews(photos);
  reply(null, failure); await assert.rejects(() => uploadVisitPhoto("1", file, "rollback"), failure);
  assert.equal(storageCalls.at(-1)?.method, "remove", "failed metadata save cleans uploaded file");
  calls.length = 0; reply({ object_path: metadata.object_path }); reply();
  await deleteVisitPhoto(metadata.id); hasOwnerFilter();
  assert.deepEqual(storageCalls.at(-1)?.args, [[metadata.object_path]]);
  assert.equal(last("from")[0], "visit_photos"); assert(calls.some(call => call.method === "delete"));
  account = null;
  const before = storageCalls.length;
  await assert.rejects(() => uploadVisitPhoto("1", file, "blocked"), (e: UserFacingError) => e.code === "AUTH");
  assert.equal(storageCalls.length, before, "signed-out upload never reaches Storage");
  assert.equal(replies.length, 0);
  await db.auth.stopAutoRefresh();
  Reflect.deleteProperty(globalThis, "createImageBitmap"); Reflect.deleteProperty(globalThis, "document");

  const sql = readFileSync("supabase/migrations/202609210002_account_visit_records.sql", "utf8");
  for (const part of ["enable row level security", "from anon, authenticated", "for select", "for insert", "for update", "for delete", "primary key (user_id, place_id)", "references public.custom_places(id) on delete cascade", "p.user_id = (select auth.uid())"]) assert(sql.includes(part));
  console.log("PASS: ANON/PUBLISHABLE config, visit dates/import preservation, owner-scoped place/visit/photo repositories, private uploads and rollback (mock SDK; live RLS still requires Supabase setup)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
