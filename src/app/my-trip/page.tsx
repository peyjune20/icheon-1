"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import {
  getSavedPlaceIds,
  removeSavedPlace,
  SAVED_PLACES_CHANGED_EVENT,
} from "@/features/saved-places/saved-places.storage";
import {
  createTourStamp,
  getTourStamps,
  TourStampRecord,
  TOUR_STAMPS_CHANGED_EVENT,
} from "@/features/tour-stamps/tour-stamps.storage";
import { TourStamp } from "@/features/tour-stamps/TourStamp";
import { TourMascot } from "@/features/tour-stamps/TourMascot";
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";

const TOUR_PREP_STORAGE_KEY = "icheon-bebe-road:tour-prep-checks";

const TOUR_PREP_ITEMS = [
  { id: "stroller", icon: "stroller", title: "유모차와 얇은 겉옷", description: "산책 코스와 실내 온도차에 대비해요." },
  { id: "snack", icon: "bakery_dining", title: "간식·물·물티슈", description: "아이의 기분 전환을 위한 든든한 세트예요." },
  { id: "weather", icon: "wb_sunny", title: "오늘 날씨 확인", description: "비 소식에는 실내 명소를 먼저 담아보세요." },
];

const STAMP_COLLECTIONS = [
  { category: "RESTAURANT" as const, title: "쌀밥 미식가", description: "든든한 이천 한 끼", tone: "bg-[#fff8e9] text-tertiary" },
  { category: "NATURE" as const, title: "숲속 탐험가", description: "나무와 호수 산책", tone: "bg-[#f3fbf1] text-secondary" },
  { category: "PARK" as const, title: "공원 새싹", description: "넓은 잔디와 놀이터", tone: "bg-[#fff7ed] text-primary" },
  { category: "CAFE" as const, title: "카페 휴식가", description: "부모도 쉬어가는 시간", tone: "bg-[#fff5f8] text-primary" },
  { category: "INDOOR" as const, title: "실내 탐험대", description: "날씨 걱정 없는 나들이", tone: "bg-[#f5f2ff] text-secondary" },
];

export default function MyTripPage() {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [tourStamps, setTourStamps] = useState<TourStampRecord[]>([]);
  const [prepCheckIds, setPrepCheckIds] = useState<string[]>([]);

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

  useEffect(() => {
    const savedChecks = window.localStorage.getItem(TOUR_PREP_STORAGE_KEY);
    if (!savedChecks) return;

    try {
      const parsed = JSON.parse(savedChecks);
      if (Array.isArray(parsed)) {
        setPrepCheckIds(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      window.localStorage.removeItem(TOUR_PREP_STORAGE_KEY);
    }
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
    setTourStamps(createTourStamp(placeId));
  };

  const togglePrepCheck = (checkId: string) => {
    setPrepCheckIds((current) => {
      const next = current.includes(checkId)
        ? current.filter((id) => id !== checkId)
        : [...current, checkId];
      window.localStorage.setItem(TOUR_PREP_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppHeader />

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
                <TourStamp key={place.id} place={place} visitedAt={stamp.visitedAt} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-outline-variant/30 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-primary">BEBE COLLECTION</p>
                <h2 className="mt-1 text-xl font-bold">테마별 베베 탐험대</h2>
              </div>
              <span className="text-xs font-medium text-on-surface-variant">테마를 모아 나만의 이천 지도를 완성해요</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stampCollections.map((collection) => (
                <div key={collection.category} className={`flex items-center gap-3 rounded-2xl p-3 ${collection.tone}`}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80">
                    <TourMascot compact category={collection.category} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-on-surface">{collection.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">{collection.description}</p>
                    <p className="mt-1 text-[11px] font-bold">{collection.count > 0 ? `${collection.count}곳 달성!` : "첫 스탬프 도전"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-outline-variant/30 bg-surface-container-low p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary">READY, BEBE!</p>
                <h2 className="mt-1 text-xl font-bold">출발 전 베베 체크</h2>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary">{prepCheckIds.length} / {TOUR_PREP_ITEMS.length}</span>
            </div>
            <div className="mt-4 space-y-2">
              {TOUR_PREP_ITEMS.map((item) => {
                const checked = prepCheckIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => togglePrepCheck(item.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                      checked
                        ? "border-primary/25 bg-primary-fixed"
                        : "border-white bg-white/80 hover:border-primary/30"
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${checked ? "bg-primary text-white" : "bg-surface-container text-primary"}`}>
                      <span className="material-symbols-outlined text-[19px]">{checked ? "check" : item.icon}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold">{item.title}</span>
                      <span className="mt-0.5 block text-[11px] text-on-surface-variant">{item.description}</span>
                    </span>
                  </button>
                );
              })}
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
                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                            <TourStamp place={place} visitedAt={stamp.visitedAt} compact />
                            <span>방문 완료</span>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleCreateStamp(place.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-white transition-colors hover:bg-primary-container">
                            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                            다녀왔어요
                          </button>
                        )}
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
