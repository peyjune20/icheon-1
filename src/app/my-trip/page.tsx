"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import { getSavedPlaceIds, removeSavedPlace, SAVED_PLACES_CHANGED_EVENT } from "@/features/saved-places/saved-places.storage";
import { useVisitRecords } from "@/features/tour-stamps/use-visit-records";
import { usePlaces } from "@/features/custom-places/use-places";
import { placeDetailHref } from "@/features/custom-places/place-links";
import { VillageCollection } from "@/features/tour-stamps/VillageCollection";
import { StampBook, todayInKorea } from "@/features/tour-stamps/StampBook";
import { readSavedPlan } from "@/features/custom-places/account-repository";
import { ACCOUNT_CHANGED } from "@/lib/supabase";
import { DeletePlaceButton } from "@/features/custom-places/DeletePlaceButton";
import { VisitorPhotos } from "@/features/place-detail/components/VisitorPhotos";

export default function MyTripPage() {
  const [showPhotos, setShowPhotos] = useState(false), [deleteMessage, setDeleteMessage] = useState("");
  useEffect(() => { if (new URLSearchParams(window.location.search).get("deleted") === "place") setDeleteMessage("내 장소와 연결된 방문 기록·사진을 삭제했어요."); }, []);
  const { places, error } = usePlaces(); const [savedIds, setSavedIds] = useState<string[]>([]);
  const visits = useVisitRecords(places.map(place => place.id));
  const { stamps, message, save: saveStamp, remove: removeStamp } = visits;
  const visitsDisabled = visits.loading || visits.busy || !!visits.error;
  const [planLink, setPlanLink] = useState("");
  useEffect(() => { let version = 0; const sync = () => { const current = ++version; setPlanLink(""); readSavedPlan().then(plan => { if (current !== version || !plan?.ids?.length) return; const query = new URLSearchParams(plan.query); query.set("stops", plan.ids.join(",")); setPlanLink(`/itinerary?${query}`); }).catch(() => {}); }; sync(); window.addEventListener(ACCOUNT_CHANGED, sync); return () => { version++; window.removeEventListener(ACCOUNT_CHANGED, sync); }; }, []);
  useEffect(() => {
    const sync = () => { setSavedIds(getSavedPlaceIds()); };
    sync(); window.addEventListener(SAVED_PLACES_CHANGED_EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const saved = places.filter(p => savedIds.includes(p.id)); const count = places.filter(p => stamps.some(s => s.placeId === p.id)).length;
  return <div className="min-h-screen bg-surface text-on-surface"><main className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:pt-32">
    <section className="rounded-[28px] bg-secondary p-6 text-white sm:p-8"><p className="text-xs font-bold text-white/80">MY ICHEON TOUR</p><h1 className="mt-3 text-3xl font-bold">나의 이천 베베 투어</h1><p className="mt-3 text-sm text-white/85">찜한 장소 {saved.length}곳 · 다녀온 장소 {count}곳. 작은 방문이 모여 컬러풀한 마을이 돼요.</p></section>
    <Link href="/account" className="mt-4 inline-block text-sm font-bold text-primary underline">내 기록 로그인 · 계정 관리</Link>
    {(message || error) && <p role="status" className="mt-4 text-sm text-primary">{message || error}</p>}
    <p role="status" className="mt-3 text-sm text-on-surface-variant">{visits.loading ? "내 방문 기록을 불러오는 중이에요…" : visits.error ? visits.error : visits.owner ? "방문 기록은 로그인한 본인 계정에 저장됩니다." : "로그인하면 방문 기록을 저장할 수 있어요. 예전 브라우저 기록은 보관된 상태로 보여 드려요."} {visits.error && <button onClick={visits.refresh} className="ml-2 text-primary underline">다시 불러오기</button>}</p>
    {visits.owner && !visits.error && visits.pendingImport.length > 0 && <div className="mt-4 rounded-2xl bg-surface-container-low p-4 text-sm"><p>이 브라우저에 남아 있는 방문 기록 {visits.pendingImport.length}개가 있어요. 내 기록이 맞는 경우에만 계정에 복사해 주세요. 기존 계정 기록은 덮어쓰지 않아요.</p><button disabled={visitsDisabled} onClick={visits.importLegacy} className="mt-3 rounded-full bg-primary/10 px-4 py-2 font-bold text-primary disabled:opacity-50">브라우저 기록 {visits.pendingImport.length}개를 내 계정에 복사</button></div>}
    {planLink && <Link href={planLink} className="mt-5 block rounded-2xl border bg-white p-5 font-bold text-secondary">저장한 우리 가족 코스 이어보기 →</Link>}
    <section id="my-places" className="mt-6 scroll-mt-28 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">내가 추가한 장소</h2><Link href="/places#add-place" className="text-sm font-bold text-primary">＋ 장소 추가</Link></div>
      <p className="mt-2 text-sm text-on-surface-variant">내 장소를 삭제하면 해당 장소의 방문 기록과 업로드한 사진도 함께 삭제돼요.</p>
      {deleteMessage && <p role="status" className="mt-3 text-sm text-primary">{deleteMessage}</p>}
      {!places.some(place => place.recommendationSource === "USER_ADDED") && <p className="mt-4 text-sm">{error || "직접 추가한 장소가 아직 없어요. 로그인 후 내 장소를 확인할 수 있어요."}</p>}
      {places.filter(place => place.recommendationSource === "USER_ADDED").map(place => <article key={place.id} className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className="min-w-0 flex-1"><Link href={placeDetailHref(place)} className="font-bold">{place.name} →</Link><p className="mt-1 text-xs text-on-surface-variant">{place.address}</p></div><DeletePlaceButton place={place} onDeleted={() => setDeleteMessage(`${place.name}과 연결된 방문 기록·사진을 삭제했어요.`)} /></article>)}
    </section>
    <details className="mt-4 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6" onToggle={event => setShowPhotos(event.currentTarget.open)}><summary className="cursor-pointer text-lg font-bold">내가 업로드한 사진 관리 <span className="text-xs font-normal text-on-surface-variant">펼치기 / 접기</span></summary>{showPhotos && <VisitorPhotos places={places} />}</details>
    <VillageCollection places={places.filter(p => p.recommendationSource !== "USER_ADDED")} stamps={stamps} />
    <StampBook key={visits.owner || "guest"} places={places} stamps={stamps} onCreate={saveStamp} onRemove={removeStamp} disabled={visitsDisabled} />
    <p className="mt-3 text-xs text-on-surface-variant">내 장소·방문 기록·사진은 로그인 계정에 저장됩니다. 찜 목록과 복사 전의 예전 방문 기록은 이 브라우저에만 남아 있어요.</p>
    <section className="mt-10"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-bold">다음 투어에 담아둔 장소</h2><Link href="/places" className="text-sm font-bold text-primary">장소 더 찾아보기 →</Link></div>
      {!saved.length && <p className="mt-5 rounded-2xl bg-white p-8 text-center text-sm">아직 찜한 장소가 없어요. 장소 탐색에서 마음에 드는 곳을 담아보세요.</p>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">{saved.map(place => <article key={place.id} className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-white p-4">
        {place.thumbnailImage && <Link href={placeDetailHref(place)}><img src={place.thumbnailImage} alt={place.name} className="h-24 w-24 rounded-xl object-cover" /></Link>}
        <div className="min-w-0 flex-1"><Link href={placeDetailHref(place)} className="font-bold">{place.name} →</Link><p className="mt-1 text-xs text-on-surface-variant">{place.address}</p><div className="mt-3 flex flex-wrap gap-3"><button disabled={visitsDisabled} onClick={() => stamps.some(s => s.placeId === place.id) ? removeStamp(place.id) : saveStamp(place.id, todayInKorea())} className="text-xs font-bold text-primary disabled:opacity-50">{stamps.some(s => s.placeId === place.id) ? "스탬프 해제" : "오늘 다녀왔어요"}</button><button onClick={() => setSavedIds(removeSavedPlace(place.id))} className="text-xs text-on-surface-variant underline">찜 취소</button></div></div>
      </article>)}</div>
    </section>
  </main><BottomNavBar activeTab="mytrip" /></div>;
}
