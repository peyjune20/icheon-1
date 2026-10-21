import assert from "node:assert/strict";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { getSupabase, ACCOUNT_CHANGED } from "../src/lib/supabase";
import { useVisitRecords } from "../src/features/tour-stamps/use-visit-records";
import { PLACES_CHANGED } from "../src/features/custom-places/use-places";
import { TOUR_STAMPS_KEY } from "../src/features/tour-stamps/tour-stamps.storage";
import { VisitRecordsGate } from "../src/features/tour-stamps/VisitRecordsGate";
import { StampBook } from "../src/features/tour-stamps/StampBook";
import { SEED_PLACES } from "../src/infrastructure/data/seed-places.data";

async function main() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://stamp-tests.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "synthetic-anon";
  const originalLegacy = JSON.stringify([{ placeId: "1", visitedAt: "2024-09-18" }, { placeId: "2", visitedAt: "2024-01-15" }]);
  const local = new Map<string, string>([[TOUR_STAMPS_KEY, originalLegacy]]);
  const events = Object.assign(new EventTarget(), { setTimeout, localStorage: { getItem: (key: string) => local.get(key) ?? null } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: events });
  Object.defineProperty(globalThis, "self", { configurable: true, value: { setTimeout, clearTimeout } });
  // No real cross-tab channel is needed in this synthetic browser.
  const nativeBroadcastChannel = globalThis.BroadcastChannel;
  Reflect.deleteProperty(globalThis, "BroadcastChannel");
  const db = getSupabase();
  const A = "11111111-1111-4111-8111-111111111111", B = "22222222-2222-4222-8222-222222222222";
  let account: { id: string } | null = null;
  let failAuth = false, failRead = false;
  db.auth.getUser = (async () => ({ data: { user: account }, error: failAuth ? new Error("synthetic auth failure") : null })) as typeof db.auth.getUser;
  const accounts = new Map<string, Map<string, { place_id: string; visited_at: string }>>();
  let reads = 0, writes = 0, hold: Promise<void> | null = null, failWrite = false, readHold: Promise<void> | null = null;
  db.from = ((table: string) => {
    assert.equal(table, "visit_records");
    let kind = "read", payload: any, id = "", filterOwner = "";
    const query: any = {};
    for (const name of ["select", "single", "order"]) query[name] = () => query;
    query.eq = (column: string, value: string) => { if (column === "place_id") id = value; if (column === "user_id") filterOwner = value; return query; };
    query.upsert = (value: any) => { kind = "save"; payload = value; return query; };
    query.delete = () => { kind = "delete"; return query; };
    query.then = (resolve: any, reject: any) => (async () => {
      const userId = account?.id; assert(userId, "guest must not query visit records");
      const rows = accounts.get(userId) || new Map(); accounts.set(userId, rows);
      if (kind === "read") {
        reads++; assert.equal(filterOwner, userId);
        const snapshot = [...rows.values()];
        if (readHold) await readHold;
        return { data: snapshot, error: failRead ? new Error("synthetic read failure") : null };
      }
      writes++;
      if (kind === "delete") assert.equal(filterOwner, userId);
      else assert((Array.isArray(payload) ? payload : [payload]).every(row => row.user_id === userId));
      if (hold) await hold;
      if (failWrite) return { data: null, error: new Error("synthetic write failure") };
      if (kind === "delete") { rows.delete(id); return { data: null, error: null }; }
      if (Array.isArray(payload)) {
        const added = payload.filter(row => !rows.has(row.place_id)).map(row => ({ place_id: row.place_id, visited_at: row.visited_at }));
        added.forEach(row => rows.set(row.place_id, row)); return { data: added, error: null };
      }
      const row = { place_id: payload.place_id, visited_at: payload.visited_at };
      rows.set(row.place_id, row); return { data: row, error: null };
    })().then(resolve, reject);
    return query;
  }) as typeof db.from;
  let state!: ReturnType<typeof useVisitRecords>, view!: ReactTestRenderer;
  const stampDate = (id: string) => state.stamps.find(stamp => stamp.placeId === id)?.visitedAt;
  function Probe() {
    state = useVisitRecords(["1", "2"]);
    return React.createElement(VisitRecordsGate, {
      owner: state.owner, loading: state.loading, error: state.error, onRetry: state.refresh,
      children: React.createElement(StampBook, { key: state.owner, places: SEED_PLACES.filter(p => ["1", "2"].includes(p.id)), stamps: state.stamps, onCreate: state.save, onRemove: state.remove, disabled: state.loading || state.busy }),
    });
  }
  const settle = () => new Promise(resolve => setTimeout(resolve, 10));
  await act(async () => { view = create(React.createElement(Probe)); await settle(); });
  assert.equal(state.loading, false);
  assert.deepEqual(state.stamps, [], "legacy guest stamps must not be displayed");
  assert.deepEqual(state.pendingImport, [], "legacy counts/dates are hidden before login");
  assert.equal(view.root.findAllByType("input").length, 0, "guest UI has no date inputs");
  assert.equal(view.root.findAllByType("button").length, 0, "guest UI has no save/delete controls");
  assert(!JSON.stringify(view.toJSON()).includes("2024-09-18"));
  assert(JSON.stringify(view.toJSON()).includes("로그인하고 내 스탬프 보기"));
  await act(async () => { await state.save("1", "2024-01-01"); });
  assert.equal(writes, 0, "guest cannot silently create a cloud record");
  assert.equal(state.feedbackPlaceId, "1"); assert(state.signInRequired);
  assert(state.message.includes("로그인"), "clicked stamp must receive explicit login feedback");
  await act(async () => { await state.remove("1"); });
  assert.equal(writes, 0, "a guest cannot delete a visit even if a handler is called directly");
  assert.equal(local.get(TOUR_STAMPS_KEY), originalLegacy);

  account = { id: A };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  assert.deepEqual(state.stamps, [], "login must not silently display/import browser records");
  assert.equal(state.pendingImport.length, 2);
  assert.equal(writes, 0);
  assert.equal(view.root.findAllByType("input").length, 2, "only the logged-in account can edit dates");
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
  assert.equal(stampDate("1"), "2024-02-01", "date edit persists on reload");
  failWrite = true;
  const originalError = console.error; console.error = () => {};
  try { await act(async () => { await state.save("1", "2024-03-01"); }); }
  finally { console.error = originalError; }
  assert(state.message.includes("저장하지 못했어요")); assert.equal(state.feedbackPlaceId, "1");
  assert.equal(stampDate("1"), "2024-02-01", "failed save must preserve the existing stamp");
  failWrite = false;
  await act(async () => { await state.remove("1"); await state.refresh(); });
  assert.equal(state.stamps.length, 0);
  assert(!JSON.stringify(view.toJSON()).includes("2024-09-18"), "account deletion must not resurrect a browser date");
  // Explicit import is additive; neither login nor logout performs it.
  await act(async () => { await state.importLegacy(); });
  assert.equal(state.stamps.length, 2); assert.equal(local.get(TOUR_STAMPS_KEY), originalLegacy);
  await act(async () => { await state.remove("1"); await state.refresh(); });
  assert.deepEqual(state.stamps, [{ placeId: "2", visitedAt: "2024-01-15" }]);
  account = null;
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  assert.deepEqual(state.stamps, []); assert.deepEqual(state.pendingImport, []);
  assert.equal(view.root.findAllByType("input").length, 0);
  assert(!JSON.stringify(view.toJSON()).includes("2024-01-15"));
  assert.equal(local.get(TOUR_STAMPS_KEY), originalLegacy, "logout hides rather than deletes browser originals");
  // A fresh device with no legacy storage still receives the same cloud date.
  local.clear(); account = { id: A };
  await act(async () => { view.unmount(); });
  await act(async () => { view = create(React.createElement(Probe)); await settle(); });
  assert.deepEqual(state.stamps, [{ placeId: "2", visitedAt: "2024-01-15" }]);
  assert.deepEqual(state.pendingImport, []);
  account = { id: B };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  assert.deepEqual(state.stamps, [], "a different account never receives A's date");
  account = { id: A };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  // A same-account background refresh must preserve the open stamp book instance.
  const book = view.root.findByType(StampBook);
  let releaseRead!: () => void, refreshing!: Promise<void>;
  readHold = new Promise(resolve => { releaseRead = resolve; });
  await act(async () => { refreshing = state.refresh(); await settle(); });
  assert.equal(view.root.findByType(StampBook), book);
  account = { id: B }; readHold = null;
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  await act(async () => { releaseRead(); await refreshing; });
  assert.deepEqual(state.stamps, [], "late old-account reads cannot reappear after an account switch");
  account = { id: A };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  // Logging out while a write is pending must not restore that record in guest UI.
  hold = new Promise(resolve => { release = resolve; });
  await act(async () => { saving = state.save("1", "2024-02-01"); await settle(); });
  account = null;
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  assert.equal(view.root.findAllByType("input").length, 0);
  await act(async () => { release(); await saving; await settle(); }); hold = null;
  assert.deepEqual(state.stamps, []); assert.equal(state.owner, null);
  account = { id: A };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  assert.equal(state.stamps.length, 2, "the in-flight write remains in its original account only");
  local.set(TOUR_STAMPS_KEY, originalLegacy);
  const quietly = async (action: () => Promise<void>) => { const before = console.error; console.error = () => {}; try { await action(); } finally { console.error = before; } };
  // Guard against an account change even when its UI notification is delayed.
  account = { id: B }; const beforeAuthMismatch = writes;
  await quietly(async () => { await act(async () => { await state.remove("2"); await settle(); }); });
  assert.equal(writes, beforeAuthMismatch); assert.deepEqual(state.stamps, []);
  assert.equal(state.owner, B); assert(accounts.get(A)!.has("2"));
  account = { id: A };
  await act(async () => { events.dispatchEvent(new Event(ACCOUNT_CHANGED)); await settle(); });
  failRead = true;
  await quietly(async () => { await act(async () => { await state.refresh(); }); });
  assert.deepEqual(state.stamps, []); assert.equal(view.root.findAllByType("input").length, 0);
  assert(!JSON.stringify(view.toJSON()).includes("2024-09-18"));
  failRead = false;
  await act(async () => { await state.refresh(); });
  failAuth = true;
  await quietly(async () => { await act(async () => { await state.refresh(); }); });
  assert.deepEqual(state.stamps, []); assert.equal(state.owner, null);
  assert.equal(view.root.findAllByType("input").length, 0); failAuth = false;
  // A missing backend configuration must not fall back to browser history either.
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
  await act(async () => { await state.refresh(); });
  assert.deepEqual(state.stamps, []); assert.deepEqual(state.pendingImport, []);
  assert.equal(local.get(TOUR_STAMPS_KEY), originalLegacy);
  await act(async () => { view.unmount(); });
  await db.auth.stopAutoRefresh(); Reflect.deleteProperty(globalThis, "window"); Reflect.deleteProperty(globalThis, "self");
  Object.defineProperty(globalThis, "BroadcastChannel", { configurable: true, writable: true, value: nativeBroadcastChannel });
  console.log("PASS: login-only stamp UI, hidden/preserved legacy dates, explicit import, A/B and device isolation, logout during save, stale reads, auth failures, save/edit/remove/reload and non-remounting refresh (React + mock Supabase)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
