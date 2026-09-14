import { RECOMMENDATION_CONFIG } from "@/domain/config/recommendation.config";

export interface DensityEvaluationResult {
  slackMin: number;
  status: "RELAXED" | "FEASIBLE" | "TIGHT";
  statusMessage: string;
  isOvercrowded: boolean;
  suggestedAction?: string;
}

export function evaluateDensity(
  tripWindowMin: number,
  totalStayMin: number,
  totalTravelMin: number,
  bufferMin = 0
): DensityEvaluationResult {
  // 실제 활동 및 주행 소요시간
  const actualTripTime = totalStayMin + totalTravelMin;
  // 전체 여행 가능 시간(330분) 대비 잔여 여유/버퍼 시간 (330 - 290~300 = 30~40분)
  const slackMin = Math.max(0, tripWindowMin - actualTripTime);

  let status: "RELAXED" | "FEASIBLE" | "TIGHT" = "FEASIBLE";
  let statusMessage = "적절한 여유가 있는 일정입니다.";
  let isOvercrowded = false;
  let suggestedAction: string | undefined = undefined;

  // 30분 이상의 여유가 확보되면 안심 일정 (RELAXED)
  if (slackMin >= 30) {
    status = "RELAXED";
    statusMessage = "무리 없는 일정이에요 (2세 아이 기준 안심)";
  } else if (slackMin < 15) {
    status = "TIGHT";
    statusMessage = "조금 빠듯한 일정이에요.";
    isOvercrowded = true;
    suggestedAction = "장소 한 곳을 줄이면 약 60분의 여유가 생겨요.";
  } else {
    status = "FEASIBLE";
    statusMessage = "소화 가능한 표준 일정입니다.";
  }

  return {
    slackMin,
    status,
    statusMessage,
    isOvercrowded,
    suggestedAction,
  };
}
