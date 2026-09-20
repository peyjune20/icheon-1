import { TripInput, RecommendationContext } from "@/domain/models/trip-input";
import { Itinerary } from "@/domain/models/itinerary";
import { SeedPlaceRepository } from "@/infrastructure/repositories/seed-place-repository";
import { SeedMatrixTravelTimeAdapter } from "@/adapters/travel-time/seed-travel-time.adapter";
import { RuleBasedRecommendationEngine } from "@/domain/recommendation/recommendation-engine";
import { timeToMinutes } from "@/domain/scheduling/timeline-scheduler";
import { validateAndNormalizeTripInput } from "@/domain/validation/trip-input.schema";
import { RECOMMENDATION_CONFIG } from "@/domain/config/recommendation.config";

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

  const requestedWeather = fullTripInput.weatherCondition ?? "AUTO";
  const weatherCondition = requestedWeather === "AUTO"
    ? (fullTripInput.styles.includes("INDOOR") ? "HOT" : "NORMAL")
    : requestedWeather;
  const temperatureC = weatherCondition === "HOT" ? 31 : weatherCondition === "COLD" ? 4 : weatherCondition === "RAIN" ? 18 : 23;

  const stopRange = fullTripInput.childAgeMonths <= 24
    ? RECOMMENDATION_CONFIG.stopLimits.age0to2
    : fullTripInput.childAgeMonths <= 60
    ? RECOMMENDATION_CONFIG.stopLimits.age3to5
    : RECOMMENDATION_CONFIG.stopLimits.age6plus;
  const conditionReduction = weatherCondition === "HOT" || weatherCondition === "RAIN" ? 1 : 0;
  const maxBlocks = Math.max(stopRange.min, stopRange.max - conditionReduction);

  const context: RecommendationContext = {
    trip: fullTripInput,
    tripWindowMin,
    weather: {
      condition: weatherCondition,
      temperatureC,
    },
    maxBlocks,
  };

  return await engine.generate(context);
}
