"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import { getSavedPlaceIds, removeSavedPlace, SAVED_PLACES_CHANGED_EVENT } from "@/features/saved-places/saved-places.storage";
import { createTourStamp, getTourStamps, removeTourStamp, TourStampRecord, TOUR_STAMPS_CHANGED_EVENT } from "@/features/tour-stamps/tour-stamps.storage";
import { usePlaces } from "@/features/custom-places/use-places";
import { placeDetailHref } from "@/features/custom-places/place-links";
import { VillageCollection } from "@/features/tour-stamps/VillageCollection";
import { StampBook, todayInKorea } from "@/features/tour-stamps/StampBook";
import { readSavedPlan } from "@/features/custom-places/account-repository";
import { ACCOUNT_CHANGED } from "@/lib/supabase";

export default function MyTripPage() {
  const { places, error } = usePlaces(); const [savedIds, setSavedIds] = useState<string[]>([]); const [stamps, setStamps] = useState<TourStampRecord[]>([]);
  const [message, setMessage] = useState("");
  const [planLink, setPlanLink] = useState("");
  useEffect(() => { let version = 0; const sync = () => { const current = ++version; setPlanLink(""); readSavedPlan().then(plan => { if (current !== version || !plan?.ids?.length) return; const query = new URLSearchParams(plan.query); query.set("stops", plan.ids.join(",")); setPlanLink(`/itinerary?${query}`); }).catch(() => {}); }; sync(); window.addEventListener(ACCOUNT_CHANGED, sync); return () => { version++; window.removeEventListener(ACCOUNT_CHANGED, sync); }; }, []);
  useEffect(() => {
    const sync = () => { setSavedIds(getSavedPlaceIds()); setStamps(getTourStamps()); };
    sync(); window.addEventListener(SAVED_PLACES_CHANGED_EVENT, sync); window.addEventListener(TOUR_STAMPS_CHANGED_EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, sync); window.removeEventListener(TOUR_STAMPS_CHANGED_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const saveStamp = (id: string, date: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayInKorea() || !Number.isFinite(Date.parse(date))) { setMessage("오늘 이전의 올바른 방문 날짜를 선택해 주세요."); return; }
    setStamps(createTourStamp(id, new Date(date + "T12:00:00+09:00").toISOString())); setMessage("방문 기록을 저장했어요. 마을 조형물도 색칠됐어요.");
  };
  const removeStamp = (id: string) => { setStamps(removeTourStamp(id)); setMessage("스탬프를 해제했어요. 언제든 다시 남길 수 있어요."); };
  const saved = places.filter(p => savedIds.includes(p.id)); const count = places.filter(p => stamps.some(s => s.placeId === p.id)).length;
  return <div className="min-h-screen bg-surface text-on-surface"><main className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:pt-32">
    <section className="rounded-[28px] bg-secondary p-6 text-white sm:p-8"><p className="text-xs font-bold text-white/80">MY ICHEON TOUR</p><h1 className="mt-3 text-3xl font-bold">나의 이천 베베 투어</h1><p className="mt-3 text-sm text-white/85">찜한 장소 {saved.length}곳 · 다녀온 장소 {count}곳. 작은 방문이 모여 컬러풀한 마을이 돼요.</p></section>
    <Link href="/account" className="mt-4 inline-block text-sm font-bold text-primary underline">내 기록 로그인 · 계정 관리</Link>
    {(message || error) && <p role="status" className="mt-4 text-sm text-primary">{message || error}</p>}
    {planLink && <Link href={planLink} className="mt-5 block rounded-2xl border bg-white p-5 font-bold text-secondary">저장한 우리 가족 코스 이어보기 →</Link>}
    <VillageCollection places={places.filter(p => p.recommendationSource !== "USER_ADDED")} stamps={stamps} />
    <StampBook places={places} stamps={stamps} onCreate={saveStamp} onRemove={removeStamp} />
    <p className="mt-3 text-xs text-on-surface-variant">기존 찜·스탬프는 이 브라우저에 보관됩니다. 새로 추가한 장소와 방문 사진은 로그인 계정에 저장됩니다.</p>
    <section className="mt-10"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">다음 투어에 담아둔 장소</h2><Link href="/places" className="text-sm font-bold text-primary">장소 더 찾아보기 →</Link></div>
      {!saved.length && <p className="mt-5 rounded-2xl bg-white p-8 text-center text-sm">아직 찜한 장소가 없어요. 장소 탐색에서 마음에 드는 곳을 담아보세요.</p>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">{saved.map(place => <article key={place.id} className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-white p-4">
        {place.thumbnailImage && <Link href={placeDetailHref(place)}><img src={place.thumbnailImage} alt={place.name} className="h-24 w-24 rounded-xl object-cover" /></Link>}
        <div className="min-w-0 flex-1"><Link href={placeDetailHref(place)} className="font-bold">{place.name} →</Link><p className="mt-1 text-xs text-on-surface-variant">{place.address}</p><div className="mt-3 flex flex-wrap gap-3"><button onClick={() => stamps.some(s => s.placeId === place.id) ? removeStamp(place.id) : saveStamp(place.id, todayInKorea())} className="text-xs font-bold text-primary">{stamps.some(s => s.placeId === place.id) ? "스탬프 해제" : "오늘 다녀왔어요"}</button><button onClick={() => setSavedIds(removeSavedPlace(place.id))} className="text-xs text-on-surface-variant underline">찜 취소</button></div></div>
      </article>)}</div>
    </section>
  </main><BottomNavBar activeTab="mytrip" /></div>;
}
