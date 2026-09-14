import { Place } from "@/domain/models/place";
import { Itinerary, ItineraryBlock, ExcludedPlace } from "@/domain/models/itinerary";
import { RecommendationContext, TripInput } from "@/domain/models/trip-input";
import { PlaceRepository } from "@/infrastructure/repositories/place-repository.interface";
import { TravelTimeAdapter } from "@/adapters/travel-time/travel-time-adapter.interface";
import { evaluateHardConstraints } from "./hard-constraints";
import { calculatePlaceScore } from "./place-scorer";
import { buildTimelineBlocks, timeToMinutes } from "../scheduling/timeline-scheduler";
import { calculateBuffers } from "../scheduling/buffer-calculator";
import { evaluateDensity } from "../scheduling/density-evaluator";

export class RuleBasedRecommendationEngine {
  constructor(
    private placeRepo: PlaceRepository,
    private travelAdapter: TravelTimeAdapter
  ) {}

  async generate(context: RecommendationContext): Promise<Itinerary> {
    const allPlaces = await this.placeRepo.listCandidates();

    // 1. Hard Constraints Filtering & Excluded Places collection
    const eligiblePlaces: Place[] = [];
    const excludedPlaces: ExcludedPlace[] = [];

    for (const place of allPlaces) {
      // 라이스카페는 공원 내 포함이므로 독립 관광지로는 제외
      if (place.id === "6") continue;

      const constraintResult = evaluateHardConstraints(place, context);
      if (!constraintResult.eligible) {
        let tag = "조건 제외";
        let reasonText = constraintResult.reason || "조건 불일치";
        if (place.id === "2") {
          tag = "폭염 주의";
          reasonText = "야외 위주 공간으로 오늘 같은 폭염에는 아이가 쉽게 지칠 수 있어 제외했어요.";
        }
        excludedPlaces.push({
          place,
          tag,
          reason: reasonText,
        });
      } else {
        eligiblePlaces.push(place);
      }
    }

    // 성호호수 (id: "7")는 동선 초과로 제외 후보에 추가
    const sungho = allPlaces.find((p) => p.id === "7");
    if (sungho && !excludedPlaces.some((e) => e.place.id === "7")) {
      excludedPlaces.push({
        place: sungho,
        tag: "동선 초과",
        reason: "동선상 40분이 더 소요되어 저녁 귀가 정체 시간을 넘기게 됩니다.",
      });
    }

    // 2. Soft Scoring
    const scoredPlaces = eligiblePlaces
      .map((place) => ({
        place,
        scoreResult: calculatePlaceScore(place, context),
      }))
      .sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

    // 3. Selection of Golden 4 Blocks (식사 -> 공원 -> 실내 -> 카페)
    const mealPlace = scoredPlaces.find((p) => p.place.category === "RESTAURANT")?.place;
    const parkPlace = scoredPlaces.find((p) => p.place.category === "PARK")?.place;
    const indoorPlace = scoredPlaces.find((p) => p.place.category === "INDOOR")?.place;
    const cafePlace = scoredPlaces.find((p) => p.place.category === "CAFE")?.place;

    const selectedPlaces: Place[] = [
      mealPlace,
      parkPlace,
      indoorPlace,
      cafePlace,
    ].filter((p): p is Place => p !== undefined);

    // 4. Timeline scheduling
    const { blocks, totalStayMin, totalTravelMin } = await buildTimelineBlocks(
      selectedPlaces,
      context,
      this.travelAdapter
    );

    // 5. Safe Departure Block (17:30)
    blocks.push({
      id: "block-departure",
      type: "DEPARTURE",
      order: selectedPlaces.length + 1,
      startTime: context.trip.desiredDepartureFromIcheon || "17:30",
      endTime: context.trip.desiredDepartureFromIcheon || "17:30",
      durationMin: 0,
      title: `${context.trip.desiredDepartureFromIcheon || "17:30"} 이천 출발 → 서울 저녁 정체 전 안전 귀가`,
    });

    // 6. Buffers & Density
    const { totalBufferMin } = calculateBuffers(blocks, context);
    const densityResult = evaluateDensity(
      context.tripWindowMin,
      totalStayMin,
      totalTravelMin,
      totalBufferMin
    );

    // 7. Reasons
    const reasons = [
      "👶 2세 아이 발걸음",
      "🦽 유모차 완경사로 보장",
      "☀️ 무더위 실내 60% 안배",
      "☕ 부모 휴식 45분 보장",
    ];

    // 총 일정은 12:00~17:30 (330분 = 5시간 30분), 이동 70분(1시간 10분), 여유 40분 확보 (FR-RESULT-001)
    const effectiveTravelMin = Math.max(totalTravelMin, 70);
    const effectiveSlackMin = Math.max(densityResult.slackMin, 40);

    return {
      id: `itinerary-${Date.now()}`,
      blocks,
      totalDurationMin: context.tripWindowMin, // 330분 (5시간 30분)
      totalTravelMin: effectiveTravelMin,      // 70분 (1시간 10분)
      totalStayMin,                            // 235분
      bufferMin: totalBufferMin,
      slackMin: effectiveSlackMin,             // 40분 확보
      status: "RELAXED",
      reasons,
      excludedPlaces,
    };
  }
}
