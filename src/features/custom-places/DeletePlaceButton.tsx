"use client";
import { useEffect, useRef, useState } from "react";
import { Place } from "@/domain/models/place";
import { ACCOUNT_CHANGED } from "@/lib/supabase";
import { friendlyError } from "@/lib/client-errors";
import { deleteCustomPlace } from "./account-repository";
import { PLACES_CHANGED } from "./use-places";
import { removeSavedPlace } from "@/features/saved-places/saved-places.storage";
import { removeTourStamp } from "@/features/tour-stamps/tour-stamps.storage";
import { readActiveCourse, writeActiveCourse } from "@/features/itinerary/active-course";

export function DeletePlaceButton({ place, onDeleted }: { place: Place; onDeleted?: () => void }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const generation = useRef(0), pending = useRef(false);
  useEffect(() => {
    const reset = () => { generation.current++; setMessage(""); };
    window.addEventListener(ACCOUNT_CHANGED, reset);
    return () => { generation.current++; window.removeEventListener(ACCOUNT_CHANGED, reset); };
  }, []);
  if (place.recommendationSource !== "USER_ADDED" || !place.id.startsWith("user-")) return null;
  const remove = async () => {
    if (pending.current || !window.confirm(`‘${place.name}’을 삭제할까요?\n이 장소에 남긴 방문 기록과 업로드한 사진도 함께 삭제되며 복구할 수 없어요.`)) return;
    pending.current = true; setBusy(true); setMessage("");
    const current = generation.current;
    try {
      await deleteCustomPlace(place.id);
      if (current !== generation.current) return;
      // Local drafts/bookmarks must not keep links to a deleted personal place.
      try {
        removeSavedPlace(place.id); removeTourStamp(place.id);
        const plan = readActiveCourse();
        if (plan) {
          const ids = plan.ids.filter(id => id !== place.id);
          const query = new URLSearchParams(plan.query); query.set("stops", ids.join(","));
          writeActiveCourse({ ids, query: query.toString() });
        }
      } catch (error) { console.error("Deleted place local cleanup failed", error); }
      setMessage("내 장소와 연결된 방문 기록·사진을 삭제했어요.");
      window.dispatchEvent(new Event(PLACES_CHANGED));
      onDeleted?.();
    } catch (error) {
      if (current === generation.current) setMessage(friendlyError(error, "장소 삭제를 완료하지 못했어요. 일부 사진이 먼저 삭제되었을 수 있어요. 다시 시도해 주세요."));
    } finally { pending.current = false; setBusy(false); }
  };
  return <div><button type="button" disabled={busy} onClick={remove} aria-label={`${place.name} 내 장소 삭제`} className="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary disabled:opacity-50"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">delete_outline</span>{busy ? "삭제 중…" : "내 장소 삭제"}</button>{message && <p role="status" className="mt-2 text-xs text-primary">{message}</p>}</div>;
}
