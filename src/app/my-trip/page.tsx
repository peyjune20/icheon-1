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
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";

export default function MyTripPage() {
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);

  useEffect(() => {
    const syncSavedPlaces = () => setSavedPlaceIds(getSavedPlaceIds());

    syncSavedPlaces();
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, syncSavedPlaces);
    window.addEventListener("storage", syncSavedPlaces);

    return () => {
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, syncSavedPlaces);
      window.removeEventListener("storage", syncSavedPlaces);
    };
  }, []);

  const savedPlaces = useMemo(
    () => savedPlaceIds.flatMap((id) => {
      const place = SEED_PLACES.find((candidate) => candidate.id === id);
      return place ? [place] : [];
    }),
    [savedPlaceIds],
  );

  const handleRemove = (placeId: string) => {
    setSavedPlaceIds(removeSavedPlace(placeId));
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      <AppHeader />

      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-20 pb-28">
        <section className="mb-5">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <span className="material-symbols-outlined text-[16px]">bookmark_added</span>
            <span>찜한 장소를 한곳에 모았어요</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">내 일정</h1>
          <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
            장소에서 찜을 누르면 이곳에 저장됩니다. {savedPlaces.length}곳을 저장했어요.
          </p>
        </section>

        {savedPlaces.length === 0 ? (
          <section className="rounded-2xl bg-surface-container-low border border-outline-variant/30 px-5 py-12 text-center">
            <span className="material-symbols-outlined text-[38px] text-primary">bookmark</span>
            <h2 className="mt-3 font-bold">아직 저장한 장소가 없어요</h2>
            <p className="mt-1 text-xs text-on-surface-variant leading-relaxed">
              마음에 드는 장소를 찜하고 나만의 이천 여행 목록을 만들어 보세요.
            </p>
            <Link
              href="/places"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white transition-colors hover:bg-primary-container"
            >
              장소 탐색하기
            </Link>
          </section>
        ) : (
          <div className="flex flex-col gap-3">
            {savedPlaces.map((place) => (
              <article
                key={place.id}
                className="flex gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3 shadow-xs"
              >
                <Link href={`/places/${place.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  <Image
                    src={place.thumbnailImage || place.imageFiles[0]}
                    alt={place.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/places/${place.id}`} className="min-w-0">
                      <h2 className="truncate text-base font-bold">{place.name}</h2>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
                        {place.roadAddress || place.address}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(place.id)}
                      aria-label={`${place.name} 저장 취소`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-[21px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        bookmark
                      </span>
                    </button>
                  </div>
                  <Link href={`/places/${place.id}`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                    상세 정보 보기
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar activeTab="mytrip" />
    </div>
  );
}
