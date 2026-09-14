import { Place } from "@/domain/models/place";
import { RecommendationContext } from "@/domain/models/trip-input";
import { RECOMMENDATION_CONFIG } from "@/domain/config/recommendation.config";

export interface PlaceScoreBreakdown {
  ageFit: number;
  familyFacility: number;
  routeEfficiency: number;
  weatherFit: number;
  localIdentity: number;
  parentRest: number;
}

export interface PlaceScore {
  placeId: string;
  totalScore: number;
  breakdown: PlaceScoreBreakdown;
  penalties: string[];
  reasons: string[];
}

export function calculatePlaceScore(
  place: Place,
  context: RecommendationContext
): PlaceScore {
  const penalties: string[] = [];
  const reasons: string[] = [];

  // 1. 아이 연령 적합성 (25점 만점)
  let ageFit = 0;
  if (place.ageMinMonths !== undefined && place.ageMaxMonths !== undefined) {
    if (
      context.trip.childAgeMonths >= place.ageMinMonths &&
      context.trip.childAgeMonths <= place.ageMaxMonths
    ) {
      ageFit = RECOMMENDATION_CONFIG.weights.AGE_FIT;
      reasons.push(`${context.trip.displayAge} 아이 연령대 최적 적합`);
    } else {
      ageFit = 12; // 부분 적합
    }
  } else {
    ageFit = 18; // 전 연령 수용
  }

  // 2. 영유아 편의시설 점수 (25점 만점)
  let familyFacility = 0;
  if (place.strollerAccessible.value === "YES") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.strollerYes;
  } else if (
    context.trip.strollerRequired &&
    place.strollerAccessible.value === "UNKNOWN"
  ) {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.strollerUnknownPenalty;
    penalties.push("유모차 접근성 현장 확인 필요 감점");
  }

  if (place.nursingRoom.value === "YES") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.nursingRoomYes;
  }
  if (place.diaperChangingStation.value === "YES") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.diaperChangingYes;
  }
  if (place.babyChair.value === "YES") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.babyChairYes;
  }
  if (place.parking.value === "YES") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.parkingYes;
  }

  familyFacility = Math.max(0, Math.min(25, familyFacility));

  // 3. 날씨 적합도 (15점 만점)
  let weatherFit = 10;
  if (context.weather.condition === "HOT") {
    if (place.indoorOutdoor === "INDOOR") {
      weatherFit = RECOMMENDATION_CONFIG.weights.WEATHER_FIT;
      reasons.push("무더위 피서 실내 냉방 완비");
    } else if (place.indoorOutdoor === "MIXED") {
      weatherFit = 12;
    } else {
      weatherFit = 5;
    }
  }

  // 4. 동선 효율 (20점 만점 기본 부여)
  const routeEfficiency = 20;

  // 5. 이천 지역성 (10점 만점)
  let localIdentity = 8;
  if (place.name.includes("이천") || place.name.includes("솥") || place.name.includes("쌀")) {
    localIdentity = RECOMMENDATION_CONFIG.weights.LOCAL_IDENTITY;
    reasons.push("이천 특산 및 지역 대표성");
  }

  // 6. 부모 휴식 가치 (5점 만점)
  let parentRest = 0;
  if (
    context.trip.parentRestPriority === "HIGH" &&
    (place.category === "CAFE" || place.category === "PARK" || place.shade.value === "YES")
  ) {
    parentRest = RECOMMENDATION_CONFIG.weights.PARENT_REST;
    reasons.push("부모 힐링 및 휴식 환경 확보");
  } else {
    parentRest = 3;
  }

  // 총점 계산 (0~100점 클램핑)
  const rawTotal =
    ageFit + familyFacility + routeEfficiency + weatherFit + localIdentity + parentRest;
  const totalScore = Math.max(0, Math.min(100, rawTotal));

  return {
    placeId: place.id,
    totalScore,
    breakdown: {
      ageFit,
      familyFacility,
      routeEfficiency,
      weatherFit,
      localIdentity,
      parentRest,
    },
    penalties,
    reasons,
  };
}
