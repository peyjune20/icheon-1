import assert from "node:assert/strict";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { getSupabase, ACCOUNT_CHANGED } from "../src/lib/supabase";
import { useVisitRecords } from "../src/features/tour-stamps/use-visit-records";
import { PLACES_CHANGED } from "../src/features/custom-places/use-places";

async function main() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://stamp-tests.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "synthetic-anon";
  const events = Object.assign(new EventTarget(), { setTimeout, localStorage: { getItem: () => null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: events });
  // No real cross-tab channel is needed in this synthetic browser.
  const nativeBroadcastChannel = globalThis.BroadcastChannel;
  Reflect.deleteProperty(globalThis, "BroadcastChannel");
  const db = getSupabase();
  let account: { id: string } | null = null;
  db.auth.getUser = (async () => ({ data: { user: account }, error: null })) as typeof db.auth.getUser;
  const rows = new Map<string, { place_id: string; visited_at: string }>();
  let reads = 0, writes = 0, hold: Promise<void> | null = null, failWrite = false;
  db.from = ((table: string) => {
    assert.equal(table, "visit_records");
    let kind = "read", payload: any, id = "";
    const query: any = {};
    for (const name of ["select", "single", "order"]) query[name] = () => query;
    query.eq = (column: string, value: string) => { if (column === "place_id") id = value; return query; };
    query.upsert = (value: any) => { kind = "save"; payload = value; return query; };
    query.delete = () => { kind = "delete"; return query; };
    query.then = (resolve: any, reject: any) => (async () => {
      if (kind === "read") { reads++; return { data: [...rows.values()], error: null }; }
      writes++;
      if (hold) await hold;
      if (failWrite) return { data: null, error: new Error("synthetic write failure") };
      if (kind === "delete") { rows.delete(id); return { data: null, error: null }; }
      const row = { place_id: payload.place_id, visited_at: payload.visited_at };
      rows.set(row.place_id, row); return { data: row, error: null };
    })().then(resolve, reject);
    return query;
  }) as typeof db.from;
  let state!: ReturnType<typeof useVisitRecords>, view!: ReactTestRenderer;
  function Probe() { state = useVisitRecords(["1", "2"]); return null; }
  const settle = () => new Promise(resolve => setTimeout(resolve, 10));
  await act(async () => { view = create(React.createElement(Probe)); await settle(); });
  assert.equal(state.loading, false);
  await act(async () => { await state.save("1", "2024-01-01"); });
  assert.equal(writes, 0, "guest cannot silently create a cloud record");
  assert.equal(state.feedbackPlaceId, "1"); assert(state.signInRequired);
  assert(state.message.includes("로그인"), "clicked stamp must receive explicit login feedback");

  account = { id: "11111111-1111-4111-8111-111111111111" };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  const owner = state.owner;
  let release!: () => void;
  hold = new Promise(resolve => { release = resolve; });
  let saving!: Promise<void>;
  await act(async () => { saving = state.save("1", "2024-01-01"); await settle(); });
  assert(state.busy); assert(state.message.includes("저장하고"));
  const before = reads;
  await act(async () => {
    events.dispatchEvent(Object.assign(new Event("storage"), { key: "sb-test-auth-token" }));
    events.dispatchEvent(new Event(PLACES_CHANGED)); await settle();
  });
  assert.equal(reads, before, "refresh during a save must be deferred, not erase its result");
  assert.equal(state.owner, owner, "same-account refresh must not remount and close the stamp book");
  await act(async () => { release(); await saving; await settle(); }); hold = null;
  assert.deepEqual(state.stamps, [{ placeId: "1", visitedAt: "2024-01-01" }]);
  assert(state.message.includes("저장했어요")); assert.equal(state.busy, false);
  await act(async () => { await state.save("1", "2024-02-01"); await state.refresh(); });
  assert.equal(state.stamps[0].visitedAt, "2024-02-01", "date edit persists on reload");
  failWrite = true;
  const originalError = console.error; console.error = () => {};
  try { await act(async () => { await state.save("1", "2024-03-01"); }); }
  finally { console.error = originalError; }
  assert(state.message.includes("저장하지 못했어요")); assert.equal(state.feedbackPlaceId, "1");
  assert.equal(state.stamps[0].visitedAt, "2024-02-01", "failed save must preserve the existing stamp");
  failWrite = false;
  await act(async () => { await state.remove("1"); await state.refresh(); });
  assert.equal(state.stamps.length, 0);
  await act(async () => { view.unmount(); });
  await db.auth.stopAutoRefresh(); Reflect.deleteProperty(globalThis, "window");
  Object.defineProperty(globalThis, "BroadcastChannel", { configurable: true, writable: true, value: nativeBroadcastChannel });
  console.log("PASS: stamp click/login feedback, save/edit/remove/reload, deferred refresh, auth-storage isolation and visible failure (React + mock Supabase)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
