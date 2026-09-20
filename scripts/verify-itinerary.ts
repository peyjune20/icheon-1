import assert from "node:assert/strict";
import { createRecommendationContext, generateItineraryUseCase } from "../src/application/generate-itinerary.usecase";
import { ModifyItineraryUseCase } from "../src/application/modify-itinerary.usecase";
import { SeedPlaceRepository } from "../src/infrastructure/repositories/seed-place-repository";
import { SeedTravelTimeAdapter } from "../src/adapters/travel-time/seed-travel-time.adapter";
import { SEED_PLACES } from "../src/infrastructure/data/seed-places.data";
import { googleCourseUrl } from "../src/features/itinerary/components/NavigationModal";
import { ageLabel } from "../src/domain/recommendation/itinerary-summary";
import { TripInput } from "../src/domain/models/trip-input";
import { createTourStamp, getTourStamps, removeTourStamp } from "../src/features/tour-stamps/tour-stamps.storage";

async function main() {
  assert.equal(SEED_PLACES.length, 30);
  assert.equal(new Set(SEED_PLACES.map(p => p.id)).size, 30);
  assert.equal(ageLabel(60), "5세 이상");
  const base: Partial<TripInput> = { childAgeMonths: 60, displayAge: "2세", strollerRequired: false, tripDate: "2026-09-26", includeLunch: false, styles: ["INDOOR"], parentRestPriority: "LOW", napTimeStart: "", napTimeEnd: "", weatherCondition: "NORMAL" };
  const normal = await createRecommendationContext(base);
  const rainy = await createRecommendationContext({ ...base, weatherCondition: "RAIN" });
  const baby = await createRecommendationContext({ ...base, childAgeMonths: 10 });
  assert.equal(normal.trip.displayAge, "5세 이상");
  const route = await generateItineraryUseCase(base, normal);
  const wet = await generateItineraryUseCase({ ...base, weatherCondition: "RAIN" }, rainy);
  const small = await generateItineraryUseCase({ ...base, childAgeMonths: 10 }, baby);
  const stops = (it: typeof route) => it.blocks.flatMap(b => b.place ? [b.place] : []);
  assert(stops(route).length > stops(small).length);
  assert(stops(wet).length < stops(route).length);
  assert(!stops(route).some(p => p.category === "RESTAURANT"));
  assert(!stops(route).some(p => p.unavailableReason));
  assert(route.reasons.includes("5세 이상 아이 페이스"));
  assert(route.reasons.includes("낮잠 없음"));
  assert.equal(route.totalDurationMin, route.totalStayMin + route.totalTravelMin);
  assert(!route.blocks.at(-1)?.title.includes("서울"));
  const modify = new ModifyItineraryUseCase(new SeedPlaceRepository(), new SeedTravelTimeAdapter());
  const extra = SEED_PLACES.find(p => !stops(route).some(s => s.id === p.id) && !p.unavailableReason)!;
  const added = await modify.addPlace(route, extra, normal);
  assert.equal(stops(added).length, stops(route).length + 1);
  assert.equal(stops(await modify.addPlace(added, extra, normal)).length, stops(added).length);
  assert.equal(stops(await modify.removePlace(added, extra.id, normal)).length, stops(route).length);
  await assert.rejects(() => modify.addPlace(route, SEED_PLACES.find(p => p.id === "16")!, normal));
  await assert.rejects(() => modify.replacePlace(route, stops(route)[0].id, "16", normal));
  assert(!(await modify.getReplacementCandidates(route)).some(p => p.unavailableReason));
  const p = [SEED_PLACES[2], SEED_PLACES[5], SEED_PLACES[6]];
  const url = new URL(googleCourseUrl(p));
  assert.equal(url.searchParams.get("origin"), `${p[0].lat},${p[0].lng}`);
  assert.equal(url.searchParams.get("destination"), `${p[2].lat},${p[2].lng}`);
  assert.equal(url.searchParams.get("waypoints"), `${p[1].lat},${p[1].lng}`);
  // Isolated in-memory storage: never touches real browser visit records.
  const memory = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => memory.get(key) || null, setItem: (key: string, value: string) => memory.set(key, value) }, dispatchEvent: () => true } });
  try {
    createTourStamp("3", "2026-09-01");
    createTourStamp("7", "2026-09-02");
    createTourStamp("3", "2026-09-03");
    assert.equal(getTourStamps().length, 2);
    assert.equal(getTourStamps().find(s => s.placeId === "3")?.visitedAt, "2026-09-03");
    removeTourStamp("3");
    assert.deepEqual(getTourStamps().map(s => s.placeId), ["7"]);
  } finally { Reflect.deleteProperty(globalThis, "window"); }
  console.log("PASS: 30 places, selected age/options, variable counts, add/remove/dedup, unavailable places, totals, ordered navigation");
}
main().catch(e => { console.error(e); process.exitCode = 1; });
