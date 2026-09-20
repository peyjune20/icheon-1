export type TransportMode = "CAR" | "PUBLIC_TRANSPORT";

export type TravelStyle =
  | "NATURE"
  | "PARENT_REST"
  | "LOCAL_FOOD"
  | "EXPERIENCE"
  | "INDOOR"
  | "PHOTO";

export type WeatherCondition = "AUTO" | "NORMAL" | "HOT" | "RAIN" | "COLD";

export interface TripInput {
  originText: string;
  childAgeMonths: number;
  displayAge: string;
  strollerRequired: boolean;
  tripDate: string;
  departureTime: string;
  arrivalInIcheon: string;
  desiredDepartureFromIcheon: string;
  transport: TransportMode;
  styles: TravelStyle[];

  napTimeStart?: string;
  napTimeEnd?: string;
  includeLunch: boolean;
  parentRestPriority: "LOW" | "MEDIUM" | "HIGH";
  preferIndoor?: boolean;
  weatherCondition?: WeatherCondition;
}

export interface RecommendationContext {
  trip: TripInput;
  tripWindowMin: number;
  weather: {
    condition: "NORMAL" | "HOT" | "RAIN" | "COLD";
    temperatureC: number;
  };
  maxBlocks: number;
}
