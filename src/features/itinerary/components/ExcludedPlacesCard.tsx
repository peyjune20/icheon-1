"use client";
import { useState } from "react";
import Link from "next/link";
import { ExcludedPlace } from "@/domain/models/itinerary";
import { Place } from "@/domain/models/place";
import { placeDetailHref } from "@/features/custom-places/place-links";

export function ExcludedPlacesCard({ excludedPlaces, onAdd }: { excludedPlaces: ExcludedPlace[]; onAdd: (place: Place) => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  if (!excludedPlaces.length) return null;
  const candidates = excludedPlaces.filter(({ place }) => `${place.name} ${place.address}`.includes(query));
  return <details className="mb-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5" data-testid="add-place-accordion">
    <summary className="cursor-pointer text-base font-bold">우리 가족 코스에 장소 추가하기 <span className="ml-2 text-sm font-medium text-secondary">후보 {excludedPlaces.length}곳</span></summary>
    <p className="mt-3 text-sm text-on-surface-variant">아래 장소를 추가하면 체류·이동시간을 다시 계산해요. 휴무·날씨 조건이 있는 곳은 안내를 먼저 확인해 주세요.</p>
    <input aria-label="추가할 장소 검색" placeholder="이름 또는 주소 검색" value={query} onChange={e => setQuery(e.target.value)} className="mt-4 w-full rounded-xl border bg-white p-3 text-sm" />
    {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
    <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">
      {candidates.map(({ place, reason, tag }) => <div key={place.id} className="rounded-xl bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div><Link href={placeDetailHref(place)} className="font-bold hover:text-primary">{place.name} ↗</Link><p className="mt-1 text-xs text-secondary">{tag}</p></div>
          <button type="button" disabled={busy !== null || !!place.unavailableReason} onClick={async () => { setBusy(place.id); setError(""); try { await onAdd(place); } catch (e) { setError(e instanceof Error ? e.message : "추가하지 못했어요. 다시 시도해 주세요."); } finally { setBusy(null); } }} className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy === place.id ? "추가 중" : "+ 코스에 추가"}</button>
        </div><p className="mt-2 text-sm leading-6 text-on-surface-variant">{reason.replace(/^[A-Z_]+\s*/, "")}</p>
      </div>)}
      {!candidates.length && <p className="p-4 text-sm">찾는 장소가 없어요. 장소 탐색에서 새 장소를 추가해 보세요.</p>}
    </div>
    <Link href="/places#add-place" className="mt-4 inline-block text-sm font-bold text-primary">목록에 없는 장소 검색·등록하기 →</Link>
  </details>;
}
