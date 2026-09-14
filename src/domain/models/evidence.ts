export type DataSourceType =
  | "FIELD_VISIT"
  | "OFFICIAL"
  | "PUBLIC_DATA"
  | "BUSINESS_PAGE"
  | "MAP_REVIEW"
  | "WEB_PAGE"
  | "WEB"
  | "USER_REPORT"
  | "UNKNOWN";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface EvidenceValue<T> {
  value: T;
  sourceType: DataSourceType;
  sourceRef?: string;
  collectedAt?: string;
  verifiedAt?: string;
  confidence?: Confidence;
  note?: string;
}
