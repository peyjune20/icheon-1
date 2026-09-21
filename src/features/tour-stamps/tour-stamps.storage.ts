export interface TourStampRecord {
  placeId: string;
  visitedAt: string;
}

export const TOUR_STAMPS_KEY = "icheon-bebe-road:tour-stamps";
export const TOUR_STAMPS_CHANGED_EVENT = "icheon-bebe-road:tour-stamps-changed";

function readTourStamps(): TourStampRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(TOUR_STAMPS_KEY);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(parsedValue)) return [];

    const stamps = parsedValue.filter(
      (stamp): stamp is TourStampRecord =>
        typeof stamp === "object" &&
        stamp !== null &&
        typeof (stamp as TourStampRecord).placeId === "string" &&
        typeof (stamp as TourStampRecord).visitedAt === "string" && Number.isFinite(Date.parse((stamp as TourStampRecord).visitedAt)),
    );

    return [...new Map(stamps.map((stamp) => [stamp.placeId, stamp])).values()];
  } catch {
    return [];
  }
}

function writeTourStamps(stamps: TourStampRecord[]) {
  window.localStorage.setItem(TOUR_STAMPS_KEY, JSON.stringify(stamps));
  window.dispatchEvent(new Event(TOUR_STAMPS_CHANGED_EVENT));
}

export function getTourStamps(): TourStampRecord[] {
  return readTourStamps();
}

export function createTourStamp(placeId: string, visitedAt = new Date().toISOString()): TourStampRecord[] {
  const stamps = readTourStamps();
  const nextStamps = [...stamps.filter(stamp => stamp.placeId !== placeId), { placeId, visitedAt }];
  writeTourStamps(nextStamps);
  return nextStamps;
}

export function removeTourStamp(placeId: string): TourStampRecord[] {
  const nextStamps = readTourStamps().filter((stamp) => stamp.placeId !== placeId);
  writeTourStamps(nextStamps);
  return nextStamps;
}
