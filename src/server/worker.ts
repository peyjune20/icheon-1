import { z } from "zod";
import { makeCustomPlace } from "../features/custom-places/custom-place";

// Legacy Sites-only API, retained to avoid deleting existing D1/R2 user records.
// The current frontend uses Supabase directly on BOTH Vercel and Sites.
// This Worker is not a Vercel Function and must never be proxied using a client-supplied identity.
interface Statement { bind(...values: unknown[]): Statement; first<T = Record<string, unknown>>(): Promise<T | null>; all<T = Record<string, unknown>>(): Promise<{ results: T[] }>; run(): Promise<unknown>; }
interface Env {
  DB: { prepare(sql: string): Statement; batch(queries: Statement[]): Promise<unknown> };
  BUCKET: { put(key: string, body: ArrayBuffer, options?: unknown): Promise<unknown>; get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>; delete(keys: string | string[]): Promise<void> };
  ASSETS: { fetch(request: Request): Promise<Response> };
  KAKAO_MAP_KEY?: string; KAKAO_REST_API_KEY?: string;
}
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
const placeInput = z.object({ name: z.string().trim().min(1).max(100), address: z.string().trim().min(3).max(250), lat: z.number().min(33).max(39), lng: z.number().min(124).max(132), category: z.enum(["RESTAURANT", "CAFE", "NATURE", "PARK", "EXPERIENCE", "INDOOR", "OTHER"]) });
const getDB = (env: Env) => { if (!env.DB) throw new Error("Storage unavailable"); return env.DB; };
async function ownsPlace(env: Env, owner: string, id: string) {
  if (/^([1-9]|[12]\d|30)$/.test(id)) return true;
  return !!await getDB(env).prepare("SELECT id FROM custom_places WHERE id = ? AND owner_id = ?").bind(id, owner).first();
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const owner = request.headers.get("oai-authenticated-user-id");
    if (url.pathname === "/api/config") return json({ authenticated: !!owner, kakaoMapKey: env.KAKAO_MAP_KEY || "" });
    if (!owner) return json({ error: "장소와 사진을 저장하려면 로그인해 주세요.", signIn: true }, 401);
    if (!["GET", "HEAD"].includes(request.method) && request.headers.get("Origin") !== url.origin) return json({ error: "허용되지 않은 요청입니다." }, 403);
    try {
      if (!["GET", "HEAD", "DELETE"].includes(request.method) && request.body) {
        const limit = url.pathname === "/api/photos" ? 5_300_000 : 16_384;
        const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
        while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > limit) { await reader.cancel(); return json({ error: "업로드 용량을 초과했어요." }, 413); } chunks.push(value); }
        const body = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
        request = new Request(request.url, { method: request.method, headers: request.headers, body });
      }
      const db = getDB(env);
      if (url.pathname === "/api/places" && request.method === "GET") {
        const rows = await db.prepare("SELECT data FROM custom_places WHERE owner_id = ? ORDER BY created_at DESC").bind(owner).all<{ data: string }>();
        return json(rows.results.map(row => JSON.parse(row.data)));
      }
      if (url.pathname === "/api/places" && request.method === "POST") {
        if (Number(request.headers.get("Content-Length")) > 10000) return json({ error: "입력이 너무 길어요." }, 413);
        const input = placeInput.safeParse(await request.json());
        if (!input.success) return json({ error: "장소명, 주소, 국내 좌표와 테마를 확인해 주세요." }, 400);
        const count = await db.prepare("SELECT count(*) AS n FROM custom_places WHERE owner_id = ?").bind(owner).first<{ n: number }>();
        if ((count?.n || 0) >= 100) return json({ error: "직접 추가 장소는 최대 100곳까지 저장할 수 있어요." }, 409);
        const place = makeCustomPlace({ ...input.data, id: `user-${crypto.randomUUID()}` });
        await db.prepare("INSERT INTO custom_places (id, owner_id, data, created_at) VALUES (?, ?, ?, ?)").bind(place.id, owner, JSON.stringify(place), new Date().toISOString()).run();
        return json(place, 201);
      }
      const placeDelete = url.pathname.match(/^\/api\/places\/(user-[\w-]+)$/);
      if (placeDelete && request.method === "DELETE") {
        const id = placeDelete[1];
        if (!await ownsPlace(env, owner, id)) return json({ error: "장소를 찾지 못했어요." }, 404);
        const photos = await db.prepare("SELECT object_key FROM place_photos WHERE owner_id = ? AND place_id = ?").bind(owner, id).all<{ object_key: string }>();
        if (photos.results.length) await env.BUCKET.delete(photos.results.map(p => p.object_key));
        await db.batch([
          db.prepare("DELETE FROM place_photos WHERE owner_id = ? AND place_id = ?").bind(owner, id),
          db.prepare("DELETE FROM custom_places WHERE owner_id = ? AND id = ?").bind(owner, id),
        ]);
        return json({ ok: true });
      }
      if (url.pathname === "/api/search" && request.method === "GET") {
        const q = url.searchParams.get("q")?.trim();
        if (!q || q.length < 2 || q.length > 100) return json({ error: "두 글자 이상 검색해 주세요." }, 400);
        if (!env.KAKAO_REST_API_KEY) {
          // Explicit button searches only, cached for a day; global lock enforces Nominatim's 1 request/second policy.
          const cached = await db.prepare("SELECT data, updated_at FROM search_cache WHERE query = ?").bind(q).first<{ data: string; updated_at: string }>();
          if (cached && Date.now() - Date.parse(cached.updated_at) < 86400000) return json(JSON.parse(cached.data));
          const now = new Date().toISOString(); const cutoff = new Date(Date.now() - 1100).toISOString();
          const lock = await db.prepare("INSERT INTO search_lock (id, last_at) VALUES ('nominatim', ?) ON CONFLICT(id) DO UPDATE SET last_at = excluded.last_at WHERE last_at < ? RETURNING id").bind(now, cutoff).first();
          if (!lock) return json({ error: "검색 요청이 많아요. 2초 뒤 다시 검색해 주세요." }, 429);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=kr&limit=8&accept-language=ko&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": "IcheonBebeRoad/1.0 (https://icheon-bebe-road.grayngell.chatgpt.site)" }, signal: AbortSignal.timeout(8000) });
          if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) return json({ error: "지도 검색이 잠시 어려워요. 카카오맵 검색 후 직접 입력도 가능해요." }, 502);
          const data = await response.json() as { place_id: number; name: string; display_name: string; lat: string; lon: string }[];
          const result = data.map(p => ({ id: String(p.place_id), name: p.name || q, address: p.display_name, lat: Number(p.lat), lng: Number(p.lon) }));
          await db.prepare("INSERT INTO search_cache (query, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(query) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(q, JSON.stringify(result), now).run();
          return json(result);
        }
        const upstream = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=10`, { headers: { Authorization: `KakaoAK ${env.KAKAO_REST_API_KEY}` }, signal: AbortSignal.timeout(8000) });
        if (!upstream.ok || !upstream.headers.get("Content-Type")?.includes("application/json")) return json({ error: "장소 검색이 일시적으로 어려워요. 잠시 후 다시 시도해 주세요." }, 502);
        const data = await upstream.json() as { documents: { id: string; place_name: string; road_address_name: string; address_name: string; y: string; x: string }[] };
        return json(data.documents.map(p => ({ id: p.id, name: p.place_name, address: p.road_address_name || p.address_name, lat: Number(p.y), lng: Number(p.x) })));
      }
      if (url.pathname === "/api/plan") {
        if (request.method === "GET") {
          const row = await db.prepare("SELECT data FROM plans WHERE owner_id = ?").bind(owner).first<{ data: string }>();
          return json(row ? JSON.parse(row.data) : null);
        }
        if (request.method === "PUT") {
          const input = z.object({ query: z.string().max(2000), ids: z.array(z.string().max(80)).max(30) }).safeParse(await request.json());
          if (!input.success) return json({ error: "코스 정보가 올바르지 않아요." }, 400);
          await db.prepare("INSERT INTO plans (owner_id, data) VALUES (?, ?) ON CONFLICT(owner_id) DO UPDATE SET data = excluded.data").bind(owner, JSON.stringify(input.data)).run();
          return json({ ok: true });
        }
      }
      if (url.pathname === "/api/photos") {
        const placeId = url.searchParams.get("placeId") || "";
        if (!await ownsPlace(env, owner, placeId)) return json({ error: "장소를 찾지 못했어요." }, 404);
        if (request.method === "GET") {
          const rows = await db.prepare("SELECT id, caption, created_at AS createdAt FROM place_photos WHERE owner_id = ? AND place_id = ? ORDER BY created_at DESC").bind(owner, placeId).all();
          return json(rows.results);
        }
        if (request.method === "POST") {
          if (Number(request.headers.get("Content-Length")) > 5_300_000) return json({ error: "사진은 5MB 이하로 올려 주세요." }, 413);
          const form = await request.formData(); const file = form.get("photo");
          if (!(file instanceof File) || file.size > 5_242_880 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return json({ error: "5MB 이하 JPG, PNG, WebP 사진만 올릴 수 있어요." }, 400);
          const bytes = await file.arrayBuffer(); const b = new Uint8Array(bytes);
          const valid = file.type === "image/jpeg" ? b[0] === 255 && b[1] === 216 && b[2] === 255 : file.type === "image/png" ? b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 : new TextDecoder().decode(b.slice(0, 4)) === "RIFF" && new TextDecoder().decode(b.slice(8, 12)) === "WEBP";
          if (!valid) return json({ error: "유효한 이미지 파일이 아니에요." }, 400);
          const count = await db.prepare("SELECT count(*) AS n FROM place_photos WHERE owner_id = ? AND place_id = ?").bind(owner, placeId).first<{ n: number }>();
          if ((count?.n || 0) >= 20) return json({ error: "한 장소에 사진 20장까지 저장할 수 있어요." }, 409);
          const id = crypto.randomUUID(); const objectKey = `visits/${id}`;
          const caption = String(form.get("caption") || "").slice(0, 200); const createdAt = new Date().toISOString();
          await env.BUCKET.put(objectKey, bytes, { httpMetadata: { contentType: file.type } });
          try { await db.prepare("INSERT INTO place_photos (id, owner_id, place_id, object_key, caption, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, owner, placeId, objectKey, caption, createdAt).run(); }
          catch (error) { await env.BUCKET.delete(objectKey); throw error; }
          return json({ id, caption, createdAt }, 201);
        }
      }
      const photoId = url.pathname.match(/^\/api\/photos\/([\w-]+)$/)?.[1];
      if (photoId) {
        const row = await db.prepare("SELECT object_key FROM place_photos WHERE id = ? AND owner_id = ?").bind(photoId, owner).first<{ object_key: string }>();
        if (!row) return json({ error: "사진을 찾지 못했어요." }, 404);
        if (request.method === "DELETE") {
          await env.BUCKET.delete(row.object_key);
          await db.prepare("DELETE FROM place_photos WHERE id = ? AND owner_id = ?").bind(photoId, owner).run();
          return json({ ok: true });
        }
        if (request.method === "GET") {
          const object = await env.BUCKET.get(row.object_key);
          if (!object) return json({ error: "사진을 찾지 못했어요." }, 404);
          return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
        }
      }
      return json({ error: "지원하지 않는 요청입니다." }, 404);
    } catch (error) { console.error("Site API failure", error instanceof Error ? error.message : "unknown"); return json({ error: "저장소 연결이 원활하지 않아요. 입력을 유지한 채 잠시 후 다시 시도해 주세요." }, 503); }
  },
};
