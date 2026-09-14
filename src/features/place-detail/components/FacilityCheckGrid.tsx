import React from "react";
import { Place } from "@/domain/models/place";
import { TriState } from "@/domain/models/tri-state";
import { EvidenceValue } from "@/domain/models/evidence";

interface FacilityCheckGridProps {
  place: Place;
}

interface FacilityItemConfig {
  id: string;
  name: string;
  icon: string;
  evidence: EvidenceValue<TriState>;
  defaultNotes: {
    YES: string;
    UNKNOWN: string;
    NO: string;
  };
}

export const FacilityCheckGrid: React.FC<FacilityCheckGridProps> = ({ place }) => {
  const items: FacilityItemConfig[] = [
    {
      id: "stroller",
      name: "유모차 주행",
      icon: "stroller",
      evidence: place.strollerAccessible,
      defaultNotes: {
        YES: "턱 없는 완경사 진입로 및 평지 포장도로 (디럭스/절충형 모두 주행 편안)",
        UNKNOWN: "일부 비포장 또는 계단 구간 존재 가능성 (현장 실측 필요)",
        NO: "단차, 계단 또는 협소한 통로로 인해 유모차 반입이 제한됩니다.",
      },
    },
    {
      id: "diaper",
      name: "기저귀 갈이대",
      icon: "baby_changing_station",
      evidence: place.diaperChangingStation,
      defaultNotes: {
        YES: "독립형 기저귀 교환대 및 온수 세면대 구비",
        UNKNOWN: "기저귀 갈이대 설치 여부 미확인 (개인 패드 지참 권장)",
        NO: "전용 기저귀 갈이대가 마련되어 있지 않습니다.",
      },
    },
    {
      id: "parking",
      name: "주차 편리성",
      icon: "local_parking",
      evidence: place.parking,
      defaultNotes: {
        YES: "넓은 전용 주차 공간 완비, 유모차 하차 및 진입 용이",
        UNKNOWN: "주차 혼잡도 및 진입로 여건 사전 확인 필요",
        NO: "전용 주차장이 없어 주변 공영주차장 이용 필요",
      },
    },
    {
      id: "nursing",
      name: "수유실",
      icon: "child_care",
      evidence: place.nursingRoom,
      defaultNotes: {
        YES: "독립 1인 수유 부스 및 안락 소파, 전자레인지 구비",
        UNKNOWN: "전용 수유실 설치 여부 미확인 (수유 가리개 지참 권장)",
        NO: "독립 수유실이 부재하여 차량 내 또는 사전 수유 권장",
      },
    },
    {
      id: "toilet",
      name: "가족 화장실",
      icon: "wc",
      evidence: place.toilet,
      defaultNotes: {
        YES: "유모차 동반 입장이 가능한 가족/다목적 화장실 구비",
        UNKNOWN: "일반 화장실 완비, 유아 편의시설은 방문 시 확인 필요",
        NO: "유아 편의 시설이 갖춰진 화장실 미비",
      },
    },
    {
      id: "shade",
      name: "그늘 및 휴식 공간",
      icon: "park",
      evidence: place.shade,
      defaultNotes: {
        YES: "시원한 실내 냉방 쉼터 또는 나무 그늘 벤치/파고라 완비",
        UNKNOWN: "휴식 공간 여건 사전 확인 권장",
        NO: "식사 공간 외 별도 휴식/그늘 쉼터가 부족합니다.",
      },
    },
    {
      id: "babyChair",
      name: "아기의자",
      icon: "chair_alt",
      evidence: place.babyChair,
      defaultNotes: {
        YES: "안전벨트 구비 유아용 하이체어/아기의자 다수 보유",
        UNKNOWN: "아기의자 보유 중이나 주말 피크타임 수량 소진 가능성 있음",
        NO: "아기의자 미구비 (유모차 착석 또는 좌식 이용 권장)",
      },
    },
    {
      id: "strollerRental",
      name: "유모차 현장 대여",
      icon: "block",
      evidence: place.strollerRental,
      defaultNotes: {
        YES: "인포메이션 데스크에서 유모차 현장 무료 대여 운영",
        UNKNOWN: "유모차 대여 잔여 수량 및 운영 여부 확인 필요",
        NO: "현장 대여 서비스 미운영 (개인 유모차를 필히 지참하세요)",
      },
    },
  ];

  return (
    <div className="w-full mb-6" data-testid="facility-check-grid">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface">아이와 가기 체크</h2>
          <p className="text-xs text-on-surface-variant">출발 전 꼭 확인해야 할 8대 필수 시설</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-surface-container text-on-surface-variant font-medium">
          상태 8건 점검
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const val = item.evidence.value;
          const noteText = item.evidence.note || item.defaultNotes[val];

          if (val === "YES") {
            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 flex items-start gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/20"
                data-testid={`facility-${item.id}-YES`}
              >
                <div className="w-7 h-7 rounded-full bg-[#EAF5ED] text-[#2D8A4E] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                    <span className="text-xs text-[#2D8A4E] bg-[#EAF5ED] px-2 py-0.5 rounded font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">check</span> 확인됨
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{noteText}</p>
                </div>
              </div>
            );
          }

          if (val === "UNKNOWN") {
            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-xl p-3.5 flex items-start gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-[#FEF3C7]"
                data-testid={`facility-${item.id}-UNKNOWN`}
              >
                <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                    <span className="text-xs text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">help</span> 확인 필요
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{noteText}</p>
                </div>
              </div>
            );
          }

          // NO
          return (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-xl p-3.5 flex items-start gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-outline-variant/10 opacity-85"
              data-testid={`facility-${item.id}-NO`}
            >
              <div className="w-7 h-7 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                  <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[13px]">close</span> 지원 안 됨
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{noteText}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
