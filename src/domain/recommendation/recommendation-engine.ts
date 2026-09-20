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
import { itineraryReasons } from "./itinerary-summary";

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
      const constraintResult = evaluateHardConstraints(place, context);
      if (!constraintResult.eligible) {
        let tag = "조건 제외";
        let reasonText = constraintResult.reason || "조건 불일치";
        excludedPlaces.push({
          place,
          tag,
          reason: reasonText,
        });
      } else {
        eligiblePlaces.push(place);
      }
    }


    // 2. Soft Scoring
    const scoredPlaces = eligiblePlaces
      .map((place) => ({
        place,
        scoreResult: calculatePlaceScore(place, context),
      }))
      .filter((sp) => sp.scoreResult.totalScore > 0)
      .sort((a, b) => b.scoreResult.totalScore - a.scoreResult.totalScore);

    // 3. Selection of Places dynamically based on tripWindowMin, includeLunch, and styles
    // Determine max stops based on time window
    const timeWindowCap = context.tripWindowMin < 200 ? 2 : context.tripWindowMin <= 300 ? 3 : context.maxBlocks;
    const maxStops = Math.max(2, Math.min(context.maxBlocks, timeWindowCap));

    const selectedPlaces: Place[] = [];

    // Step A: Lunch check
    if (context.trip.includeLunch) {
      const mealPlace = scoredPlaces.find((p) => p.place.category === "RESTAURANT")?.place;
      if (mealPlace) {
        selectedPlaces.push(mealPlace);
      }
    }

    // Step B: Activity spots (PARK, NATURE, INDOOR)
    const activitiesNeeded = Math.max(1, maxStops - selectedPlaces.length - 1);
    const availableActivities = scoredPlaces.filter(
      (p) =>
        p.place.category !== "RESTAURANT" &&
        p.place.category !== "CAFE" &&
        !selectedPlaces.some((sp) => sp.id === p.place.id)
    );

    for (let i = 0; i < activitiesNeeded && i < availableActivities.length; i++) {
      selectedPlaces.push(availableActivities[i].place);
    }

    // Step C: Parent Rest spot (CAFE)
    const cafePlace = scoredPlaces.find(
      (p) => p.place.category === "CAFE" && !selectedPlaces.some((sp) => sp.id === p.place.id)
    )?.place;
    if (cafePlace && selectedPlaces.length < maxStops) {
      selectedPlaces.push(cafePlace);
    }

    // If still have room and there are more activities
    while (selectedPlaces.length < maxStops) {
      const extra = scoredPlaces.find((p) => !selectedPlaces.some((sp) => sp.id === p.place.id))?.place;
      if (!extra) break;
      selectedPlaces.push(extra);
    }

    // 같은 부지의 공원 산책과 라이스카페 휴식은 각각의 장소 카드로 보여 주되,
    // 실제 동선처럼 서로 이어서 안내한다.
    const themePark = selectedPlaces.find((place) => place.id === "3");
    const riceCafe = selectedPlaces.find((place) => place.id === "6");
    if (themePark && riceCafe) {
      const withoutRiceCafe = selectedPlaces.filter((place) => place.id !== "6");
      const themeParkIndex = withoutRiceCafe.findIndex((place) => place.id === "3");
      selectedPlaces.splice(0, selectedPlaces.length, ...withoutRiceCafe);
      selectedPlaces.splice(themeParkIndex + 1, 0, riceCafe);
    }

    // Populate excludedPlaces for places not selected
    for (const place of allPlaces) {
      if (!selectedPlaces.some((sp) => sp.id === place.id) && !excludedPlaces.some((ep) => ep.place.id === place.id)) {
        let tag = "동선 조율";
        let reason = "추천 장소 수와 선택한 취향을 고려해 추가 후보로 남겼어요. 직접 코스에 넣을 수 있어요.";
        if (place.category === "RESTAURANT" && !context.trip.includeLunch) {
          tag = "점심 제외";
          reason = "점심 식사 제외 설정으로 자연·카페 중심 코스에 집중했어요.";
        } else if (place.id === "2") {
          tag = "폭염/체력 안배";
          reason = "숲 산책 구간으로 아이의 컨디션에 맞추어 다음 방문 후보로 남겨두었어요.";
        } else if (place.id === "7") {
          tag = "동선 조율";
          reason = "동선상 여유로운 이동을 위해 다음 나들이 후보로 보관했어요.";
        }
        excludedPlaces.push({
          place,
          tag,
          reason,
        });
      }
    }

    // 4. Timeline scheduling
    const { blocks, totalStayMin, totalTravelMin } = await buildTimelineBlocks(
      selectedPlaces,
      context,
      this.travelAdapter
    );

    // The end is calculated from the last stop, never from a fixed home city.
    const depTime = blocks.at(-1)?.endTime ?? context.trip.arrivalInIcheon;
    blocks.push({
      id: "block-departure",
      type: "DEPARTURE",
      order: selectedPlaces.length + 1,
      startTime: depTime,
      endTime: depTime,
      durationMin: 0,
      title: `${depTime} 이천 코스 종료 예상 · 귀가는 우리 가족 일정에 맞게`,
    });

    // 6. Buffers & Density
    const { totalBufferMin } = calculateBuffers(blocks, context);
    const densityResult = evaluateDensity(
      context.tripWindowMin,
      totalStayMin,
      totalTravelMin,
      totalBufferMin
    );

    // 7. Contextual Dynamic Reasons
    const reasons = itineraryReasons(selectedPlaces, context);

    return {
      id: `itinerary-${Date.now()}`,
      blocks,
      totalDurationMin: totalStayMin + totalTravelMin,
      totalTravelMin,
      totalStayMin,
      bufferMin: totalBufferMin,
      slackMin: densityResult.slackMin,
      status: densityResult.status,
      reasons,
      excludedPlaces,
    };
  }
}
