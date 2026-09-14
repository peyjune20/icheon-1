import React from "react";
import { Place } from "@/domain/models/place";

interface ParentReviewBoxProps {
  place: Place;
}

export const ParentReviewBox: React.FC<ParentReviewBoxProps> = ({ place }) => {
  const getReviewContent = () => {
    if (place.id === "3") {
      return `"이천에서 무거운 디럭스 유모차를 끌고 가장 쾌적하게 거닐 수 있는 대표적인 쉼터입니다. 탁 트인 잔디밭과 바닥분수가 시원함을 주며, 걷다가 더워질 때쯤 바로 옆 라이스카페의 시원한 통창 실내에서 쌀 아이스크림과 쌀빵을 함께 나누기 좋습니다. 2세 전후 아기 동반 시 피로도가 가장 적은 안심 코스입니다."`;
    }
    if (place.editorialReview) {
      return `"${place.editorialReview}"`;
    }
    return `"아이와 함께 방문했을 때 동선과 편의시설의 완성도가 높아 부모의 체력 부담이 적은 장소입니다."`;
  };

  return (
    <div
      className="w-full bg-[#FDECE7] rounded-2xl p-4 mb-6 border border-[#F9D5CB]/60 shadow-xs"
      data-testid="parent-review-box"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-full bg-[#E77F67] text-white flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
        </div>
        <span className="text-sm text-[#943F2B] font-bold">부모를 위한 솔직한 현장 평</span>
      </div>
      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line font-normal">
        {getReviewContent()}
      </p>
    </div>
  );
};
