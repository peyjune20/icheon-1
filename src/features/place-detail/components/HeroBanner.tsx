import React from "react";
import Image from "next/image";
import { Place } from "@/domain/models/place";

interface HeroBannerProps {
  place: Place;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ place }) => {
  const categoryLabel =
    place.category === "RESTAURANT"
      ? "식사"
      : place.category === "PARK"
      ? "체험 · 공원"
      : place.category === "INDOOR"
      ? "실내 관람"
      : place.category === "CAFE"
      ? "부모 휴식 · 카페"
      : place.category === "NATURE"
      ? "자연 힐링"
      : "추천 명소";

  const indoorOutdoorLabel =
    place.indoorOutdoor === "INDOOR"
      ? "실내"
      : place.indoorOutdoor === "OUTDOOR"
      ? "실외"
      : "실내 + 실외";

  const ageLabel =
    place.ageMinMonths !== undefined && place.ageMaxMonths !== undefined
      ? `${Math.floor(place.ageMinMonths / 12)}~${Math.floor(place.ageMaxMonths / 12)}세 최적`
      : "영유아 추천";

  const heroImage = place.imageFiles.length > 0 ? place.imageFiles[0] : "/resources/pic/3-1.jpg";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-container-low mb-5" data-testid="hero-banner">
      <div className="w-full h-64 relative bg-surface-container overflow-hidden">
        <Image
          src={heroImage}
          alt={place.name}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* Badges on Photo */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold text-xs shadow-sm">
            {categoryLabel}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-on-surface-variant font-medium text-xs shadow-sm">
            {ageLabel}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-on-surface-variant font-medium text-xs shadow-sm">
            {indoorOutdoorLabel}
          </span>
        </div>

        {/* Hero Text Content */}
        <div className="absolute bottom-3.5 inset-x-3.5 flex flex-col z-10">
          <div className="flex items-center gap-1.5 text-white/90 mb-1 text-xs font-medium">
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span className="truncate">{place.roadAddress || place.address}</span>
          </div>
          <h1 className="text-2xl text-white font-bold tracking-tight drop-shadow-sm" data-testid="hero-place-name">
            {place.name}
          </h1>
        </div>
      </div>
    </div>
  );
};
