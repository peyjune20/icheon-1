"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import { SEED_PLACES } from "@/infrastructure/data/seed-places.data";
import { Place, PlaceCategory } from "@/domain/models/place";

const FILTER_CATEGORIES = [
  { id: "ALL", label: "전체 명소 (7곳)" },
  { id: "NATURE_PARK", label: "🌿 자연 · 숲 · 호수" },
  { id: "CAFE", label: "☕ 부모 휴식 카페" },
  { id: "INDOOR", label: "🏠 실내 관람" },
  { id: "RESTAURANT", label: "🍚 이천 쌀밥 식당" },
];

export default function PlacesListPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const standalonePlaces = useMemo(() => SEED_PLACES, []);

  const filteredPlaces = useMemo(() => {
    return standalonePlaces.filter((place) => {
      // Category filter
      if (activeFilter === "NATURE_PARK" && place.category !== "NATURE" && place.category !== "PARK") {
        return false;
      }
      // 미솥지음은 식사 장소이면서 부모가 편히 쉬기 좋은 공간으로 검증되어
      // 부모 휴식 카페 필터에서도 함께 탐색할 수 있게 한다.
      if (activeFilter === "CAFE" && place.category !== "CAFE" && place.id !== "1") {
        return false;
      }
      if (activeFilter === "INDOOR" && place.category !== "INDOOR") {
        return false;
      }
      if (activeFilter === "RESTAURANT" && place.category !== "RESTAURANT") {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = place.name.toLowerCase().includes(q);
        const matchAddr = (place.roadAddress || place.address).toLowerCase().includes(q);
        const matchReview = (place.editorialReview || "").toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchReview) return false;
      }

      return true;
    });
  }, [standalonePlaces, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      <AppHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-28 lg:pb-12">
        {/* Page Header */}
        <section className="pt-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>이천베베로드 100% 현장 전수 실측</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            안심 장소 탐색
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            유모차 완경사로, 기저귀 갈이대, 수유실까지 에디터가 직접 방문해 검증한 이천의 안심 명소 목록입니다.
          </p>
        </section>

        {/* Search Bar */}
        <div className="relative mb-3.5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="장소명, 주소, 특징 검색 (예: 모가의 숲, 성호호수)"
            className="w-full h-11 pl-10 pr-4 bg-surface-container-low rounded-xl text-xs text-on-surface outline-hidden border border-outline-variant/30 focus:border-primary transition-all placeholder:text-on-surface-variant/60"
            data-testid="input-search-place"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
          {FILTER_CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
                data-testid={`filter-${cat.id.toLowerCase()}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Places List Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-7 xl:grid-cols-3">
          {filteredPlaces.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant text-xs">
              검색 조건에 일치하는 장소가 없습니다.
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <PlaceCardItem key={place.id} place={place} />
            ))
          )}
        </div>
      </main>

      <BottomNavBar activeTab="places" />
    </div>
  );
}

function PlaceCardItem({ place }: { place: Place }) {
  const categoryBadge =
    place.category === "RESTAURANT"
      ? "이천 쌀밥 식사"
      : place.category === "CAFE"
      ? "부모 쉼표 카페"
      : place.category === "PARK"
      ? "생태 공원"
      : place.category === "INDOOR"
      ? "실내 아열대 온실"
      : place.category === "NATURE"
      ? "자연 힐링"
      : "추천 명소";

  return (
    <article
      className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col"
      data-testid={`place-item-${place.id}`}
    >
      {/* Visual Header Image */}
      <Link href={`/places/${place.id}`} className="relative aspect-[16/9] w-full bg-surface-container overflow-hidden group block">
        <Image
          src={place.thumbnailImage || place.imageFiles[0]}
          alt={place.name}
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-xs">
            {categoryBadge}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-on-surface text-[11px] font-medium">
            {place.indoorOutdoor === "INDOOR" ? "실내 냉방" : place.indoorOutdoor === "MIXED" ? "실내+실외" : "야외 숲/호수"}
          </span>
        </div>

        {/* Total Photos Badge */}
        {place.imageFiles && place.imageFiles.length > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">photo_library</span>
            <span>사진 {place.imageFiles.length}장</span>
          </div>
        )}

        {/* Title on Photo Bottom */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col text-white">
          <h2 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
            {place.name}
          </h2>
          <span className="text-[11px] text-white/85 truncate flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            {place.roadAddress || place.address}
          </span>
        </div>
      </Link>

      {/* Mini Photo Strip Preview */}
      {place.imageFiles && place.imageFiles.length > 1 && (
        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/20">
          {place.imageFiles.map((img, idx) => (
            <Link
              key={img + idx}
              href={`/places/${place.id}`}
              className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-outline-variant/30 hover:opacity-100 opacity-85 transition-opacity"
            >
              <Image
                src={img}
                alt={`${place.name} 썸네일 ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 28vw, 110px"
                className="object-cover"
              />
            </Link>
          ))}
          <Link
            href={`/places/${place.id}`}
            className="col-span-full justify-self-end text-xs text-primary font-bold hover:underline flex items-center pt-0.5"
          >
            전체 사진 &rarr;
          </Link>
        </div>
      )}

      {/* Facility Amenities Chips */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
              place.strollerAccessible.value === "YES"
                ? "bg-primary/10 text-primary font-bold"
                : "bg-surface-container text-on-surface-variant/70"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">stroller</span>
            유모차 {place.strollerAccessible.value === "YES" ? "가능" : "일부 제한"}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
              place.nursingRoom.value === "YES"
                ? "bg-primary/10 text-primary font-bold"
                : "bg-surface-container text-on-surface-variant/70"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">child_care</span>
            수유실 {place.nursingRoom.value === "YES" ? "완비" : "없음"}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
              place.diaperChangingStation.value === "YES"
                ? "bg-primary/10 text-primary font-bold"
                : "bg-surface-container text-on-surface-variant/70"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">baby_changing_station</span>
            기저귀대 {place.diaperChangingStation.value === "YES" ? "완비" : "없음"}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
              place.babyChair.value === "YES"
                ? "bg-primary/10 text-primary font-bold"
                : "bg-surface-container text-on-surface-variant/70"
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">chair_alt</span>
            아기의자 {place.babyChair.value === "YES" ? "보유" : "없음"}
          </span>
        </div>

        {/* Editorial Review Summary */}
        {place.editorialReview && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed bg-surface-container-low p-3.5 rounded-xl">
            💬 &ldquo;{place.editorialReview}&rdquo;
          </p>
        )}

        {/* Action Button */}
        <Link
          href={`/places/${place.id}`}
          className="w-full h-11 mt-1 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-[0.98]"
        >
          <span>현장 실측 정보 및 사진 갤러리 보기</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}
