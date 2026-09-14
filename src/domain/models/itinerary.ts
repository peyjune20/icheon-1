import { Place } from "./place";

export type BlockType = "PLACE" | "MEAL" | "CAFE" | "REST" | "TRAVEL" | "DEPARTURE";

export interface ItineraryBlock {
  id: string;
  type: BlockType;
  order: number;
  startTime: string; // "12:00"
  endTime: string;   // "13:00"
  durationMin: number;
  placeId?: string;
  place?: Place;
  title: string;
  subtitle?: string;
  badges?: string[];
  recommendationReason?: string;
  transitNote?: string;
}

export interface ExcludedPlace {
  place: Place;
  reason: string;
  tag: string;
}

export interface Itinerary {
  id: string;
  blocks: ItineraryBlock[];
  totalDurationMin: number;
  totalTravelMin: number;
  totalStayMin: number;
  bufferMin: number;
  slackMin: number;
  status: "RELAXED" | "FEASIBLE" | "TIGHT";
  reasons: string[];
  excludedPlaces: ExcludedPlace[];
}
