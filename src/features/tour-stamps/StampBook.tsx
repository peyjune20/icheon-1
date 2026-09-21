"use client";
import { useState } from "react";
import { Place } from "@/domain/models/place";
import { TourStampRecord } from "./tour-stamps.storage";
import { TourStamp } from "./TourStamp";
import { TourMascot } from "./TourMascot";
import { COLLECTIONS } from "./VillageCollection";
import { todayInKorea } from "./visit-dates";
import Link from "next/link";
export { todayInKorea } from "./visit-dates";
export function StampBook({ places, stamps, onCreate, onRemove, disabled = false, feedbackPlaceId, message, signInRequired, loading, error, onRetry }: { places: Place[]; stamps: TourStampRecord[]; onCreate: (id: string, date: string) => void; onRemove: (id: string) => void; disabled?: boolean; feedbackPlaceId?: string | null; message?: string; signInRequired?: boolean; loading?: boolean; error?: string; onRetry?: () => void }) {
  const [dates, setDates] = useState<Record<string, string>>({});
  const stampMap = new Map(stamps.map(s => [s.placeId, s]));
  const groups = [...COLLECTIONS, { category: "OTHER", title: "우리 가족 탐험가" }];
  return <section id="stamp-book" className="mt-8 scroll-mt-28 rounded-[28px] border border-outline-variant/30 bg-surface-container-low p-5 sm:p-7">
    <p className="text-xs font-bold text-primary">TOUR STAMP BOOK</p><h2 className="mt-1 text-xl font-bold">테마별로 모아 보는 여행 스탬프</h2>
    <p className="mt-2 text-sm text-on-surface-variant">{places.filter(p => stampMap.has(p.id)).length} / {places.length}곳 방문 · 테마를 펼치면 방문 전 장소까지 모두 볼 수 있어요.</p>
    {(loading || error) && <p role="status" className="mt-3 rounded-xl bg-white p-3 text-sm text-primary">{loading ? "내 방문 기록을 불러오고 있어요…" : error} {!loading && error && <button type="button" onClick={onRetry} className="ml-2 font-bold underline">다시 불러오기</button>}</p>}
    <div className="mt-5 space-y-3">{groups.map(group => {
      const members = places.filter(p => p.category === group.category); if (!members.length) return null;
      return <details key={group.category} className="rounded-2xl bg-white p-4"><summary className="cursor-pointer text-sm font-bold">{group.title}<span className="ml-3 text-primary">{members.filter(p => stampMap.has(p.id)).length}/{members.length}</span><span className="float-right text-xs font-normal text-on-surface-variant">펼치기 / 접기</span></summary>
        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-5">{members.map(place => {
          const stamp = stampMap.get(place.id);
          return <div key={place.id} className="flex min-w-0 flex-col items-center gap-2">
            {stamp ? <TourStamp place={place} visitedAt={stamp.visitedAt} disabled={disabled} onRemove={() => onRemove(place.id)} /> : <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-2 border-dashed border-outline-variant bg-surface-container-low grayscale opacity-60"><TourMascot category={place.category} /><span className="mt-2 text-xs">방문 전</span></div>}
            <strong className="text-center text-xs">{place.name}</strong>
            <input type="date" disabled={disabled} aria-label={`${place.name} 방문 날짜`} max={todayInKorea()} value={dates[place.id] || stamp?.visitedAt.slice(0, 10) || todayInKorea()} onChange={e => setDates(d => ({ ...d, [place.id]: e.target.value }))} className="w-full max-w-36 rounded-lg border border-outline-variant/40 p-1.5 text-xs" />
            <button type="button" disabled={disabled} onClick={() => onCreate(place.id, dates[place.id] || stamp?.visitedAt.slice(0, 10) || todayInKorea())} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary disabled:opacity-50">{stamp ? "방문 날짜 수정" : "다녀왔어요"}</button>
            {feedbackPlaceId === place.id && message && <div role="status" className="w-full rounded-xl bg-surface-container-low p-3 text-center text-xs leading-5 text-secondary">{message}{signInRequired && <Link href="/account?returnTo=%2Fmy-trip%23stamp-book" className="mt-2 block rounded-full bg-primary px-3 py-2 font-bold text-white">로그인하고 스탬프 저장하기</Link>}</div>}
          </div>;
        })}</div>
      </details>;
    })}</div>
  </section>;
}
