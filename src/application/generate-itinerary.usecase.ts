import { TripInput, RecommendationContext } from "@/domain/models/trip-input";
import { Itinerary } from "@/domain/models/itinerary";
import { SeedPlaceRepository } from "@/infrastructure/repositories/seed-place-repository";
import { SeedMatrixTravelTimeAdapter } from "@/adapters/travel-time/seed-travel-time.adapter";
import { RuleBasedRecommendationEngine } from "@/domain/recommendation/recommendation-engine";
import { timeToMinutes } from "@/domain/scheduling/timeline-scheduler";
import { validateAndNormalizeTripInput } from "@/domain/validation/trip-input.schema";

export async function generateItineraryUseCase(input: Partial<TripInput>): Promise<Itinerary> {
  const repo = new SeedPlaceRepository();
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const engine = new RuleBasedRecommendationEngine(repo, travelAdapter);

  // Zod-based server/application layer validation & normalization
  const fullTripInput = validateAndNormalizeTripInput(input);

  const startMin = timeToMinutes(fullTripInput.arrivalInIcheon);
  const endMin = timeToMinutes(fullTripInput.desiredDepartureFromIcheon);
  const tripWindowMin = Math.max(180, endMin - startMin); // e.g. 330 min (5h 30m)

  const context: RecommendationContext = {
    trip: fullTripInput,
    tripWindowMin,
    weather: {
      condition: "HOT", // 무더운 날씨 시나리오
      temperatureC: 31,
    },
    maxBlocks: 4,
  };

  return await engine.generate(context);
}
