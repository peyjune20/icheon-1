import assert from "node:assert/strict";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { VillageCollection } from "../src/features/tour-stamps/VillageCollection";
import { VisitRecordsGate } from "../src/features/tour-stamps/VisitRecordsGate";
import { SEED_PLACES } from "../src/infrastructure/data/seed-places.data";

async function main() {
  let storageAccesses = 0, requests = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => { requests++; throw new Error("Preview must not request records"); }) as typeof fetch;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    setTimeout, clearTimeout, location: { href: "http://localhost:3000/my-trip" },
    get localStorage() { storageAccesses++; throw new Error("Preview must not access browser records"); },
  } });
  Object.defineProperty(globalThis, "self", { configurable: true, value: { setTimeout, clearTimeout } });
  const records = [{ placeId: "1", visitedAt: "2024-09-18" }];
  const originalRecords = JSON.stringify(records);
  const tree = (owner: string | null = null, loading = false, error = "") => React.createElement(VisitRecordsGate, {
    owner, loading, error, onRetry: () => {},
    preview: React.createElement(VillageCollection, { places: SEED_PLACES, preview: true }),
    children: React.createElement(React.Fragment, null,
      React.createElement(VillageCollection, { places: SEED_PLACES, stamps: records }),
      React.createElement("input", { type: "date", value: records[0].visitedAt, readOnly: true })),
  });
  let view!: ReactTestRenderer;
  try {
    await act(async () => { view = create(tree()); });
    const slots = () => view.root.findAllByType("a").filter(node => node.props["data-village-slot"]);
    const previewState = () => view.root.findAllByType("section").find(node => node.props["data-village-preview"])?.props["data-village-preview"];
    const button = (label: string) => view.root.findAllByType("button").find(node => node.children.join("") === label)!;
    const text = () => JSON.stringify(view.toJSON());
    assert.equal(previewState(), "empty");
    assert.equal(slots().length, 30);
    assert(slots().every(node => node.props["data-colored"] === false && node.props["data-visited"] === undefined));
    assert.equal(button("스티커 없이 보기").props["aria-pressed"], true);
    assert.equal(view.root.findAllByType("input").length, 0);
    assert(!text().includes("2024-09-18"));
    assert(text().includes("실제 방문 기록이 아니며"));
    assert(!text().includes("방문 완료") && !text().includes("0 / 30 조형물 완성"));

    await act(async () => { button("완성 모습 보기").props.onClick(); });
    assert.equal(previewState(), "complete");
    assert(slots().every(node => node.props["data-colored"] === true && node.props["data-visited"] === undefined));
    assert.equal(button("완성 모습 보기").props["aria-pressed"], true);
    assert(text().includes("완성 예시") && !text().includes("30 / 30 조형물 완성"));
    assert.equal(view.root.findAllByType("input").length, 0);
    assert(slots().every(node => /^\/places\/\d+$/.test(node.props.href)), "preview keeps public place links usable");
    await act(async () => { button("스티커 없이 보기").props.onClick(); });
    assert.equal(previewState(), "empty");
    assert(slots().every(node => node.props["data-colored"] === false));

    await act(async () => { button("완성 모습 보기").props.onClick(); view.update(tree("account-A")); });
    assert.equal(previewState(), undefined, "login replaces preview with actual account progress");
    assert.equal(slots().filter(node => node.props["data-colored"]).length, 1);
    assert.equal(slots().filter(node => node.props["data-visited"]).length, 1);
    assert.equal(view.root.findAllByType("button").length, 0, "no preview toggle in real progress");
    assert(text().includes("1 / 30 조형물 완성"));
    assert.equal(view.root.findAllByType("input").length, 1);
    await act(async () => { view.update(tree()); });
    assert.equal(previewState(), "empty", "logout returns to a fresh, empty preview, not personal stamps");
    assert(slots().every(node => !node.props["data-colored"]));
    assert(!text().includes("2024-09-18"));
    await act(async () => { view.update(tree(null, true)); });
    assert.equal(slots().length, 0, "no private map while checking authentication");
    await act(async () => { view.update(tree(null, false, "다시 시도해 주세요.")); });
    assert.equal(slots().length, 0, "authentication errors cannot expose private map children");
    assert.equal(view.root.findAllByType("input").length, 0);
    assert.equal(JSON.stringify(records), originalRecords, "preview never changes actual records");
    assert.equal(storageAccesses, 0);
    assert.equal(requests, 0);
  } finally {
    if (view) await act(async () => { view.unmount(); });
    globalThis.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "self");
  }
  console.log("PASS: 30-slot empty/complete guest preview, accessible toggle, no dates/storage/network/writes, real account progress and fresh logout preview");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
