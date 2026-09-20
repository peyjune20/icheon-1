"use client";
import { useEffect, useState } from "react";
import { Place } from "@/domain/models/place";
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";
export const PLACES_CHANGED = "bebe-custom-places-changed";
export async function fetchCustomPlaces(): Promise<Place[]> {
  const response = await fetch("/api/places", { cache: "no-store" });
  if (response.status === 401 || response.status === 404) return [];
  if (!response.ok) throw new Error("내 장소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  return response.json();
}
export function usePlaces() {
  const [places, setPlaces] = useState(SEED_PLACES);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const sync = () => fetchCustomPlaces().then(custom => { if (active) { setPlaces([...SEED_PLACES, ...custom]); setError(""); } }).catch(e => { if (active) setError(e.message); });
    sync(); window.addEventListener(PLACES_CHANGED, sync);
    return () => { active = false; window.removeEventListener(PLACES_CHANGED, sync); };
  }, []);
  return { places, error };
}
