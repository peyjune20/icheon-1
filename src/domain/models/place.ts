import { TriState } from "./tri-state";
import { EvidenceValue } from "./evidence";

export type PlaceCategory =
  | "RESTAURANT"
  | "CAFE"
  | "NATURE"
  | "PARK"
  | "EXPERIENCE"
  | "INDOOR"
  | "OTHER";

export type IndoorOutdoorType = "INDOOR" | "OUTDOOR" | "MIXED";

export type VerificationStatus =
  | "FIELD_VERIFIED"
  | "OFFICIAL"
  | "WEB_VERIFIED"
  | "USER_REPORTED"
  | "UNVERIFIED";

export type RecommendationSource = "FIELD_VISIT" | "AI_RECOMMENDED" | "USER_ADDED";

export interface PlaceMedia {
  src: string;
  type: "IMAGE" | "VIDEO";
  description?: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  roadAddress?: string;
  lat: number;
  lng: number;

  recommendedDurationMin: number;
  recommendedDurationMax?: number;
  openingHours: {
    open: string;
    close: string;
    closedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };

  parking: EvidenceValue<TriState>;
  strollerAccessible: EvidenceValue<TriState>;
  nursingRoom: EvidenceValue<TriState>;
  diaperChangingStation: EvidenceValue<TriState>;
  babyChair: EvidenceValue<TriState>;
  toilet: EvidenceValue<TriState>;
  shade: EvidenceValue<TriState>;
  strollerRental: EvidenceValue<TriState>;

  indoorOutdoor: IndoorOutdoorType;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  weatherTags: Array<"HOT_OK" | "HOT_AVOID" | "RAIN_OK" | "RAIN_AVOID">;

  imageFiles: string[];
  thumbnailImage: string;
  imageDescriptions?: string[];
  mediaFiles?: PlaceMedia[];

  /** 현장 실측 장소와 AI 탐색 추천 장소를 화면에서 정직하게 구분합니다. */
  recommendationSource?: RecommendationSource;
  /** AI 추천 장소의 공식 안내를 다시 확인할 수 있는 링크입니다. */
  sourceUrl?: string;
  researchedInfo?: {
    checkedAt: string;
    hours: string;
    closed: string;
    cost: string;
    phone?: string;
    access?: string;
    sources: { label: string; url: string }[];
  };
  coordinateSource?: string;
  addressEvidence?: { url: string; note?: string; status?: "WEB_CHECKED" | "NEEDS_CHECK"; checkedAt: string };
  unavailableReason?: string;

  verificationStatus: VerificationStatus;
  verifiedDate: string;
  editorialReview?: string;
  recommendationReason?: string;
}
