"use client";
import { useEffect, useState } from "react";
import { Place } from "@/domain/models/place";
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";
import { listCustomPlaces } from "./account-repository";
import { ACCOUNT_CHANGED } from "@/lib/supabase";
import { friendlyError } from "@/lib/client-errors";
export const PLACES_CHANGED = "bebe-custom-places-changed";
export async function fetchCustomPlaces(): Promise<Place[]> {
  return listCustomPlaces();
}
export function usePlaces() {
  const [places, setPlaces] = useState(SEED_PLACES);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let generation = 0;
    const sync = () => { const current = ++generation; setPlaces(SEED_PLACES); fetchCustomPlaces().then(custom => { if (active && current === generation) { setPlaces([...SEED_PLACES, ...custom]); setError(""); } }).catch(e => { if (active && current === generation) setError(friendlyError(e, "내 장소를 불러오지 못했어요. 다시 시도해 주세요.")); }); };
    sync(); window.addEventListener(PLACES_CHANGED, sync); window.addEventListener(ACCOUNT_CHANGED, sync);
    return () => { active = false; window.removeEventListener(PLACES_CHANGED, sync); window.removeEventListener(ACCOUNT_CHANGED, sync); };
  }, []);
  return { places, error };
}
