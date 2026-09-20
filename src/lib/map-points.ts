import { searchKakaoPlaces } from "./kakao-maps";
export interface MapPoint { id: string; name: string; lat: number; lng: number; address?: string; coordinateSource?: string; }
const aliases: Record<string, string> = { "1": "미솥지음", "2": "모가의숲", "5": "베이커리 을를", "10": "예스파크", "13": "경기도자미술관", "18": "에덴파라다이스호텔", "25": "도드람산 주차장" };
const normalize = (s: string) => s.replace(/\s|\([^)]*\)/g, "").toLowerCase();
const cache = new Map<string, Promise<MapPoint>>();
export function resolveMapPoint(point: MapPoint): Promise<MapPoint> {
  if (point.id === "gps" || point.id.startsWith("user-") || point.coordinateSource?.startsWith("Kakao")) return Promise.resolve(point);
  const key = [point.id, point.name, point.address].join("|");
  const cached = cache.get(key); if (cached) return cached;
  const pending = (async () => {
    const name = aliases[point.id] || point.name;
    const results = await searchKakaoPlaces("이천 " + name);
    const normalizedName = normalize(name);
    const matches = results.filter(p => p.address.includes("이천시") && (normalize(p.name).includes(normalizedName) || normalizedName.includes(normalize(p.name))));
    // Do not silently pick an unrelated place or a different branch.
    const address = point.address?.replace(/^경기도?\s*/, "");
    const exactAddress = matches.filter(p => address && p.address.replace(/^경기도?\s*/, "") === address);
    const match = exactAddress.length === 1 ? exactAddress[0] : matches.length === 1 ? matches[0] : undefined;
    if (!match) cache.delete(key);
    return match ? { ...point, address: match.address, lat: match.lat, lng: match.lng, coordinateSource: "Kakao Places · " + match.id } : point;
  })().catch(() => { cache.delete(key); return point; });
  cache.set(key, pending); return pending;
}
export const isLocated = (p: MapPoint) => !!p.coordinateSource && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180;
// Dodramsan's researched point is a summit, never a car destination. Resolve its parking POI first.
export const isCarDestination = (p: MapPoint) => isLocated(p) && (p.id !== "25" || !!p.coordinateSource?.startsWith("Kakao Places"));
export function kakaoCarUrl(points: MapPoint[]) {
  if (!points.length || points.some(p => !isCarDestination(p))) return null;
  if (points.length === 1) return "https://map.kakao.com/link/to/" + encodeURIComponent(points[0].name) + "," + points[0].lat + "," + points[0].lng;
  if (points.length > 7) throw new Error("Kakao supports at most five waypoints per link.");
  return "https://map.kakao.com/link/by/car/" + points.map(p => encodeURIComponent(p.name) + "," + p.lat + "," + p.lng).join("/");
}
// Seven points = origin + five waypoints + destination. Next leg shares its origin.
export function splitCarCourse(points: MapPoint[]) {
  if (points.length <= 1) return [points];
  const sections: MapPoint[][] = [];
  for (let i = 0; i < points.length - 1; i += 6) sections.push(points.slice(i, i + 7));
  return sections;
}
export const kakaoSearchUrl = (p: MapPoint) => "https://map.kakao.com/link/search/" + encodeURIComponent((p.id.startsWith("user-") ? "" : "이천 ") + (aliases[p.id] || p.name));
