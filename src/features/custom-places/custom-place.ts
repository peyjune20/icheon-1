import { Place, PlaceCategory } from "@/domain/models/place";
export function makeCustomPlace(input: { id: string; name: string; address: string; lat: number; lng: number; category: PlaceCategory }): Place {
  const unknown = { value: "UNKNOWN" as const, sourceType: "USER_REPORT" as const, note: "사용자 추가 장소 · 시설 정보는 방문 전에 확인해 주세요." };
  return { ...input, roadAddress: input.address, recommendedDurationMin: 60,
    openingHours: { open: "00:00", close: "23:59", closedDays: [] },
    parking: unknown, strollerAccessible: unknown, nursingRoom: unknown, diaperChangingStation: unknown,
    babyChair: unknown, toilet: unknown, shade: unknown, strollerRental: unknown,
    indoorOutdoor: "MIXED", weatherTags: [], imageFiles: [], thumbnailImage: "",
    recommendationSource: "USER_ADDED", verificationStatus: "USER_REPORTED", verifiedDate: "",
    recommendationReason: "직접 추가한 장소예요. 운영시간과 아이 동반 여건을 확인해 주세요.",
    coordinateSource: "사용자 선택 위치",
  };
}
