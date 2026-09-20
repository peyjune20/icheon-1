"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import {
  getSavedPlaceIds,
  removeSavedPlace,
  SAVED_PLACES_CHANGED_EVENT,
} from "@/features/saved-places/saved-places.storage";
import {
  createTourStamp,
  getTourStamps,
  removeTourStamp,
  TourStampRecord,
  TOUR_STAMPS_CHANGED_EVENT,
} from "@/features/tour-stamps/tour-stamps.storage";
import { TourStamp } from "@/features/tour-stamps/TourStamp";
import { TourMascot } from "@/features/tour-stamps/TourMascot";
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";

const STAMP_COLLECTIONS = [
  { category: "RESTAURANT" as const, title: "쌀밥 요리사", description: "든든한 이천 한 끼", icon: "restaurant", position: "left-[18%] top-[18%]", color: "#ffbd60" },
  { category: "NATURE" as const, title: "숲 해설가", description: "나무와 호수 산책", icon: "forest", position: "right-[18%] top-[15%]", color: "#76b96f" },
  { category: "EXPERIENCE" as const, title: "체험 놀이터 지기", description: "공룡·도자·계절 체험", icon: "toys", position: "left-[51%] top-[24%]", color: "#f1ad43" },
  { category: "PARK" as const, title: "공원 지킴이", description: "넓은 잔디와 놀이터", icon: "park", position: "left-[44%] top-[43%]", color: "#72b985" },
  { category: "CAFE" as const, title: "카페 바리스타", description: "부모도 쉬어가는 시간", icon: "local_cafe", position: "left-[16%] bottom-[13%]", color: "#ed7185" },
  { category: "INDOOR" as const, title: "실내 큐레이터", description: "날씨 걱정 없는 나들이", icon: "museum", position: "right-[14%] bottom-[12%]", color: "#8f7bd5" },
];

const getToday = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

export default function MyTripPage() {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [tourStamps, setTourStamps] = useState<TourStampRecord[]>([]);
  const [visitDates, setVisitDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncSavedPlaces = () => setSavedPlaceIds(getSavedPlaceIds());
    const syncTourStamps = () => setTourStamps(getTourStamps());
    const syncAll = () => {
      syncSavedPlaces();
      syncTourStamps();
    };

    syncAll();
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, syncSavedPlaces);
    window.addEventListener(TOUR_STAMPS_CHANGED_EVENT, syncTourStamps);
    window.addEventListener("storage", syncAll);

    return () => {
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, syncSavedPlaces);
      window.removeEventListener(TOUR_STAMPS_CHANGED_EVENT, syncTourStamps);
      window.removeEventListener("storage", syncAll);
    };
  }, []);

  const savedPlaces = useMemo(
    () => savedPlaceIds.flatMap((id) => {
      const place = SEED_PLACES.find((candidate) => candidate.id === id);
      return place ? [place] : [];
    }),
    [savedPlaceIds],
  );

  const stampByPlaceId = useMemo(
    () => new Map(tourStamps.map((stamp) => [stamp.placeId, stamp])),
    [tourStamps],
  );

  const stampedTours = useMemo(
    () => tourStamps.flatMap((stamp) => {
      const place = SEED_PLACES.find((candidate) => candidate.id === stamp.placeId);
      return place ? [{ place, stamp }] : [];
    }),
    [tourStamps],
  );

  const stampCollections = useMemo(
    () => STAMP_COLLECTIONS.map((collection) => ({
      ...collection,
      count: stampedTours.filter(({ place }) => place.category === collection.category).length,
    })),
    [stampedTours],
  );

  const handleRemove = (placeId: string) => {
    setSavedPlaceIds(removeSavedPlace(placeId));
  };

  const handleCreateStamp = (placeId: string) => {
    const visitDate = visitDates[placeId] || getToday();
    setTourStamps(createTourStamp(placeId, new Date(`${visitDate}T12:00:00`).toISOString()));
  };

  const handleRemoveStamp = (placeId: string) => {
    setTourStamps(removeTourStamp(placeId));
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:pb-16 lg:pt-32">
        <section className="grid gap-5 rounded-[28px] bg-secondary p-6 text-white shadow-[0_10px_30px_-12px_rgba(120,102,178,0.45)] sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
              <span className="material-symbols-outlined text-[15px]">map</span>
              MY ICHEON TOUR
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">나의 이천 베베 투어</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              마음에 담아 둔 장소와 직접 다녀온 순간을 한 장의 여행 기록으로 모아보세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">{savedPlaces.length}</p>
              <p className="mt-1 text-xs text-white/75">찜한 장소</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">{tourStamps.length}</p>
              <p className="mt-1 text-xs text-white/75">투어 스탬프</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-outline-variant/30 bg-surface-container-low p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-primary">TOUR STAMP BOOK</p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">다녀온 곳을 스탬프로 남겨요</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary">{tourStamps.length} / {SEED_PLACES.length} 완주</span>
          </div>
          {stampedTours.length === 0 ? (
            <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/70 bg-white/70 px-5 text-center">
              <TourMascot />
              <p className="mt-2 text-sm font-bold">첫 번째 이천 투어 스탬프를 남겨보세요</p>
              <p className="mt-1 text-xs text-on-surface-variant">찜한 장소에서 ‘다녀왔어요’를 누르면 스탬프가 찍혀요.</p>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-4 sm:gap-5">
              {stampedTours.map(({ place, stamp }) => (
                <TourStamp key={place.id} place={place} visitedAt={stamp.visitedAt} onRemove={() => handleRemoveStamp(place.id)} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="rounded-[28px] border border-outline-variant/30 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-primary">BEBE COLLECTION</p>
                <h2 className="mt-1 text-xl font-bold">이천 마을을 완성해요</h2>
              </div>
              <span className="rounded-full bg-primary-fixed px-3 py-1.5 text-xs font-bold text-on-primary-fixed">마을 스티커 {stampCollections.filter((collection) => collection.count > 0).length} / {stampCollections.length}</span>
            </div>
            <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-3xl border border-outline-variant/25 bg-surface-container-low shadow-inner">
              <Image src="/assets/icheon-village-map.png" alt="이천베베로드 마을 지도" fill sizes="(max-width: 1024px) 100vw, 960px" className="object-cover grayscale opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-white/5 to-white/15" />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-on-surface shadow-xs sm:left-5 sm:top-5">
                다녀온 테마마다 마을 스티커가 컬러로 채워져요
              </div>
              {stampCollections.map((collection) => (
                <div key={collection.category} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center ${collection.position}`}>
                  <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white shadow-lg transition-all sm:h-16 sm:w-16 ${collection.count > 0 ? "scale-100" : "scale-90 grayscale opacity-55"}`} style={{ backgroundColor: collection.count > 0 ? collection.color : "#d8d3d0" }}>
                    <span className="material-symbols-outlined text-[30px] text-white sm:text-[34px]">{collection.icon}</span>
                    <span className={`absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${collection.count > 0 ? "bg-primary" : "bg-on-surface-variant"}`}>{collection.count}</span>
                  </div>
                  <span className={`mt-1 hidden whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm sm:block ${collection.count > 0 ? "bg-white text-primary" : "bg-white/85 text-on-surface-variant"}`}>{collection.title}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {stampCollections.map((collection) => (
                <span key={collection.category} className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                  <span className={`h-2 w-2 rounded-full ${collection.count > 0 ? "bg-primary" : "bg-outline-variant"}`} />
                  {collection.title} {collection.count > 0 ? `${collection.count}곳` : "미방문"}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-primary">SAVED COURSE STOPS</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">다음 이천 투어에 담아둘 장소</h2>
            </div>
            <Link href="/places" className="text-sm font-bold text-primary hover:underline">장소 더 찾아보기</Link>
          </div>

          {savedPlaces.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-outline-variant/30 bg-white px-5 py-12 text-center">
              <span className="material-symbols-outlined text-[38px] text-primary">bookmark</span>
              <h3 className="mt-3 font-bold">아직 찜한 장소가 없어요</h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">마음에 드는 장소를 찜하고 나만의 이천 투어를 만들어 보세요.</p>
              <Link href="/places" className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white transition-colors hover:bg-primary-container">
                장소 탐색하기
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {savedPlaces.map((place) => {
                const stamp = stampByPlaceId.get(place.id);
                return (
                  <article key={place.id} className="flex gap-4 rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-xs">
                    <Link href={`/places/${place.id}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <Image src={place.thumbnailImage || place.imageFiles[0]} alt={place.name} fill sizes="112px" className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/places/${place.id}`} className="min-w-0">
                          <h3 className="truncate text-base font-bold">{place.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{place.roadAddress || place.address}</p>
                        </Link>
                        <button type="button" onClick={() => handleRemove(place.id)} aria-label={`${place.name} 찜 취소`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10">
                          <span className="material-symbols-outlined text-[21px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                        {stamp ? (
                          <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-primary">
                            <TourStamp place={place} visitedAt={stamp.visitedAt} compact />
                            <div className="min-w-0">
                              <span className="block">방문 완료</span>
                              <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-on-surface-variant">{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(stamp.visitedAt))}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input type="date" max={getToday()} value={visitDates[place.id] || getToday()} onChange={(event) => setVisitDates((current) => ({ ...current, [place.id]: event.target.value }))} aria-label={`${place.name} 방문 날짜`} className="h-9 rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 text-[11px] font-semibold text-on-surface outline-none focus:border-primary" />
                            <button type="button" onClick={() => handleCreateStamp(place.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white transition-colors hover:bg-primary-container">
                              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                              다녀왔어요
                            </button>
                          </div>
                        )}
                        {stamp && <button type="button" onClick={() => handleRemoveStamp(place.id)} className="shrink-0 text-[11px] font-bold text-on-surface-variant hover:text-primary hover:underline">스탬프 해제</button>}
                        <Link href={`/places/${place.id}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                          상세
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNavBar activeTab="mytrip" />
    </div>
  );
}
