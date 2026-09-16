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

  verificationStatus: VerificationStatus;
  verifiedDate: string;
  editorialReview?: string;
  recommendationReason?: string;
}
