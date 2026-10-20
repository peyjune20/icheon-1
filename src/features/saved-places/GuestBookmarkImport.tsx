"use client";

import { useState } from "react";
import type { Place } from "@/domain/models/place";
import { useSavedPlaces } from "./use-saved-places";

export function GuestBookmarkImport({ places }: { places: Place[] }) {
  const bookmarks = useSavedPlaces();
  const [selected, setSelected] = useState<string[]>([]);
  const pending = places.filter(place => bookmarks.guestIds.includes(place.id) && !bookmarks.ids.includes(place.id));
  if (!bookmarks.owner || bookmarks.status !== "ready" || !pending.length) return null;
  const selectedIds = selected.filter(id => pending.some(place => place.id === id));
  return <details className="mt-4 rounded-2xl bg-surface-container-low p-4 text-sm">
    <summary className="cursor-pointer font-bold">이 브라우저의 임시 찜 {pending.length}곳을 내 계정으로 가져올까요?</summary>
    <p className="mt-3 text-on-surface-variant">공용 PC의 다른 사람이 남긴 찜일 수 있어요. 본인의 기록인 장소만 선택해 주세요. 자동으로 합치지 않으며, 복사 후에도 임시 찜 원본은 유지됩니다.</p>
    <fieldset disabled={bookmarks.busy} className="mt-3 space-y-2">
      <legend className="sr-only">내 계정에 복사할 임시 찜 선택</legend>
      {pending.map(place => <label key={place.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
        <input type="checkbox" checked={selectedIds.includes(place.id)} onChange={event => setSelected(previous => event.target.checked ? [...previous, place.id] : previous.filter(id => id !== place.id))} className="h-4 w-4 accent-primary" />
        <span>{place.name}</span>
      </label>)}
    </fieldset>
    <button type="button" disabled={bookmarks.busy || !selectedIds.length} onClick={async () => {
      if (await bookmarks.importGuest(selectedIds)) setSelected([]);
    }} className="mt-3 rounded-full bg-primary/10 px-4 py-2 font-bold text-primary disabled:opacity-50">
      {bookmarks.busy ? "복사 중…" : `선택한 임시 찜 ${selectedIds.length}곳을 내 계정에 복사`}
    </button>
  </details>;
}
