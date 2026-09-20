import { TravelTimeAdapter, TravelTimeResult } from "./travel-time-adapter.interface";
import { SEED_TRAVEL_MATRIX } from "@/infrastructure/data/seed-travel-matrix.data";
import { Place } from "@/domain/models/place";

export class SeedMatrixTravelTimeAdapter implements TravelTimeAdapter {
  async getTravelTime(fromId: string, toId: string, from?: Place, to?: Place): Promise<TravelTimeResult> {
    if (fromId === toId) {
      return { durationMin: 0, source: "SEED_MATRIX", estimated: false };
    }

    const key = `${fromId}__${toId}`;
    const reverseKey = `${toId}__${fromId}`;
    if (from?.coordinateSource && to?.coordinateSource && ![key, reverseKey].includes("3__6")) {
      const rad = Math.PI / 180;
      const a = Math.sin((to.lat - from.lat) * rad / 2) ** 2 + Math.cos(from.lat * rad) * Math.cos(to.lat * rad) * Math.sin((to.lng - from.lng) * rad / 2) ** 2;
      const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { durationMin: Math.max(5, Math.ceil((distanceKm * 1.4 / 30 * 60 + 5) / 5) * 5), distanceKm, source: "ESTIMATE", estimated: true };
    }

    const durationMin = SEED_TRAVEL_MATRIX[key] ?? SEED_TRAVEL_MATRIX[reverseKey] ?? 20;

    return {
      durationMin,
      source: "SEED_MATRIX",
      estimated: true,
    };
  }
}

export { SeedMatrixTravelTimeAdapter as SeedTravelTimeAdapter };
