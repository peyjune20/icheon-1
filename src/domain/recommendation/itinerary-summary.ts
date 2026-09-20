import { Place } from "@/domain/models/place";
import { RecommendationContext } from "@/domain/models/trip-input";

export function ageLabel(months: number) {
  return months < 12 ? "12개월 미만" : months === 12 ? "1세" : months <= 24 ? "2세" : months <= 48 ? "3~4세" : "5세 이상";
}

export function itineraryReasons(places: Place[], context: RecommendationContext): string[] {
  const indoor = places.filter(p => p.indoorOutdoor === "INDOOR").length;
  const cafes = places.filter(p => p.category === "CAFE").length;
  const rest = { LOW: 20, MEDIUM: 40, HIGH: 60 }[context.trip.parentRestPriority];
  return [
    `${ageLabel(context.trip.childAgeMonths)} 아이 페이스`,
    context.trip.strollerRequired ? "유모차 동행 · 장소별 동선 확인" : "유모차 없이 이동",
    `실내 ${indoor}곳 / 전체 ${places.length}곳`,
    places.some(p => p.category === "RESTAURANT") ? "식사 장소 포함" : "식사 장소 미포함",
    cafes ? `카페 ${cafes}곳 · 각 ${rest}분 휴식` : "카페 미포함",
    context.trip.napTimeStart && context.trip.napTimeEnd ? `낮잠 ${context.trip.napTimeStart}~${context.trip.napTimeEnd}` : "낮잠 없음",
  ];
}
