import React from "react";
import { Place } from "@/domain/models/place";

interface TrustCardProps {
  place: Place;
}

export const TrustCard: React.FC<TrustCardProps> = ({ place }) => {
  const isFieldVerified = place.verificationStatus === "FIELD_VERIFIED";
  const isAiRecommended = place.recommendationSource === "AI_RECOMMENDED";

  const getVerificationComment = () => "사용자가 방문한 장소의 기록이에요. 시설별 확인 내용은 아래에서 볼 수 있으며, 이후 운영 상황은 달라질 수 있어요.";

  if (!isFieldVerified) {
    return (
      <div className="w-full bg-surface-container rounded-xl p-4 mb-5 flex items-start gap-3 border border-outline-variant/30" data-testid="trust-card">
        <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container">
          <span className="material-symbols-outlined text-[20px]">{isAiRecommended ? "auto_awesome" : "info"}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">{isAiRecommended ? "AI 추천 장소" : "웹 정보 기반 장소"}</span>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">{isAiRecommended ? "공개 관광 정보 탐색" : "현장 실측 예정"}</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 leading-snug">
            {isAiRecommended ? "AI가 공개 관광 정보를 바탕으로 찾은 후보예요. 운영 여부와 유아 편의시설은 공식 안내에서 다시 확인해 주세요." : "방문 전 최신 운영 여부와 유아 편의시설을 유선으로 확인하시길 권장합니다."}
          </p>
          {isAiRecommended && place.sourceUrl && (
            <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-bold text-secondary hover:underline">
              공식 안내 확인
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary/10 rounded-xl p-4 mb-5 flex items-start gap-3 border border-primary/20" data-testid="trust-card">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          verified
        </span>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">현장 실측 검증 완료</span>
          <span className="text-xs text-on-surface-variant bg-white/80 px-2 py-0.5 rounded-full font-medium shadow-xs">
            {place.verifiedDate ? `${place.verifiedDate.slice(0, 7)} 에디터 검증` : "2025.09 에디터 검증"}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1 leading-snug">
          {getVerificationComment()}
        </p>
      </div>
    </div>
  );
};
