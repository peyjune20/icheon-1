// Keep the legacy key: these are browser-only guest bookmarks, never account data.
export const SAVED_PLACE_IDS_KEY = "icheon-bebe-road:saved-place-ids";

export const SAVED_PLACES_CHANGED_EVENT = "icheon-bebe-road:saved-places-changed";

function readSavedPlaceIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const savedValue = window.localStorage.getItem(SAVED_PLACE_IDS_KEY);
    const parsedValue: unknown = savedValue ? JSON.parse(savedValue) : [];

    if (!Array.isArray(parsedValue)) return [];

    return [...new Set(parsedValue.filter((id): id is string => typeof id === "string"))];
  } catch {
    return [];
  }
}

function writeSavedPlaceIds(placeIds: string[]) {
  window.localStorage.setItem(SAVED_PLACE_IDS_KEY, JSON.stringify(placeIds));
  window.dispatchEvent(new Event(SAVED_PLACES_CHANGED_EVENT));
}

export function getGuestSavedPlaceIds(): string[] {
  return readSavedPlaceIds();
}

export function saveGuestPlace(placeId: string): string[] {
  const placeIds = readSavedPlaceIds();
  const nextPlaceIds = placeIds.includes(placeId) ? placeIds : [...placeIds, placeId];
  writeSavedPlaceIds(nextPlaceIds);
  return nextPlaceIds;
}

export function removeGuestSavedPlace(placeId: string): string[] {
  const nextPlaceIds = readSavedPlaceIds().filter((id) => id !== placeId);
  writeSavedPlaceIds(nextPlaceIds);
  return nextPlaceIds;
}
