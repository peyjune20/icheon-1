import React from "react";
import { Place } from "@/domain/models/place";

interface TrustCardProps {
  place: Place;
}

export const TrustCard: React.FC<TrustCardProps> = ({ place }) => {
  const isFieldVerified = place.verificationStatus === "FIELD_VERIFIED";

  // Detailed editorial measurement comment based on verified facility inspection
  const getVerificationComment = () => {
    switch (place.id) {
      case "3":
        return "주차장 휠체어·유모차 램프 직접 실측, 기저귀 갈이대 온수 수압 및 수유실 정수기·소파 청결 상태를 확인했습니다.";
      case "1":
        return "매장 입구 단차 없는 진입로와 넓은 테이블 간격 직접 실측, 아기의자 8개 보유 및 유아 식기 비치 상태를 확인했습니다.";
      case "2":
        return "숲 산책로 완경사 노면 실측(계곡 구간 유모차 불가 확인), 숲 그늘 쉼터 및 기저귀 갈이대 구비 상태를 확인했습니다.";
      case "4":
        return "관람로 엘리베이터 및 휠체어·유모차 경사로 직접 실측, 가족 화장실 내 기저귀 갈이대 온수 상태를 확인했습니다.";
      case "5":
        return "잔디마당 평지 진입로 실측, 실내 협소 통로에 따른 유모차 반입 제한 및 아기의자 다수 구비 상태를 확인했습니다.";
      default:
        return "영유아 동반 필수 기준(유모차, 기저귀 갈이대, 수유 공간, 주차 편의) 현장 실측을 완료했습니다.";
    }
  };

  if (!isFieldVerified) {
    return (
      <div className="w-full bg-surface-container rounded-xl p-4 mb-5 flex items-start gap-3 border border-outline-variant/30" data-testid="trust-card">
        <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container">
          <span className="material-symbols-outlined text-[20px]">info</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-on-surface">웹 정보 기반 장소</span>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">현장 실측 예정</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 leading-snug">
            방문 전 최신 운영 여부와 유아 편의시설을 유선으로 확인하시길 권장합니다.
          </p>
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
