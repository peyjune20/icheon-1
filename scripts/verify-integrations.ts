import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readJsonResponse, UserFacingError, friendlyError } from "../src/lib/client-errors";
import { normalizeKakaoPlace, loadKakaoMaps, searchKakaoPlaces } from "../src/lib/kakao-maps";
import { kakaoCarUrl, splitCarCourse, MapPoint } from "../src/lib/map-points";
import { validatePhoto, preparePhoto, MAX_PHOTO_BYTES } from "../src/features/place-detail/photo-repository";
import { SEED_PLACES } from "../src/infrastructure/data/seed-places.data";
import { VILLAGE_SLOTS } from "../src/features/tour-stamps/village-layout";
import { ADDRESS_AUDIT } from "../src/infrastructure/data/place-addresses.data";

async function main() {
  const originalError = console.error; console.error = () => {};
  try {
    for (const status of [200, 404, 500]) await assert.rejects(() => readJsonResponse(new Response("<!DOCTYPE html>", { status, headers: { "Content-Type": "text/html" } })), UserFacingError);
    await assert.rejects(() => readJsonResponse(new Response("<", { headers: { "Content-Type": "application/json" } })), UserFacingError);
    assert.deepEqual(await readJsonResponse(new Response('{"ok":true}', { headers: { "Content-Type": "application/json" } })), { ok: true });
    assert.equal(friendlyError(new SyntaxError("Unexpected token '<'"), "안내 메시지"), "안내 메시지");
  } finally { console.error = originalError; }
  const base = { id: "test", place_name: "테스트", road_address_name: "도로명", address_name: "지번", x: "127.4", y: "37.2", place_url: "" };
  const mapped = normalizeKakaoPlace(base); assert.equal(mapped.address, "도로명"); assert.equal(mapped.lat, 37.2); assert.equal(mapped.lng, 127.4);
  assert.equal(normalizeKakaoPlace({ ...base, road_address_name: "" }).address, "지번");
  const oldKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  let appended = 0, requested = "", queryOptions: any, responseStatus = "OK";
  const callbacks: Record<string, () => void> = {};
  const mockMaps = {
    load: (callback: () => void) => callback(), LatLng: class { constructor(public lat: number, public lng: number) {} },
    services: { Status: { OK: "OK", ZERO_RESULT: "ZERO_RESULT" }, Places: class {
      keywordSearch(_keyword: string, callback: (data: any[], status: string) => void, options: unknown) { queryOptions = options; callback([{ ...base, id: "outside", address_name: "서울", road_address_name: "서울 도로" }, { ...base, id: "icheon", road_address_name: "경기 이천시 길" }], responseStatus); }
    } },
  };
  const mockWindow: any = { setTimeout, clearTimeout };
  Object.defineProperty(globalThis, "window", { configurable: true, value: mockWindow });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    querySelector: () => null,
    createElement: () => ({ dataset: {}, set src(v: string) { requested = v; }, addEventListener: (name: string, cb: () => void) => { callbacks[name] = cb; }, remove: () => {} }),
    head: { appendChild: () => { appended++; queueMicrotask(() => { mockWindow.kakao = { maps: mockMaps }; callbacks.load(); }); } },
  } });
  try {
    delete process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    await assert.rejects(() => loadKakaoMaps(), (e: UserFacingError) => e.code === "KAKAO_CONFIG");
    process.env.NEXT_PUBLIC_KAKAO_MAP_KEY = "unit-test-no-network";
    await Promise.all([loadKakaoMaps(), loadKakaoMaps()]);
    assert.equal(appended, 1); assert(requested.includes("libraries=services")); assert(requested.includes("autoload=false"));
    const results = await searchKakaoPlaces("테스트"); assert.equal(results[0].id, "icheon"); assert.equal(results.length, 2); assert(!queryOptions.radius && !queryOptions.rect);
    responseStatus = "ZERO_RESULT"; assert.deepEqual(await searchKakaoPlaces("없는곳"), []);
    responseStatus = "ERROR"; await assert.rejects(() => searchKakaoPlaces("실패"), UserFacingError);
  } finally { if (oldKey === undefined) delete process.env.NEXT_PUBLIC_KAKAO_MAP_KEY; else process.env.NEXT_PUBLIC_KAKAO_MAP_KEY = oldKey; Reflect.deleteProperty(globalThis, "window"); Reflect.deleteProperty(globalThis, "document"); }
  for (const type of ["image/jpeg", "image/png", "image/webp"]) validatePhoto({ type, size: 100 });
  assert.throws(() => validatePhoto({ type: "image/gif", size: 100 }), UserFacingError);
  assert.throws(() => validatePhoto({ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 }), UserFacingError);
  // Assert the pixel-only export pipeline; a real EXIF/orientation sample still needs a browser test.
  let closed = false, drawn = false;
  const output = new Blob(["reencoded pixels"], { type: "image/jpeg" });
  const canvas = { width: 0, height: 0, getContext: () => ({ fillStyle: "", fillRect: () => {}, drawImage: () => { drawn = true; } }), toBlob: (callback: (b: Blob) => void, type: string, quality: number) => { assert.equal(type, "image/jpeg"); assert.equal(quality, .92); callback(output); } };
  Object.defineProperty(globalThis, "createImageBitmap", { configurable: true, value: async (_file: File, options: ImageBitmapOptions) => { assert.equal(options.imageOrientation, "from-image"); return { width: 4000, height: 3000, close: () => { closed = true; } }; } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: (tag: string) => { assert.equal(tag, "canvas"); return canvas; } } });
  try {
    const source = Object.assign(new Blob(["source metadata"], { type: "image/png" }), { name: "test.png" }) as File;
    assert.equal(await preparePhoto(source), output); assert(drawn && closed);
    assert.equal(canvas.width, 2560); assert.equal(canvas.height, 1920);
  } finally { Reflect.deleteProperty(globalThis, "createImageBitmap"); Reflect.deleteProperty(globalThis, "document"); }
  assert.equal(SEED_PLACES.length, 30); assert.equal(Object.keys(ADDRESS_AUDIT).length, 30);
  assert.equal(SEED_PLACES.find(p => p.id === "1")?.category, "RESTAURANT");
  assert(SEED_PLACES.find(p => p.id === "1")?.address.includes("사실로 979-10"));
  assert(SEED_PLACES.find(p => p.id === "4")?.address.endsWith("126"));
  assert(SEED_PLACES.find(p => p.id === "5")?.address.includes("이섭대천로 1382"));
  assert.deepEqual(new Set(VILLAGE_SLOTS.map(s => s.placeId)), new Set(SEED_PLACES.map(p => p.id)));
  assert.equal(new Set(VILLAGE_SLOTS.map(s => s.x + "," + s.y)).size, 30);
  for (const slot of VILLAGE_SLOTS) { assert(slot.x - slot.width / 2 >= 0 && slot.x + slot.width / 2 <= 100); assert(slot.y - slot.height >= 0 && slot.y <= 100); }
  const gps: MapPoint = { id: "gps", name: "현재 위치", lat: 37.5, lng: 127.1, coordinateSource: "synthetic test" };
  const points = [gps, ...SEED_PLACES.map(p => ({ ...p, coordinateSource: "Kakao Places synthetic URL test, not live geocoding" }))];
  const sections = splitCarCourse(points);
  assert.deepEqual(sections.flatMap((s, i) => i ? s.slice(1) : s).map(p => p.id), points.map(p => p.id));
  for (const section of sections) { assert(section.length <= 7); assert(kakaoCarUrl(section)?.includes("/link/by/car/")); }
  assert(kakaoCarUrl(points.slice(0, 2))?.includes(encodeURIComponent("현재 위치")));
  assert.equal(kakaoCarUrl([{ ...gps, coordinateSource: undefined }]), null);
  assert.equal(kakaoCarUrl([{ ...gps, id: "25", name: "산 정상" }]), null);
  const sql = readFileSync("supabase/migrations/202609210001_private_family_records.sql", "utf8");
  for (const table of ["visit_photos", "custom_places", "saved_plans"]) assert(sql.includes("alter table public." + table + " enable row level security"));
  assert(sql.includes("'visit-photos', 'visit-photos', false")); assert(sql.includes("owner_id = (select auth.uid())::text"));
  console.log("PASS: HTML/JSON guards, SDK single load/search/no-results/failure, photo validation, 30-slot/address integrity, GPS/car waypoint segmentation, SQL policy presence (not live RLS test)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
