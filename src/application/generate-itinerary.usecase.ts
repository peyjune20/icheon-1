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

  // Calculate arrival in Icheon dynamically based on departure time (approx 2h travel from capital area)
  if (!input.arrivalInIcheon && fullTripInput.departureTime) {
    const [depH, depM] = fullTripInput.departureTime.split(":").map(Number);
    const arrH = (depH + 2) % 24;
    fullTripInput.arrivalInIcheon = `${String(arrH).padStart(2, "0")}:${String(depM || 0).padStart(2, "0")}`;
  }

  const startMin = timeToMinutes(fullTripInput.arrivalInIcheon);
  const endMin = timeToMinutes(fullTripInput.desiredDepartureFromIcheon);
  const tripWindowMin = Math.max(120, endMin - startMin);

  // Weather condition: if user prefers INDOOR style, simulate HOT (31C) for AC recommendation;
  // If NATURE / outdoor styles, use pleasant NORMAL (23C) autumn weather.
  const isIndoorPriority = fullTripInput.styles.includes("INDOOR");
  const weatherCondition = isIndoorPriority ? "HOT" : "NORMAL";
  const temperatureC = isIndoorPriority ? 31 : 23;

  const context: RecommendationContext = {
    trip: fullTripInput,
    tripWindowMin,
    weather: {
      condition: weatherCondition,
      temperatureC,
    },
    maxBlocks: 4,
  };

  return await engine.generate(context);
}
