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

  // 7. 점심 식사 제외 조건 검사
  if (!context.trip.includeLunch && place.category === "RESTAURANT") {
    penalties.push("점심 식사 제외 설정으로 일정 배제");
    return {
      placeId: place.id,
      totalScore: 0,
      breakdown: {
        ageFit,
        familyFacility,
        routeEfficiency,
        weatherFit,
        localIdentity,
        parentRest: 0,
      },
      penalties,
      reasons: ["점심 식사 제외 조건"],
    };
  }

  // 8. 여행 스타일 보너스 (최대 15점)
  let styleBonus = 0;
  const styles = context.trip.styles || [];
  if (styles.includes("NATURE") && (place.category === "NATURE" || place.category === "PARK")) {
    styleBonus += 10;
    reasons.push("자연 산책 취향 적합");
  }
  if (styles.includes("INDOOR") && place.indoorOutdoor === "INDOOR") {
    styleBonus += 10;
    reasons.push("쾌적한 실내 위주 취향 적합");
  }
  if (styles.includes("LOCAL_FOOD") && place.category === "RESTAURANT") {
    styleBonus += 10;
    reasons.push("이천 쌀밥 맛집 취향 적합");
  }
  if (styles.includes("PARENT_REST") && place.category === "CAFE") {
    styleBonus += 8;
    reasons.push("부모 쉼표 카페 취향 적합");
  }
  if (styles.includes("PHOTO") && (place.category === "CAFE" || place.category === "NATURE")) {
    styleBonus += 6;
    reasons.push("가족 감성 사진 명소");
  }
  if (styles.includes("EXPERIENCE") && (place.category === "PARK" || place.category === "INDOOR" || place.category === "EXPERIENCE")) {
    styleBonus += 6;
    reasons.push("유아 친화 체험 명소");
  }

  // 9. 대중교통 친화도
  if (context.trip.transport === "PUBLIC_TRANSPORT") {
    if (place.id === "1" || place.id === "4") {
      styleBonus += 4;
      reasons.push("경강선 및 대중교통 접근 용이");
    }
  }

  // 총점 계산 (0~100점 클램핑)
  const rawTotal =
    ageFit + familyFacility + routeEfficiency + weatherFit + localIdentity + parentRest + styleBonus;
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
