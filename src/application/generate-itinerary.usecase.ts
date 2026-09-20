import { TripInput, RecommendationContext } from "@/domain/models/trip-input";
import { Itinerary } from "@/domain/models/itinerary";
import { SeedPlaceRepository } from "@/infrastructure/repositories/seed-place-repository";
import { SeedMatrixTravelTimeAdapter } from "@/adapters/travel-time/seed-travel-time.adapter";
import { RuleBasedRecommendationEngine } from "@/domain/recommendation/recommendation-engine";
import { timeToMinutes } from "@/domain/scheduling/timeline-scheduler";
import { validateAndNormalizeTripInput } from "@/domain/validation/trip-input.schema";
import { RECOMMENDATION_CONFIG } from "@/domain/config/recommendation.config";

export async function createRecommendationContext(input: Partial<TripInput>): Promise<RecommendationContext> {
  // Zod-based server/application layer validation & normalization
  const fullTripInput = validateAndNormalizeTripInput(input);

  // Only the time spent in Icheon is planned; travel from home is not assumed.
  const tripWindowMin = fullTripInput.childAgeMonths <= 24 ? 270 : fullTripInput.childAgeMonths <= 60 ? 360 : 420;

  const requestedWeather = fullTripInput.weatherCondition ?? "AUTO";
  let weatherCondition: RecommendationContext["weather"]["condition"] = requestedWeather === "AUTO" ? "NORMAL" : requestedWeather;
  let temperatureC = weatherCondition === "HOT" ? 31 : weatherCondition === "COLD" ? 4 : weatherCondition === "RAIN" ? 18 : 23;
  let source: RecommendationContext["weather"]["source"] = requestedWeather === "AUTO" ? "FALLBACK" : "SELECTED";
  if (requestedWeather === "AUTO") {
    try {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=37.2799&longitude=127.4428&current=temperature_2m,weather_code&timezone=Asia%2FSeoul", { signal: AbortSignal.timeout(5000) });
      if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) throw new Error("Weather unavailable");
      const data = await response.json();
      if (typeof data.current?.temperature_2m !== "number") throw new Error("Missing weather");
      temperatureC = data.current.temperature_2m;
      const code = data.current.weather_code;
      weatherCondition = code >= 51 && code <= 99 ? "RAIN" : temperatureC >= 28 ? "HOT" : temperatureC <= 5 ? "COLD" : "NORMAL";
      source = "CURRENT";
    } catch { /* Conservative ordinary-weather plan if the feed is unavailable. */ }
  }

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
      source,
    },
    maxBlocks,
  };

  return context;
}

export async function generateItineraryUseCase(input: Partial<TripInput>, resolvedContext?: RecommendationContext): Promise<Itinerary> {
  const repo = new SeedPlaceRepository();
  const engine = new RuleBasedRecommendationEngine(repo, new SeedMatrixTravelTimeAdapter());
  return engine.generate(resolvedContext ?? await createRecommendationContext(input));
}
