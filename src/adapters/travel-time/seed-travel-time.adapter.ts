import { TravelTimeAdapter, TravelTimeResult } from "./travel-time-adapter.interface";
import { SEED_TRAVEL_MATRIX } from "@/infrastructure/data/seed-travel-matrix.data";

export class SeedMatrixTravelTimeAdapter implements TravelTimeAdapter {
  async getTravelTime(fromId: string, toId: string): Promise<TravelTimeResult> {
    if (fromId === toId) {
      return { durationMin: 0, source: "SEED_MATRIX", estimated: false };
    }

    const key = `${fromId}__${toId}`;
    const reverseKey = `${toId}__${fromId}`;

    const durationMin = SEED_TRAVEL_MATRIX[key] ?? SEED_TRAVEL_MATRIX[reverseKey] ?? 20;

    return {
      durationMin,
      source: "SEED_MATRIX",
      estimated: true,
    };
  }
}

export { SeedMatrixTravelTimeAdapter as SeedTravelTimeAdapter };

