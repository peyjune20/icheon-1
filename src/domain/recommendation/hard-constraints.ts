import { Place } from "@/domain/models/place";
import { RecommendationContext } from "@/domain/models/trip-input";

export interface ConstraintResult {
  eligible: boolean;
  reason?: string;
}

export function evaluateHardConstraints(
  place: Place,
  context: RecommendationContext
): ConstraintResult {
  // 1. 휴무일 검사 (Closed Day check)
  const dateObj = new Date(context.trip.tripDate);
  const dayOfWeek = isNaN(dateObj.getTime()) ? 6 : dateObj.getDay(); // fallback Saturday

  if (place.openingHours.closedDays.includes(dayOfWeek)) {
    return {
      eligible: false,
      reason: `CLOSED_ON_DATE (${place.name}은(는) 해당 요일 정기 휴무입니다)`,
    };
  }

  // 2. 유모차 필수 조건 검사 (Stroller constraint)
  // strollerRequired === true AND strollerAccessible.value === "NO" -> 제외
  // 단, 카페(휴식 공간)는 아기의자 또는 안고 착석이 가능하므로 보행 산책/관광지 위주로 엄격 필터링
  if (context.trip.strollerRequired && place.strollerAccessible.value === "NO" && place.category !== "CAFE") {
    return {
      eligible: false,
      reason: `STROLLER_NOT_ACCESSIBLE (${place.name}은(는) 유모차 진입이 불가합니다)`,
    };
  }

  // 3. 기상 조건 검사 (Weather Hard Constraint)
  if (
    context.weather.condition === "HOT" &&
    place.indoorOutdoor === "OUTDOOR" &&
    place.weatherTags.includes("HOT_AVOID")
  ) {
    return {
      eligible: false,
      reason: `WEATHER_HOT_AVOID (${place.name}은(는) 폭염 시 야외 활동이 부적합합니다)`,
    };
  }

  if (
    context.weather.condition === "RAIN" &&
    place.indoorOutdoor === "OUTDOOR" &&
    place.weatherTags.includes("RAIN_AVOID")
  ) {
    return {
      eligible: false,
      reason: `WEATHER_RAIN_AVOID (${place.name}은(는) 우천 시 야외 이용이 불가합니다)`,
    };
  }

  return { eligible: true };
}
