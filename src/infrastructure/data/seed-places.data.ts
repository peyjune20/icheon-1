import { Place } from "@/domain/models/place";
import { applyPlaceResearch } from "./place-research.data";

const AI_PLACE_VISUALS = {
  NATURE: ["/assets/ai-nature-forest.png", "/assets/ai-nature-lake.png", "/assets/ai-nature-garden.png"],
  CULTURE: ["/assets/ai-culture-pottery.png", "/assets/ai-culture-gallery.png", "/assets/ai-culture-play.png"],
  FAMILY: ["/assets/ai-family-cafe.png", "/assets/ai-family-spa.png", "/assets/ai-family-market.png"],
};

type AiPlaceInput = Pick<
  Place,
  | "id"
  | "name"
  | "category"
  | "address"
  | "roadAddress"
  | "lat"
  | "lng"
  | "recommendedDurationMin"
  | "indoorOutdoor"
  | "weatherTags"
  | "editorialReview"
  | "recommendationReason"
  | "sourceUrl"
>;

const aiEvidence = (note: string) => ({
  value: "UNKNOWN" as const,
  sourceType: "WEB_PAGE" as const,
  note,
});

const getAiVisuals = (place: AiPlaceInput) => {
  if (place.category === "NATURE" || place.category === "PARK") return AI_PLACE_VISUALS.NATURE;
  if (place.category === "CAFE" || place.category === "RESTAURANT") return AI_PLACE_VISUALS.FAMILY;
  return AI_PLACE_VISUALS.CULTURE;
};

const createAiPlace = (place: AiPlaceInput): Place => {
  const visuals = getAiVisuals(place);
  return {
  ...place,
  openingHours: { open: "방문 전 확인", close: "공식 채널 확인", closedDays: [] },
  parking: aiEvidence("AI 추천 장소로, 주차 정보는 공식 안내에서 확인해 주세요."),
  strollerAccessible: aiEvidence("AI 추천 장소로, 유모차 동선은 방문 전 확인해 주세요."),
  nursingRoom: aiEvidence("수유실 운영 여부는 공식 안내에서 확인해 주세요."),
  diaperChangingStation: aiEvidence("기저귀 갈이대 운영 여부는 공식 안내에서 확인해 주세요."),
  babyChair: aiEvidence("아기의자 보유 여부는 공식 안내에서 확인해 주세요."),
  toilet: aiEvidence("화장실 위치와 운영 여부는 현장에서 확인해 주세요."),
  shade: aiEvidence("날씨별 쉼터와 그늘은 방문 전 확인해 주세요."),
  strollerRental: aiEvidence("유모차 대여 여부는 공식 안내에서 확인해 주세요."),
  ageMinMonths: 0,
  ageMaxMonths: 120,
  imageFiles: visuals,
  thumbnailImage: visuals[Number(place.id) % visuals.length],
  imageDescriptions: [
    "AI가 장소 성격을 바탕으로 만든 분위기 이미지예요. 실제 현장 모습은 공식 안내를 확인해 주세요.",
    "가족이 공간의 분위기를 미리 가늠할 수 있도록 만든 AI 안내 이미지예요.",
    "방문 전에는 운영 정보와 실제 사진을 공식 채널에서 다시 확인해 주세요.",
  ],
  verificationStatus: "WEB_VERIFIED",
  verifiedDate: "2026-09-20",
  recommendationSource: "AI_RECOMMENDED",
  };
};

const AI_RECOMMENDED_PLACES: Place[] = [
  createAiPlace({
    id: "8", name: "덕평공룡수목원", category: "EXPERIENCE", address: "경기 이천시 마장면 작촌로 282", roadAddress: "경기 이천시 마장면 작촌로 282", lat: 37.2481, lng: 127.3631,
    recommendedDurationMin: 90, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "공룡 조형물과 산책 동선을 함께 즐길 수 있는 이천의 대표 가족 나들이 후보예요.", recommendationReason: "공룡을 좋아하는 아이가 있다면 자연 산책과 함께 넣기 좋은 AI 추천 후보예요.", sourceUrl: "https://www.icheon.go.kr/tour/index.do?searchField=ALL",
  }),
  createAiPlace({
    id: "9", name: "설봉공원", category: "PARK", address: "경기 이천시 관고동 408-3", roadAddress: "경기 이천시 경충대로2709번길 128 일원", lat: 37.2852, lng: 127.451,
    recommendedDurationMin: 70, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "설봉호수와 조각공원, 넓은 산책 공간을 함께 즐길 수 있는 도심 공원이에요.", recommendationReason: "호수 산책과 문화 공간을 한 번에 경험하고 싶은 가족에게 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/contents.do?mid=0102050300",
  }),
  createAiPlace({
    id: "10", name: "이천도자예술마을 예스파크", category: "EXPERIENCE", address: "경기 이천시 신둔면 도자예술로5번길 109", roadAddress: "경기 이천시 신둔면 도자예술로5번길 109", lat: 37.3176, lng: 127.4088,
    recommendedDurationMin: 100, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_AVOID"],
    editorialReview: "도자 공방과 마을 산책, 체험 공간이 모인 이천 대표 문화예술마을이에요.", recommendationReason: "아이와 공예 구경을 하며 천천히 걷고 싶은 날의 문화 체험 후보예요.", sourceUrl: "https://www.2000yespark.or.kr/",
  }),
  createAiPlace({
    id: "11", name: "이천시립박물관", category: "INDOOR", address: "경기 이천시 경충대로2709번길 306", roadAddress: "경기 이천시 경충대로2709번길 306", lat: 37.2895, lng: 127.4503,
    recommendedDurationMin: 50, indoorOutdoor: "INDOOR", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "이천의 도자 문화와 지역 이야기를 차분히 만날 수 있는 실내 문화 공간이에요.", recommendationReason: "비가 오거나 더운 날, 설봉공원 동선과 함께 넣기 좋은 실내 후보예요.", sourceUrl: "https://www.icheon.go.kr/tour/contents.do?mid=0102050300",
  }),
  createAiPlace({
    id: "12", name: "이천시립월전미술관", category: "INDOOR", address: "경기 이천시 경충대로2697번길 172", roadAddress: "경기 이천시 경충대로2697번길 172", lat: 37.2912, lng: 127.4491,
    recommendedDurationMin: 50, indoorOutdoor: "INDOOR", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "설봉공원 가까이에서 한국화와 고미술을 만날 수 있는 조용한 미술관이에요.", recommendationReason: "아이 컨디션에 따라 짧고 차분한 문화 시간을 더하고 싶을 때 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/contents.do?mid=0102050300",
  }),
  createAiPlace({
    id: "13", name: "이천 세라피아", category: "EXPERIENCE", address: "경기 이천시 경충대로2697번길 263", roadAddress: "경기 이천시 경충대로2697번길 263", lat: 37.286, lng: 127.449,
    recommendedDurationMin: 80, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_AVOID"],
    editorialReview: "도자 전시와 체험 공간을 중심으로 구성된 복합 문화예술 공간이에요.", recommendationReason: "이천다운 도자 문화와 체험을 함께 담고 싶은 가족에게 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/index.do?searchField=ALL",
  }),
  createAiPlace({
    id: "14", name: "테르메덴", category: "EXPERIENCE", address: "경기 이천시 모가면 사실로 984", roadAddress: "경기 이천시 모가면 사실로 984", lat: 37.1705, lng: 127.455,
    recommendedDurationMin: 150, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "실내외 스파와 휴식 공간을 함께 운영하는 가족형 물놀이·휴식 후보예요.", recommendationReason: "날씨 영향을 덜 받으며 온 가족이 오래 머물 계획이라면 확인해 볼 만해요.", sourceUrl: "https://pf.kakao.com/_aeBvs",
  }),
  createAiPlace({
    id: "15", name: "롯데프리미엄아울렛 이천점", category: "INDOOR", address: "경기 이천시 마장면 프리미엄아울렛로 113-49", roadAddress: "경기 이천시 마장면 프리미엄아울렛로 113-49", lat: 37.2672, lng: 127.3559,
    recommendedDurationMin: 90, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "식사와 쇼핑, 실내외 휴식을 한곳에서 조합할 수 있는 대형 복합 공간이에요.", recommendationReason: "이동을 줄이며 식사와 휴식을 해결하고 싶은 날의 보조 후보예요.", sourceUrl: "https://www.lotteshopping.com/store/main?cstrCd=0007",
  }),
  createAiPlace({
    id: "16", name: "별빛정원우주", category: "EXPERIENCE", address: "경기 이천시 마장면 덕이로154번길 287-76", roadAddress: "경기 이천시 마장면 덕이로154번길 287-76", lat: 37.2515, lng: 127.3674,
    recommendedDurationMin: 80, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "빛과 정원을 주제로 산책하며 사진을 남기기 좋은 야외 체험 후보예요.", recommendationReason: "해 질 무렵 가족 사진과 가벼운 산책을 계획할 때 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/index.do?searchField=ALL",
  }),
  createAiPlace({
    id: "17", name: "지산포레스트리조트", category: "EXPERIENCE", address: "경기 이천시 마장면 지산로 267", roadAddress: "경기 이천시 마장면 지산로 267", lat: 37.229, lng: 127.3628,
    recommendedDurationMin: 120, indoorOutdoor: "MIXED", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "계절별 야외 활동과 리조트 시설을 함께 확인할 수 있는 레저형 후보예요.", recommendationReason: "아이 연령과 시즌 프로그램이 맞는지 확인한 뒤 넣어볼 만한 체험 후보예요.", sourceUrl: "https://www.jisanresort.co.kr/",
  }),
  createAiPlace({
    id: "18", name: "에덴파라다이스", category: "NATURE", address: "경기 이천시 마장면 서이천로 449-79", roadAddress: "경기 이천시 마장면 서이천로 449-79", lat: 37.2487, lng: 127.385,
    recommendedDurationMin: 90, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_AVOID"],
    editorialReview: "정원과 전시, 휴식 공간을 함께 즐길 수 있는 감성 나들이 후보예요.", recommendationReason: "조용한 산책과 부모 휴식을 함께 원할 때 확인해 볼 만해요.", sourceUrl: "https://www.edenparadise.co.kr/",
  }),
  createAiPlace({
    id: "19", name: "시몬스 테라스", category: "CAFE", address: "경기 이천시 모가면 사실로 988", roadAddress: "경기 이천시 모가면 사실로 988", lat: 37.172, lng: 127.458,
    recommendedDurationMin: 60, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "전시와 카페, 야외 휴식 공간을 함께 둘러볼 수 있는 복합 문화 공간이에요.", recommendationReason: "테르메덴·모가 권역에서 부모 휴식 시간을 더하고 싶을 때 추천해요.", sourceUrl: "https://www.simmons.co.kr/terrace",
  }),
  createAiPlace({
    id: "20", name: "이천치유의숲", category: "NATURE", address: "경기 이천시 관고동 설봉산 일원", roadAddress: "경기 이천시 관고동 설봉산 일원", lat: 37.2854, lng: 127.48,
    recommendedDurationMin: 70, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "설봉산 자락에서 계절에 따라 숲길과 휴식을 즐길 수 있는 자연 산책 후보예요.", recommendationReason: "유모차 동선과 실제 프로그램을 확인한 뒤 선선한 날 자연 코스로 담아보세요.", sourceUrl: "https://www.icheon.go.kr/tour/index.do?searchField=ALL",
  }),
  createAiPlace({
    id: "21", name: "산수유마을", category: "NATURE", address: "경기 이천시 백사면 원적로 일원", roadAddress: "경기 이천시 백사면 원적로 일원", lat: 37.284, lng: 127.542,
    recommendedDurationMin: 70, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "원적산 자락의 계절 풍경과 마을길을 만날 수 있는 이천9경 후보예요.", recommendationReason: "꽃이 피는 계절에는 짧은 마을 산책과 가족 사진을 계획할 때 살펴볼 만해요.", sourceUrl: "https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=199&mid=0101060000",
  }),
  createAiPlace({
    id: "22", name: "사기막골도예촌", category: "EXPERIENCE", address: "경기 이천시 사음동 도예촌 일원", roadAddress: "경기 이천시 사음동 도예촌 일원", lat: 37.291, lng: 127.43,
    recommendedDurationMin: 80, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_AVOID"],
    editorialReview: "작업실과 전시, 도자 문화를 만날 수 있는 이천 도예 여행 후보예요.", recommendationReason: "도자 마을의 분위기를 가볍게 둘러보고 싶은 가족에게 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/contents.do?mid=0102010000",
  }),
  createAiPlace({
    id: "23", name: "반룡송", category: "NATURE", address: "경기 이천시 백사면 도립리", roadAddress: "경기 이천시 백사면 도립리", lat: 37.282, lng: 127.526,
    recommendedDurationMin: 35, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "이천9경으로 소개되는 오래된 소나무와 주변 풍경을 만나는 짧은 자연 방문지예요.", recommendationReason: "긴 일정 대신 짧은 자연 정차와 사진 시간을 원할 때 후보로 남겨둘 수 있어요.", sourceUrl: "https://www.icheon.go.kr/tour/main.do",
  }),
  createAiPlace({
    id: "24", name: "애련정", category: "PARK", address: "경기 이천시 안흥동 안흥지 일원", roadAddress: "경기 이천시 안흥동 안흥지 일원", lat: 37.276, lng: 127.445,
    recommendedDurationMin: 40, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "안흥지 주변의 단청 정자와 산책 풍경을 만날 수 있는 도심 휴식 후보예요.", recommendationReason: "설봉 권역에서 짧은 호수 산책을 더하고 싶을 때 살펴볼 만해요.", sourceUrl: "https://www.icheon.go.kr/tour/main.do",
  }),
  createAiPlace({
    id: "25", name: "도드람산 삼봉", category: "NATURE", address: "경기 이천시 마장면 목리 일원", roadAddress: "경기 이천시 마장면 목리 일원", lat: 37.25, lng: 127.38,
    recommendedDurationMin: 60, indoorOutdoor: "OUTDOOR", weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    editorialReview: "이천9경으로 소개되는 바위 능선과 산 풍경을 만나는 자연 후보예요.", recommendationReason: "등산 코스 난이도와 아이 동반 가능 구간은 공식 안내를 확인한 뒤 계획해 주세요.", sourceUrl: "https://www.icheon.go.kr/tour/main.do",
  }),
  createAiPlace({
    id: "26", name: "청강만화역사박물관", category: "INDOOR", address: "경기 이천시 마장면 청강가창로 389-94", roadAddress: "경기 이천시 마장면 청강가창로 389-94", lat: 37.27, lng: 127.37,
    recommendedDurationMin: 60, indoorOutdoor: "INDOOR", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "만화와 일러스트 문화 콘텐츠를 만날 수 있는 실내 관람 후보예요.", recommendationReason: "비나 더위에 실내 문화 시간을 더하고 싶을 때 공식 운영 정보를 확인해 보세요.", sourceUrl: "https://www.icheon.go.kr/tour/",
  }),
  createAiPlace({
    id: "27", name: "서희역사관", category: "INDOOR", address: "경기 이천시 부발읍 무촌로 일원", roadAddress: "경기 이천시 부발읍 무촌로 일원", lat: 37.28, lng: 127.5,
    recommendedDurationMin: 50, indoorOutdoor: "INDOOR", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "이천의 역사 인물을 중심으로 지역 이야기를 살펴볼 수 있는 실내 문화 후보예요.", recommendationReason: "차분한 실내 관람을 넣고 싶은 날 공식 운영 일정을 확인해 보세요.", sourceUrl: "https://www.icheon.go.kr/tour/",
  }),
  createAiPlace({
    id: "28", name: "이천무형문화재전수교육관", category: "EXPERIENCE", address: "경기 이천시 관고동 설봉공원 일원", roadAddress: "경기 이천시 관고동 설봉공원 일원", lat: 37.287, lng: 127.452,
    recommendedDurationMin: 55, indoorOutdoor: "INDOOR", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "이천의 전통 공예와 무형문화재 이야기를 만날 수 있는 문화 체험 후보예요.", recommendationReason: "설봉공원 인근에서 이천다운 문화 요소를 더하고 싶을 때 추천해요.", sourceUrl: "https://www.icheon.go.kr/tour/",
  }),
  createAiPlace({
    id: "29", name: "덕평자연휴게소", category: "CAFE", address: "경기 이천시 마장면 덕이로154번길 287-76", roadAddress: "경기 이천시 마장면 덕이로154번길 287-76", lat: 37.251, lng: 127.367,
    recommendedDurationMin: 45, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_OK"],
    editorialReview: "휴식과 식사, 야외 정원을 함께 살펴볼 수 있는 이동 중 쉼표 후보예요.", recommendationReason: "마장 권역 이동 중 짧은 휴식이 필요할 때 공식 운영 정보를 확인해 보세요.", sourceUrl: "https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=37&mid=0302040000",
  }),
  createAiPlace({
    id: "30", name: "부래미마을", category: "EXPERIENCE", address: "경기 이천시 율면 부래미로 일원", roadAddress: "경기 이천시 율면 부래미로 일원", lat: 37.09, lng: 127.53,
    recommendedDurationMin: 90, indoorOutdoor: "MIXED", weatherTags: ["HOT_OK", "RAIN_AVOID"],
    editorialReview: "농촌 풍경과 계절 체험 프로그램을 확인할 수 있는 이천 남부 체험 후보예요.", recommendationReason: "아이 연령에 맞는 체험 운영일을 확인한 뒤 여유 있는 하루 코스로 넣어보세요.", sourceUrl: "https://www.icheon.go.kr/tour/contents.do?mid=0102040000",
  }),
];

export const SEED_PLACES: Place[] = ([
  {
    id: "1",
    name: "미솥지음",
    category: "RESTAURANT",
    address: "경기 이천시 신둔면 원적로 85",
    roadAddress: "경기 이천시 신둔면 원적로 85",
    lat: 37.3195,
    lng: 127.4112,
    recommendedDurationMin: 60,
    openingHours: { open: "11:00", close: "20:30", closedDays: [2] }, // 화 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "광폭 전용 주차장 구비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "단차 없는 진입로 및 넓은 테이블 간격 (유모차 가능)" },
    nursingRoom: { value: "NO", sourceType: "FIELD_VISIT", note: "독립 수유실 없음" },
    diaperChangingStation: { value: "NO", sourceType: "FIELD_VISIT", note: "기저귀 갈이대 없음" },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT", note: "아기의자 8개 보유 확인" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 남녀 분리 화장실" },
    shade: { value: "NO", sourceType: "FIELD_VISIT", note: "식사 공간 외 별도 휴식 공간 없음" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "INDOOR",
    ageMinMonths: 12,
    ageMaxMonths: 48,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/1-1.jpg",
      "/resources/pic/1-2.jpg",
      "/resources/pic/1-3.jpg",
      "/resources/pic/1-4.jpg",
      "/resources/pic/1-5.jpg"
    ],
    thumbnailImage: "/resources/pic/1-1.jpg",
    imageDescriptions: [
      "단차 없는 넓은 입구 전경 및 쾌적한 전용 주차장",
      "유모차가 부드럽게 진입할 수 있는 완경사 램프 진입로",
      "테이블 간격이 넉넉하여 유모차 거치가 자유로운 실내 홀",
      "안전벨트 장착 원목 유아 식탁의자 (8점 완비)",
      "아이와 함께 먹기 좋은 정갈한 이천 쌀밥 정식 상차림"
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "아이와 함께 먹기 좋은 부드러운 쌀밥과 자극 없는 반찬. 유모차 동반 식사에 최적화되어 있습니다.",
    recommendationReason: "이천 도착 직후 바로 식사하며 아이 컨디션과 허기를 달래기 좋아요. 테이블 간격이 넓어 유모차 거치가 편합니다."
  },
  {
    id: "2",
    name: "모가의 숲",
    category: "NATURE",
    address: "경기 이천시 모가면 진상미로 1163번길",
    roadAddress: "경기 이천시 모가면 진상미로 1163번길",
    lat: 37.1524,
    lng: 127.4681,
    recommendedDurationMin: 60,
    openingHours: { open: "10:00", close: "18:00", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "야외 주차장 구비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "완경사 숲 산책로 유모차 가능 (계곡 구간은 유모차 불가)" },
    nursingRoom: { value: "NO", sourceType: "FIELD_VISIT", note: "독립 수유실 부재" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "기저귀 갈이대 구비" },
    babyChair: { value: "NO", sourceType: "FIELD_VISIT", note: "야외 벤치 위주" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "공용 화장실 구비" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "숲 그늘 쉼터 및 휴식 공간 다수" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "OUTDOOR",
    ageMinMonths: 12,
    ageMaxMonths: 84,
    weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    imageFiles: [
      "/resources/pic/2-1.jpg",
      "/resources/pic/2-2.jpg",
      "/resources/pic/2-3.jpg",
      "/resources/pic/2-4.jpg",
      "/resources/pic/2-5.jpg"
    ],
    thumbnailImage: "/resources/pic/2-1.jpg",
    imageDescriptions: [
      "피톤치드 가득한 완경사 숲길 산책로 (유모차 주행 가능)",
      "대형 나무 그늘 아래 조성된 평상과 가족 쉼터",
      "아이와 함께 자연 생태를 관찰할 수 있는 숲속 덱로드",
      "자연 친화적 모래놀이 공간 및 야외 잔디 마당",
      "숲속 카페 테라스 및 그늘 휴식 공간"
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "자연 친화적 숲길로 날씨가 선선할 때 최고의 쉼터. 풍부한 나무 그늘과 평상이 마련되어 가족 산책에 좋습니다.",
    recommendationReason: "피톤치드 가득한 숲속에서 아이와 여유롭게 흙과 나무를 만끽하기 좋은 자연 쉼터입니다."
  },
  {
    id: "3",
    name: "이천농업테마공원",
    category: "PARK",
    address: "경기 이천시 모가면 공원로 48",
    roadAddress: "경기 이천시 모가면 공원로 48",
    lat: 37.1583,
    lng: 127.4729,
    recommendedDurationMin: 60,
    openingHours: { open: "09:30", close: "18:30", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "150대 무료 전용 주차장, 도보 2분" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "턱 없는 완경사 램프 및 덱길 (유모차 가능)" },
    nursingRoom: { value: "YES", sourceType: "FIELD_VISIT", note: "독립 1인 수유부스, 안락소파, 전자레인지 구비" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "쌀문화전시관 1층 독립형 갈이대 및 온수 세면대" },
    babyChair: { value: "NO", sourceType: "FIELD_VISIT", note: "공원 야외 쉼터에는 별도 아기의자가 없습니다." },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "가족 전용 다목적 화장실 3개소 (유모차 동반 가능)" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "대형 느티나무 그늘과 파고라 쉼터가 있습니다." },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "현장 대여 미운영" },
    indoorOutdoor: "OUTDOOR",
    ageMinMonths: 0,
    ageMaxMonths: 48,
    weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    imageFiles: [
      "/resources/pic/3-1.jpg",
      "/resources/pic/3-2.jpg",
      "/resources/pic/3-3.jpg",
      "/resources/pic/new/3-7.jpg"
    ],
    thumbnailImage: "/resources/pic/3-1.jpg",
    imageDescriptions: [
      "디럭스 유모차도 매끄럽게 달리는 완경사 목재 덱로드",
      "쌀문화전시관 1층 독립 수유실 및 온수 기저귀 갈이대",
      "대형 느티나무 그늘 파고라와 잔디 쉼터",
      "공원 안에서 만나는 이천 쌀 문화 안내 공간"
    ],
    mediaFiles: [
      { src: "/resources/pic/3-1.jpg", type: "IMAGE", description: "디럭스 유모차도 매끄럽게 달리는 완경사 목재 덱로드" },
      { src: "/resources/pic/3-2.jpg", type: "IMAGE", description: "쌀문화전시관 1층 독립 수유실 및 온수 기저귀 갈이대" },
      { src: "/resources/pic/3-3.jpg", type: "IMAGE", description: "대형 느티나무 그늘 파고라와 잔디 쉼터" },
      { src: "/resources/pic/new/3-7.jpg", type: "IMAGE", description: "공원 안에서 만나는 이천 쌀 문화 안내 공간" },
      { src: "/resources/pic/new/3-5.mp4", type: "VIDEO", description: "공원에서 이어지는 이천 농업 문화의 현장 영상" },
      { src: "/resources/pic/new/3-6.mp4", type: "VIDEO", description: "이천 쌀 문화 공간을 둘러보는 현장 영상" },
      { src: "/resources/pic/new/3-8 5분도미 도정중.mp4", type: "VIDEO", description: "5분도미를 도정하는 이천 쌀 문화 현장 영상" },
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "디럭스 유모차를 끌고 걷기 좋은 완경사 덱길과 넓은 잔디 쉼터가 있는 대표 산책 공간입니다.",
    recommendationReason: "완만한 덱길과 그늘 쉼터를 따라 아이와 부담 없이 산책하기 좋은 공원이에요."
  },
  {
    id: "4",
    name: "이천시환경학습관",
    category: "INDOOR",
    address: "경기 이천시 호법면 중부대로 798번길",
    roadAddress: "경기 이천시 호법면 중부대로 798번길",
    lat: 37.2341,
    lng: 127.4285,
    recommendedDurationMin: 40,
    openingHours: { open: "10:00", close: "17:00", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "전용 주차 공간 완비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "엘리베이터 완비 및 경사로 관람 가능 (유모차 가능)" },
    nursingRoom: { value: "NO", sourceType: "FIELD_VISIT", note: "독립 수유실 없음" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "장애인/가족 화장실 내 구비" },
    babyChair: { value: "NO", sourceType: "FIELD_VISIT", note: "별도 아기의자 없음" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 청결 화장실" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "100% 실내 냉방 쉼터 및 휴식 공간 완비" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "INDOOR",
    ageMinMonths: 12,
    ageMaxMonths: 72,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/4-1.jpg",
      "/resources/pic/4-2.jpg",
      "/resources/pic/4-3.jpg",
      "/resources/pic/4-4.jpg",
      "/resources/pic/4-5.jpg"
    ],
    thumbnailImage: "/resources/pic/4-1.jpg",
    imageDescriptions: [
      "사계절 쾌적한 실내 아열대 온실 관람로 (100% 실내 냉방)",
      "유모차 이동이 수월한 엘리베이터 및 평지 동선",
      "영유아 눈높이에 맞춘 대형 수족관 및 물고기 관찰 구역",
      "푸른 열대 식물 터널과 아기 감성 포토존",
      "가족 전용 다목적 화장실 및 기저귀 갈이대"
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "더운 한낮에 물고기와 아열대 식물을 시원한 실내에서 관람할 수 있어 아기에게 자극이 적고 쾌적함.",
    recommendationReason: "무더운 오후 시간대 실내에서 시원하게 물고기와 식물을 관찰할 수 있는 쾌적한 쉼표 장소입니다."
  },
  {
    id: "5",
    name: "을를 (Cafe Eulele)",
    category: "CAFE",
    address: "경기 이천시 율면 임오산로 372",
    roadAddress: "경기 이천시 율면 임오산로 372",
    lat: 37.1121,
    lng: 127.5218,
    recommendedDurationMin: 45,
    openingHours: { open: "11:00", close: "20:00", closedDays: [] }, // 연중무휴
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "대형 전용 주차장 구비" },
    strollerAccessible: { value: "NO", sourceType: "FIELD_VISIT", note: "유모차 불가 (실내 통로 협소 및 계단 단차로 유모차 반입 제한)" },
    nursingRoom: { value: "NO", sourceType: "FIELD_VISIT", note: "수유실 없음" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "화장실 내 기저귀 갈이대 구비" },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT", note: "아기의자 다수 구비" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 화장실 청결" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 냉방 및 야외 그늘막 휴식 공간 구비" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "MIXED",
    ageMinMonths: 0,
    ageMaxMonths: 84,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/5-1.jpg",
      "/resources/pic/5-2.jpg",
      "/resources/pic/5-3.jpg",
      "/resources/pic/5-4.jpg"
    ],
    thumbnailImage: "/resources/pic/5-1.jpg",
    imageDescriptions: [
      "아이들이 안전하게 뛰어놀 수 있는 탁 트인 천연 잔디마당",
      "모던하고 감각적인 카페 본관 건축 및 전면 통유리창",
      "아늑한 실내 좌석과 구비된 원목 아기의자",
      "야외 파라솔 테라스 그늘 쉼터"
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "넓은 잔디밭과 감성적인 건축이 조화로운 카페. 귀가 전 부모가 커피 한 잔으로 에너지를 충전하기 최적.",
    recommendationReason: "집으로 출발하기 전 부모가 커피 한 잔과 함께 한숨 돌리는 마지막 충전 시간입니다."
  },
  {
    id: "6",
    name: "라이스카페",
    category: "CAFE",
    address: "경기 이천시 모가면 공원로 48",
    roadAddress: "경기 이천시 모가면 공원로 48",
    lat: 37.1583,
    lng: 127.4729,
    recommendedDurationMin: 30,
    openingHours: { open: "10:00", close: "18:00", closedDays: [1] },
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "농업테마공원 공용 무료 주차장을 이용할 수 있습니다." },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "공원 덱길에서 이어지는 평지 출입구로 유모차 진입이 가능합니다." },
    nursingRoom: { value: "YES", sourceType: "FIELD_VISIT", note: "인접 쌀문화전시관 수유실을 이용할 수 있습니다." },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "인접 쌀문화전시관 1층 기저귀 갈이대를 이용할 수 있습니다." },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT", note: "아기의자를 보유하고 있으며, 혼잡 시간에는 확인을 권장합니다." },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "공원 가족 화장실을 이용할 수 있습니다." },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "냉방 실내 좌석과 창가 휴식 공간이 있습니다." },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "유모차 대여는 운영하지 않습니다." },
    indoorOutdoor: "INDOOR",
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/3-4.jpg",
      "/resources/pic/new/라이스카페1.jpg",
      "/resources/pic/new/라이스카페2.jpg",
      "/resources/pic/new/라이스카페3.jpg",
      "/resources/pic/new/팜마켓1.jpg",
      "/resources/pic/new/팜마켓2.jpg",
      "/resources/pic/new/팜마켓3.jpg",
      "/resources/pic/new/팜마켓4.jpg",
    ],
    thumbnailImage: "/resources/pic/new/라이스카페1.jpg",
    imageDescriptions: [
      "공원 내 쾌적한 냉방 라이스카페 실내 라운지",
      "이천 쌀을 테마로 편안하게 쉬어갈 수 있는 라이스카페 전경",
      "아이와 함께 앉기 좋은 라이스카페 실내 좌석",
      "쌀 디저트와 음료를 즐길 수 있는 라이스카페 공간",
      "지역 농산물을 만나는 팜마켓 첫 번째 진열 공간",
      "이천 특산품을 둘러볼 수 있는 팜마켓 전경",
      "가족이 함께 고르기 좋은 팜마켓 상품 코너",
      "라이스카페와 이어서 둘러보기 좋은 팜마켓 공간",
    ],
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "공원 산책 후 시원한 실내에서 쌀아이스크림과 음료를 즐기기 좋은 짧은 휴식 공간입니다.",
    recommendationReason: "이천농업테마공원 산책 뒤 부모와 아이가 실내에서 잠시 쉬어가기 좋은 라이스카페예요."
  },
  {
    id: "7",
    name: "성호호수연꽃단지",
    category: "NATURE",
    address: "경기 이천시 설성면 장천리 894",
    roadAddress: "경기 이천시 설성면 장천리 894",
    lat: 37.1082,
    lng: 127.5684,
    recommendedDurationMin: 50,
    openingHours: { open: "00:00", close: "24:00", closedDays: [] }, // 연중 상시 개방
    parking: aiEvidence("주차 정보는 공식 안내에서 확인해 주세요."),
    strollerAccessible: aiEvidence("유모차 동선은 방문 전 공식 안내에서 확인해 주세요."),
    nursingRoom: aiEvidence("수유실 운영 여부는 공식 안내에서 확인해 주세요."),
    diaperChangingStation: aiEvidence("기저귀 갈이대 운영 여부는 공식 안내에서 확인해 주세요."),
    babyChair: aiEvidence("아기의자 보유 여부는 공식 안내에서 확인해 주세요."),
    toilet: aiEvidence("화장실 위치와 운영 여부는 현장에서 확인해 주세요."),
    shade: aiEvidence("계절별 그늘과 쉼터는 방문 전 확인해 주세요."),
    strollerRental: aiEvidence("유모차 대여 여부는 공식 안내에서 확인해 주세요."),
    indoorOutdoor: "OUTDOOR",
    ageMinMonths: 0,
    ageMaxMonths: 84,
    weatherTags: ["HOT_OK", "RAIN_AVOID"],
    imageFiles: [
      "/resources/pic/7-1.jpg",
      "/resources/pic/7-2.jpg",
      "/resources/pic/7-3.jpg"
    ],
    thumbnailImage: "/resources/pic/7-1.jpg",
    imageDescriptions: [
      "호수 위를 시원하게 가로지르는 평지 수변 덱로드 (유모차 주행 최적)",
      "호수 바람을 맞으며 쉴 수 있는 대형 전통 수변 정자 쉼터",
      "여름과 초가을 만개하는 연꽃 군락과 잔잔한 호수 절경"
    ],
    verificationStatus: "WEB_VERIFIED",
    verifiedDate: "2026-09-21",
    recommendationSource: "AI_RECOMMENDED",
    sourceUrl: "https://www.icheon.go.kr/tour/index.do?searchField=ALL",
    editorialReview: "성호호수와 연꽃 풍경을 중심으로 공개 관광 정보를 탐색해 추가한 자연 산책 후보예요.",
    recommendationReason: "수변 풍경을 좋아하는 가족에게 제안하지만, 유모차·편의시설 정보는 방문 전 공식 안내를 확인해 주세요."
  },
  ...AI_RECOMMENDED_PLACES,
] satisfies Place[]).map(applyPlaceResearch);
