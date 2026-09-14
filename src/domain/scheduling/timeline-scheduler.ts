import { Place } from "@/domain/models/place";
import { ItineraryBlock } from "@/domain/models/itinerary";
import { RecommendationContext } from "@/domain/models/trip-input";
import { TravelTimeAdapter } from "@/adapters/travel-time/travel-time-adapter.interface";

// Utility: minutes to "HH:mm"
export function minutesToTime(totalMin: number): string {
  const hours = Math.floor(totalMin / 60) % 24;
  const mins = totalMin % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Utility: "HH:mm" to minutes
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

export async function buildTimelineBlocks(
  places: Place[],
  context: RecommendationContext,
  travelAdapter: TravelTimeAdapter
): Promise<{ blocks: ItineraryBlock[]; totalStayMin: number; totalTravelMin: number }> {
  const blocks: ItineraryBlock[] = [];
  let currentMin = timeToMinutes(context.trip.arrivalInIcheon || "12:00");
  let totalStayMin = 0;
  let totalTravelMin = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const durationMin = place.recommendedDurationMin || 60;
    const startTime = minutesToTime(currentMin);
    const endTime = minutesToTime(currentMin + durationMin);

    // 장소 블록 생성
    blocks.push({
      id: `block-place-${place.id}`,
      type: "PLACE",
      order: i + 1,
      startTime,
      endTime,
      durationMin,
      placeId: place.id,
      place,
      title: place.name,
      subtitle: place.category === "RESTAURANT" ? "점심 식사" : place.category === "CAFE" ? "부모 휴식" : "체험 & 쉼",
      badges: [
        place.indoorOutdoor === "INDOOR" ? "실내 에어컨" : place.indoorOutdoor === "MIXED" ? "실내 + 그늘" : "야외 자연",
      ],
      recommendationReason: place.recommendationReason,
    });

    currentMin += durationMin;
    totalStayMin += durationMin;

    // 다음 장소가 있으면 이동 블록(TRAVEL) 생성
    if (i < places.length - 1) {
      const nextPlace = places[i + 1];
      const travelInfo = await travelAdapter.getTravelTime(place.id, nextPlace.id);
      const travelDurationMin = travelInfo.durationMin;
      const travelStartTime = minutesToTime(currentMin);
      const travelEndTime = minutesToTime(currentMin + travelDurationMin);

      // 낮잠 시간대 검사 (13:30 ~ 15:00 시간대에 20분 이상 이동 시 낮잠 칩 부여)
      const isNapTiming = currentMin >= timeToMinutes("13:30") && currentMin <= timeToMinutes("15:00");
      const transitNote = isNapTiming
        ? "🚗 이동 30분 (아기 낮잠 타이밍으로 추천 😴)"
        : `이동 ${travelDurationMin}분 · 주차 및 승하차 버퍼 10분 포함`;

      blocks.push({
        id: `block-travel-${place.id}-${nextPlace.id}`,
        type: "TRAVEL",
        order: i + 1,
        startTime: travelStartTime,
        endTime: travelEndTime,
        durationMin: travelDurationMin,
        title: `이동 ${travelDurationMin}분`,
        transitNote,
      });

      currentMin += travelDurationMin;
      totalTravelMin += travelDurationMin;
    }
  }

  return { blocks, totalStayMin, totalTravelMin };
}
