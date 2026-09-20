export interface TravelTimeResult {
  durationMin: number;
  distanceKm?: number;
  source: "SEED_MATRIX" | "MAP_API" | "ESTIMATE";
  estimated: boolean;
}

export interface TravelTimeAdapter {
  getTravelTime(fromId: string, toId: string, from?: import("@/domain/models/place").Place, to?: import("@/domain/models/place").Place): Promise<TravelTimeResult>;
}
