import type { TourStampRecord } from "./tour-stamps.storage";

export const todayInKorea = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
export function isVisitDate(value: string, today = todayInKorea()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || value > today) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Old records used timestamps; preserve the day of the visit in Korea, not UTC.
export function legacyVisitsToImport(records: TourStampRecord[], allowedIds: string[], existing: TourStampRecord[]) {
  const allowed = new Set(allowedIds), saved = new Set(existing.map(record => record.placeId));
  const result = new Map<string, TourStampRecord>();
  for (const record of records) {
    if (!allowed.has(record.placeId) || saved.has(record.placeId)) continue;
    const instant = new Date(record.visitedAt);
    if (!Number.isFinite(instant.getTime())) continue;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(record.visitedAt)
      ? record.visitedAt : instant.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
    if (isVisitDate(date)) result.set(record.placeId, { placeId: record.placeId, visitedAt: date });
  }
  return [...result.values()];
}
