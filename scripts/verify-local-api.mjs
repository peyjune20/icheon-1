import assert from "node:assert/strict";
// This test may create/delete ONLY its synthetic records in the local preview.
const base = "http://127.0.0.1:3001";
const owner = `local-test-${Date.now()}`;
async function call(path, method = "GET", body, identity = owner, origin = base) {
  const headers = { "oai-authenticated-user-id": identity, Origin: origin };
  if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  return fetch(base + path, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
}
let id, photo;
try {
  assert.equal((await fetch(base + "/api/places")).status, 401);
  assert.equal((await call("/api/places", "POST", {}, owner, "https://example.com")).status, 403);
  assert.equal((await call("/api/places", "POST", { name: "x" })).status, 400);
  const created = await call("/api/places", "POST", { name: "개발 검증용 장소", address: "경기 이천시 테스트 주소", lat: 37.28, lng: 127.43, category: "PARK" });
  assert.equal(created.status, 201); id = (await created.json()).id;
  assert((await (await call("/api/places")).json()).some(p => p.id === id));
  assert.equal((await call(`/api/places/${id}`, "DELETE", undefined, owner + "-other")).status, 404);
  assert.equal((await call(`/api/photos?placeId=${id}`, "GET", undefined, owner + "-other")).status, 404);
  const form = new FormData();
  form.set("photo", new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1kAAAAASUVORK5CYII=", "base64")], { type: "image/png" }), "synthetic-test.png");
  form.set("caption", "자동 검증 데이터");
  const uploaded = await call(`/api/photos?placeId=${id}`, "POST", form);
  assert.equal(uploaded.status, 201); photo = (await uploaded.json()).id;
  assert.equal((await call(`/api/photos/${photo}`)).status, 200);
  assert.equal((await call(`/api/photos/${photo}`, "GET", undefined, owner + "-other")).status, 404);
  assert.equal((await call("/api/plan", "PUT", { ids: [id, "3"], query: "age=60&weather=RAIN" })).status, 200);
  assert.deepEqual((await (await call("/api/plan")).json()).ids, [id, "3"]);
  assert.equal(await (await call("/api/plan", "GET", undefined, owner + "-other")).json(), null);
  const bad = new FormData(); bad.set("photo", new Blob(["not a png"], { type: "image/png" }), "bad.png");
  assert.equal((await call(`/api/photos?placeId=${id}`, "POST", bad)).status, 400);
  const large = await fetch(base + "/api/plan", { method: "PUT", headers: { Origin: base, "oai-authenticated-user-id": owner }, body: "a".repeat(17000) });
  assert.equal(large.status, 413);
  console.log("PASS: authentication, CSRF, custom place CRUD, cross-owner isolation, R2 upload/read, invalid upload, plan persistence, request bounds");
} finally {
  if (photo) assert.equal((await call(`/api/photos/${photo}`, "DELETE")).status, 200);
  if (id) assert.equal((await call(`/api/places/${id}`, "DELETE")).status, 200);
  await call("/api/plan", "PUT", { ids: [], query: "" });
}
