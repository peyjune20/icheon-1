import React from "react";
import { Place } from "@/domain/models/place";
import { PhotoGallery } from "@/components/shared/PhotoGallery";

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
      : place.category === "EXPERIENCE"
      ? "아이 체험 · 문화"
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

  return (
    <div className="flex flex-col gap-3 mb-5" data-testid="hero-banner">
      {/* Place Header Info */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-xs">
            {categoryLabel}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-xs">
            {ageLabel}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium text-xs">
            {indoorOutdoorLabel}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-xs ${place.recommendationSource === "AI_RECOMMENDED" ? "bg-secondary-container text-on-secondary-container" : "bg-primary/10 text-primary"}`}>
            <span className="material-symbols-outlined text-[13px]">{place.recommendationSource === "AI_RECOMMENDED" ? "auto_awesome" : "verified"}</span>
            {place.recommendationSource === "AI_RECOMMENDED" ? "AI 추천" : "현장 실측"}
          </span>
        </div>

        <h1 className="text-2xl text-on-surface font-bold tracking-tight" data-testid="hero-place-name">
          {place.name}
        </h1>

        <div className="flex items-center gap-1 text-on-surface-variant text-xs font-medium">
          <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
          <span className="truncate">{place.roadAddress || place.address}</span>
        </div>
      </div>

      {/* Full Photo Gallery Component with all uploaded pictures */}
      <PhotoGallery place={place} />
    </div>
  );
};
