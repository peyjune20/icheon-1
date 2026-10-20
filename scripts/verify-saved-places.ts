import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ACCOUNT_CHANGED, getSupabase } from "../src/lib/supabase";
import { SavedPlacesProvider, useSavedPlaces } from "../src/features/saved-places/use-saved-places";
import { getGuestSavedPlaceIds, SAVED_PLACE_IDS_KEY } from "../src/features/saved-places/saved-places.storage";
import { deleteAccountSavedPlace, saveAccountPlaces } from "../src/features/saved-places/saved-places.repository";
import { GuestBookmarkImport } from "../src/features/saved-places/GuestBookmarkImport";
import { SEED_PLACES } from "../src/infrastructure/data/seed-places.data";
import { UserFacingError } from "../src/lib/client-errors";

async function main() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://bookmarks-test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "synthetic-anon";
  const local = new Map<string, string>([[SAVED_PLACE_IDS_KEY, JSON.stringify(["1", "2"])]]);
  let localWriteFailure = false;
  const events = Object.assign(new EventTarget(), {
    setTimeout,
    localStorage: {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (localWriteFailure) throw new Error("synthetic storage denied");
        local.set(key, value);
      },
    },
  });
  Object.defineProperty(globalThis, "window", { configurable: true, value: events });
  Object.defineProperty(globalThis, "document", { configurable: true, value: Object.assign(new EventTarget(), { visibilityState: "visible" }) });
  const nativeBroadcastChannel = globalThis.BroadcastChannel;
  Reflect.deleteProperty(globalThis, "BroadcastChannel");
  const db = getSupabase();
  const A = "11111111-1111-4111-8111-111111111111", B = "22222222-2222-4222-8222-222222222222";
  let account: { id: string } | null = null, authFailure = false;
  let readFailure = false, writeFailure = false, reads = 0, writes = 0;
  let readHold: Promise<void> | null = null, writeHold: Promise<void> | null = null;
  let releaseRead!: () => void, releaseWrite!: () => void;
  const rows = new Map<string, Set<string>>([[A, new Set(["3"])], [B, new Set(["4"])]]);
  db.auth.getUser = (async () => ({
    data: { user: account }, error: authFailure ? new Error("synthetic auth network failure") : null,
  })) as typeof db.auth.getUser;
  db.from = ((table: string) => {
    assert.equal(table, "saved_places");
    let kind = "read", payload: { user_id: string; place_id: string }[] = [], filterOwner = "", placeId = "";
    const query: any = {};
    query.select = query.order = () => query;
    query.eq = (key: string, value: string) => { if (key === "user_id") filterOwner = value; if (key === "place_id") placeId = value; return query; };
    query.upsert = (value: typeof payload, options: { onConflict: string; ignoreDuplicates: boolean }) => {
      assert.deepEqual(options, { onConflict: "user_id,place_id", ignoreDuplicates: true });
      payload = value; kind = "save"; return query;
    };
    query.delete = () => { kind = "delete"; return query; };
    query.then = (resolve: any, reject: any) => (async () => {
      const owner = account?.id;
      assert(owner, "guest must never query the private table");
      if (kind === "read") {
        reads++; assert.equal(filterOwner, owner, "all reads explicitly filter the authenticated owner");
        const data = [...(rows.get(owner) || [])].map(place_id => ({ place_id }));
        if (readHold) await readHold;
        return { data, error: readFailure ? new Error("synthetic missing table/network error") : null };
      }
      writes++;
      if (kind === "save") assert(payload.every(row => row.user_id === owner));
      else assert.equal(filterOwner, owner, "deletes are scoped to the Auth owner");
      if (writeHold) await writeHold;
      if (writeFailure) return { data: null, error: new Error("synthetic write failure") };
      const saved = rows.get(owner) || new Set<string>();
      if (kind === "save") payload.forEach(row => saved.add(row.place_id));
      else saved.delete(placeId);
      rows.set(owner, saved);
      return { data: null, error: null };
    })().then(resolve, reject);
    return query;
  }) as typeof db.from;
  let state!: ReturnType<typeof useSavedPlaces>, sibling!: ReturnType<typeof useSavedPlaces>, view!: ReactTestRenderer;
  const hasSaved = (id: string) => state.ids.includes(id);
  function Probe() { state = useSavedPlaces(); return React.createElement(GuestBookmarkImport, { key: state.owner || "guest", places: SEED_PLACES }); }
  function Sibling() { sibling = useSavedPlaces(); return null; }
  const settle = () => new Promise(resolve => setTimeout(resolve, 10));
  const mount = async () => {
    await act(async () => {
      view = create(React.createElement(SavedPlacesProvider, null, React.createElement(Probe), React.createElement(Sibling)));
      await settle();
    });
  };
  const switchAccount = async (id: string | null) => {
    await act(async () => {
      account = id ? { id } : null;
      events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle();
    });
  };
  const quietly = async (test: () => Promise<void>) => {
    const original = console.error; console.error = () => {};
    try { await test(); } finally { console.error = original; }
  };
  await mount();
  assert.deepEqual(state.ids, ["1", "2"]); assert.equal(reads, 0); assert.equal(writes, 0);
  await act(async () => { assert(await state.save("5")); await settle(); });
  assert.deepEqual(getGuestSavedPlaceIds(), ["1", "2", "5"]);
  assert.deepEqual(sibling.ids, state.ids, "detail and My Trip share one live state");
  const guestOriginal = local.get(SAVED_PLACE_IDS_KEY);
  await switchAccount(A);
  assert.deepEqual(state.ids, ["3"], "login must not merge guest bookmarks");
  assert.equal(writes, 0);
  const checkboxes = view.root.findAllByType("input");
  assert.equal(checkboxes.length, 3); assert(checkboxes.every(box => !box.props.checked), "import requires explicit selection");
  assert(view.root.findByType("button").props.disabled);
  await act(async () => { checkboxes[0].props.onChange({ target: { checked: true } }); });
  await act(async () => { await view.root.findByType("button").props.onClick(); });
  assert.deepEqual([...rows.get(A)!].sort(), ["1", "3"], "only selected guest bookmark is imported");
  assert.equal(local.get(SAVED_PLACE_IDS_KEY), guestOriginal, "import preserves guest originals");
  await act(async () => { assert(await state.remove("1")); });
  assert.deepEqual([...rows.get(A)!], ["3"]); assert.equal(local.get(SAVED_PLACE_IDS_KEY), guestOriginal);
  await act(async () => { assert(await state.save("6")); });
  assert.equal(local.get(SAVED_PLACE_IDS_KEY), guestOriginal, "account add must not touch guest storage");
  await switchAccount(B); assert.deepEqual(state.ids, ["4"]);
  await switchAccount(null); assert.deepEqual(state.ids, ["1", "2", "5"], "logout restores guest-only bookmarks");
  await act(async () => { assert(await state.remove("2")); await settle(); });
  assert.deepEqual([...rows.get(A)!], ["3", "6"], "guest removal cannot delete account data");
  await switchAccount(A);
  await act(async () => { view.unmount(); });
  await mount(); assert.deepEqual(state.ids, ["3", "6"], "account bookmarks survive remount/reload");
  // Simulate a different device/browser with no guest storage.
  const guestBackup = local.get(SAVED_PLACE_IDS_KEY)!; local.delete(SAVED_PLACE_IDS_KEY);
  await act(async () => { view.unmount(); }); await mount();
  assert.deepEqual(state.ids, ["3", "6"]); assert.deepEqual(state.guestIds, []);
  await switchAccount(null); assert.deepEqual(state.ids, []);
  local.set(SAVED_PLACE_IDS_KEY, guestBackup);
  await switchAccount(A);
  // Cloud failures never fall back to the guest list or report a local success.
  const originalGuest = local.get(SAVED_PLACE_IDS_KEY);
  readFailure = true;
  await quietly(async () => { await act(async () => { await state.refresh(); }); });
  assert.equal(state.status, "error"); assert.deepEqual(state.ids, []);
  const beforeFailure = writes;
  await act(async () => { assert.equal(await state.save("7"), false); });
  assert.equal(writes, beforeFailure); assert.equal(local.get(SAVED_PLACE_IDS_KEY), originalGuest);
  readFailure = false; await act(async () => { await state.refresh(); });
  writeFailure = true;
  await quietly(async () => { await act(async () => { assert.equal(await state.remove("3"), false); }); });
  assert(hasSaved("3")); assert(state.message.includes("변경하지 못했어요"));
  writeFailure = false;
  // Stale credentials are checked again before a mutation.
  account = { id: B }; const beforeMismatch = writes;
  await quietly(async () => { await act(async () => { assert.equal(await state.save("8"), false); await settle(); }); });
  assert.equal(writes, beforeMismatch); assert.deepEqual(state.ids, ["4"]);
  await assert.rejects(() => saveAccountPlaces(["1"], A), (e: UserFacingError) => e.code === "AUTH_CHANGED");
  await assert.rejects(() => deleteAccountSavedPlace("1", A), (e: UserFacingError) => e.code === "AUTH_CHANGED");
  // Delayed old-account read cannot paint its list over a new account.
  await switchAccount(A);
  readHold = new Promise(resolve => { releaseRead = resolve; });
  let refreshing!: Promise<void>;
  await act(async () => { refreshing = state.refresh(); await settle(); });
  readHold = null;
  await switchAccount(B); assert.deepEqual(state.ids, ["4"]);
  await act(async () => { releaseRead(); await refreshing; }); assert.deepEqual(state.ids, ["4"]);
  // Account change while writing clears the old list immediately and ignores its completion.
  await switchAccount(A);
  writeHold = new Promise(resolve => { releaseWrite = resolve; });
  let saving!: Promise<boolean>;
  await act(async () => { saving = state.save("9"); await settle(); });
  await switchAccount(B); assert.deepEqual(state.ids, []); assert.equal(state.status, "loading");
  await act(async () => { releaseWrite(); assert.equal(await saving, false); await settle(); });
  writeHold = null; assert.deepEqual(state.ids, ["4"]); assert(rows.get(A)!.has("9")); assert(!rows.get(B)!.has("9"));
  // Refreshes during a mutation are deferred, not allowed to replace it with an older read.
  writeHold = new Promise(resolve => { releaseWrite = resolve; });
  await act(async () => { saving = state.save("10"); await settle(); });
  const beforeRefresh = reads;
  await act(async () => { events.dispatchEvent(new Event("focus")); await settle(); });
  assert.equal(reads, beforeRefresh);
  await act(async () => { releaseWrite(); assert(await saving); await settle(); });
  writeHold = null; assert.deepEqual(state.ids, ["4", "10"]);
  rows.get(B)!.add("11");
  await act(async () => { events.dispatchEvent(Object.assign(new Event("storage"), { key: "icheon-bebe-road:account-bookmarks-changed" })); await settle(); });
  assert(hasSaved("11"), "other-tab mutations refresh the current account");
  const beforeUnrelated = reads;
  await act(async () => { events.dispatchEvent(Object.assign(new Event("storage"), { key: "unrelated-key" })); await settle(); });
  assert.equal(reads, beforeUnrelated);
  // A denied local notification does not turn a committed account write into failure.
  localWriteFailure = true;
  await act(async () => { assert(await state.save("12")); }); assert(rows.get(B)!.has("12"));
  await switchAccount(null);
  await quietly(async () => { await act(async () => { assert.equal(await state.save("13"), false); }); });
  assert.equal(local.get(SAVED_PLACE_IDS_KEY), originalGuest); localWriteFailure = false;
  // Auth outage hides account data and blocks writes, rather than guessing guest mode.
  await switchAccount(A); authFailure = true;
  await quietly(async () => { await act(async () => { await state.refresh(); }); });
  assert.equal(state.status, "error"); assert.deepEqual(state.ids, []);
  const beforeAuthFailure = writes;
  await act(async () => { assert.equal(await state.save("14"), false); }); assert.equal(writes, beforeAuthFailure);
  authFailure = false;
  await act(async () => { view.unmount(); });
  await db.auth.stopAutoRefresh();
  Reflect.deleteProperty(globalThis, "window"); Reflect.deleteProperty(globalThis, "document");
  Object.defineProperty(globalThis, "BroadcastChannel", { configurable: true, writable: true, value: nativeBroadcastChannel });
  const sql = readFileSync("supabase/migrations/202610210003_account_saved_places.sql", "utf8");
  for (const text of ["enable row level security", "revoke all", "from anon, authenticated", "for select to authenticated", "for insert to authenticated", "for delete to authenticated", "primary key (user_id, place_id)", "p.user_id = (select auth.uid())", "references public.custom_places(id) on delete cascade"]) assert(sql.includes(text));
  console.log("PASS: separate guest/account bookmarks, selective import, original preservation, A/B isolation, reload/device changes, stale reads/writes, cross-tab refresh and visible failures (mock SDK; live SQL/RLS verification still required)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
