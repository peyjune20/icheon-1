import { ItineraryBlock } from "@/domain/models/itinerary";
import { RecommendationContext } from "@/domain/models/trip-input";
import { RECOMMENDATION_CONFIG } from "@/domain/config/recommendation.config";

export interface BufferCalculationResult {
  parkingBufferTotalMin: number;
  toddlerBufferTotalMin: number;
  totalBufferMin: number;
}

export function calculateBuffers(
  blocks: ItineraryBlock[],
  context: RecommendationContext
): BufferCalculationResult {
  let parkingBufferTotalMin = 0;
  let totalActivityMin = 0;
  let continuousOutdoorMin = 0;

  for (const block of blocks) {
    if (block.type === "PLACE" && block.place) {
      // 장소당 10분 주차/승하차 버퍼 (FR-SCHEDULE-004)
      parkingBufferTotalMin += RECOMMENDATION_CONFIG.durations.parkingBufferMin;
      totalActivityMin += block.durationMin;

      // 2세 이하 연속 야외활동 제한 검사 (FR-SCHEDULE-006: 90분 초과 금지)
      if (block.place.indoorOutdoor === "OUTDOOR") {
        continuousOutdoorMin += block.durationMin;
        if (
          context.trip.childAgeMonths <= 35 &&
          continuousOutdoorMin >
            RECOMMENDATION_CONFIG.durations.toddlerBuffer.maxContinuousOutdoorMin
        ) {
          block.badges = [...(block.badges || []), "야외시간 주의"];
        }
      } else {
        continuousOutdoorMin = 0; // 실내 진입 시 야외 누적 리셋
      }
    }
  }

  // 2세 이하 영유아 버퍼 (FR-SCHEDULE-005: 90분 활동마다 +15분)
  let toddlerBufferTotalMin = 0;
  if (context.trip.childAgeMonths <= 35) {
    toddlerBufferTotalMin =
      Math.floor(
        totalActivityMin /
          RECOMMENDATION_CONFIG.durations.toddlerBuffer.activityWindowMin
      ) * RECOMMENDATION_CONFIG.durations.toddlerBuffer.extraBufferMin;
  }

  return {
    parkingBufferTotalMin,
    toddlerBufferTotalMin,
    totalBufferMin: parkingBufferTotalMin + toddlerBufferTotalMin,
  };
}
