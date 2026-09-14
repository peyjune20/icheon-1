import React from "react";
import { Place } from "@/domain/models/place";

interface PracticalInfoGridProps {
  place: Place;
}

export const PracticalInfoGrid: React.FC<PracticalInfoGridProps> = ({ place }) => {
  // 1. Duration
  const durationText = `${place.recommendedDurationMin}분 내외`;
  const durationDesc =
    place.category === "PARK"
      ? "무리 없는 산책 + 카페 휴식"
      : place.category === "RESTAURANT"
      ? "아이와 여유 있는 식사 시간"
      : place.category === "CAFE"
      ? "부모 충전 커피 타임"
      : "여유로운 관람 및 쉼터";

  // 2. Opening Hours
  const hoursText = `${place.openingHours.open} ~ ${place.openingHours.close}`;
  const daysMap = ["일", "월", "화", "수", "목", "금", "토"];
  const closedDaysText =
    place.openingHours.closedDays.length === 0
      ? "연중무휴"
      : `매주 ${place.openingHours.closedDays.map((d) => daysMap[d]).join(", ")}요일 정기 휴무`;

  // 3. Cost
  const costText =
    place.category === "PARK" || place.category === "INDOOR"
      ? "입장료 무료"
      : place.category === "RESTAURANT"
      ? "1인 15,000~20,000원"
      : "1인 6,000~8,000원";
  const costDesc =
    place.category === "PARK"
      ? "카페 음료 및 체험 별도"
      : place.category === "RESTAURANT"
      ? "유아 식기 및 아기의자 무료"
      : "주차 및 정원 이용 무료";

  // 4. Weather
  const weatherText =
    place.indoorOutdoor === "INDOOR"
      ? "모든 날씨 적합"
      : place.indoorOutdoor === "MIXED"
      ? "맑음 / 다소 더움"
      : "맑음 / 선선함";
  const weatherDesc =
    place.indoorOutdoor === "INDOOR"
      ? "전 구역 시원한 실내 냉방"
      : place.indoorOutdoor === "MIXED"
      ? "대형 실내 카페 대피 가능"
      : "야외 그늘막 휴식 공간 완비";

  return (
    <div className="w-full mb-6" data-testid="practical-info-grid">
      <h2 className="text-lg font-bold text-on-surface mb-3">방문 전 필수 정보</h2>
      <div className="grid grid-cols-2 gap-3">
        {/* Item 1: Duration */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="text-xs font-medium">적정 체류시간</span>
          </div>
          <p className="text-sm text-on-surface font-bold mt-1">{durationText}</p>
          <span className="text-xs text-on-surface-variant mt-0.5 leading-snug">{durationDesc}</span>
        </div>

        {/* Item 2: Hours */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[18px]">access_time</span>
            <span className="text-xs font-medium">운영시간</span>
          </div>
          <p className="text-sm text-on-surface font-bold mt-1">{hoursText}</p>
          <span className="text-xs text-tertiary font-semibold mt-0.5 leading-snug">{closedDaysText}</span>
        </div>

        {/* Item 3: Cost */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span className="text-xs font-medium">비용 안내</span>
          </div>
          <p className="text-sm text-primary font-bold mt-1">{costText}</p>
          <span className="text-xs text-on-surface-variant mt-0.5 leading-snug">{costDesc}</span>
        </div>

        {/* Item 4: Weather */}
        <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
            <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
            <span className="text-xs font-medium">추천 날씨</span>
          </div>
          <p className="text-sm text-on-surface font-bold mt-1">{weatherText}</p>
          <span className="text-xs text-on-surface-variant mt-0.5 leading-snug">{weatherDesc}</span>
        </div>
      </div>
    </div>
  );
};
