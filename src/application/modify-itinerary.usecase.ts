import { Place } from "@/domain/models/place";
import { Itinerary, ItineraryBlock } from "@/domain/models/itinerary";
import { RecommendationContext } from "@/domain/models/trip-input";
import { PlaceRepository } from "@/infrastructure/repositories/place-repository.interface";
import { TravelTimeAdapter } from "@/adapters/travel-time/travel-time-adapter.interface";
import { buildTimelineBlocks } from "@/domain/scheduling/timeline-scheduler";
import { calculateBuffers } from "@/domain/scheduling/buffer-calculator";
import { evaluateDensity } from "@/domain/scheduling/density-evaluator";

export class ModifyItineraryUseCase {
  constructor(
    private placeRepo: PlaceRepository,
    private travelAdapter: TravelTimeAdapter
  ) {}

  /**
   * Rebuilds complete itinerary from an array of places
   */
  async rebuildItinerary(
    places: Place[],
    context: RecommendationContext,
    reasons: string[] = ["아이 컨디션과 부모 휴식을 배려하여 최적화된 맞춤 일정입니다."],
    excluded = []
  ): Promise<Itinerary> {
    const { blocks, totalStayMin, totalTravelMin } = await buildTimelineBlocks(
      places,
      context,
      this.travelAdapter
    );

    // Departure block
    blocks.push({
      id: "block-departure",
      type: "DEPARTURE",
      order: places.length + 1,
      startTime: context.trip.desiredDepartureFromIcheon || "17:30",
      endTime: context.trip.desiredDepartureFromIcheon || "17:30",
      durationMin: 0,
      title: `${context.trip.desiredDepartureFromIcheon || "17:30"} 이천 출발 → 저녁 정체 전 안전 귀가`,
    });

    const { totalBufferMin } = calculateBuffers(blocks, context);
    const densityResult = evaluateDensity(
      context.tripWindowMin,
      totalStayMin,
      totalTravelMin,
      totalBufferMin
    );

    return {
      id: `itinerary-${Date.now()}`,
      blocks,
      totalDurationMin: totalStayMin + totalTravelMin,
      totalTravelMin,
      totalStayMin,
      bufferMin: totalBufferMin,
      slackMin: densityResult.slackMin,
      status: densityResult.status,
      reasons,
      excludedPlaces: excluded,
    };
  }

  /**
   * Helper to extract Place array from Itinerary blocks
   */
  getPlacesFromItinerary(itinerary: Itinerary): Place[] {
    return itinerary.blocks
      .filter((b) => b.type === "PLACE" && b.place !== undefined)
      .map((b) => b.place as Place);
  }

  /**
   * STORY-307: Remove a place by ID and recalculate schedule
   */
  async removePlace(
    currentItinerary: Itinerary,
    placeIdToRemove: string,
    context: RecommendationContext
  ): Promise<Itinerary> {
    const currentPlaces = this.getPlacesFromItinerary(currentItinerary);
    const updatedPlaces = currentPlaces.filter((p) => p.id !== placeIdToRemove);

    return this.rebuildItinerary(
      updatedPlaces,
      context,
      currentItinerary.reasons,
      currentItinerary.excludedPlaces as any
    );
  }

  /**
   * STORY-308: Reduce one discretionary place (-45min) to recover slack time
   */
  async reduceOneStop(
    currentItinerary: Itinerary,
    context: RecommendationContext
  ): Promise<Itinerary> {
    const currentPlaces = this.getPlacesFromItinerary(currentItinerary);
    if (currentPlaces.length <= 1) {
      return currentItinerary;
    }

    // Remove the last place (typically a cafe/rest stop) or lowest priority stop
    const candidateToRemove = [...currentPlaces].reverse().find((p) => p.category !== "RESTAURANT") || currentPlaces[currentPlaces.length - 1];
    const updatedPlaces = currentPlaces.filter((p) => p.id !== candidateToRemove.id);

    return this.rebuildItinerary(
      updatedPlaces,
      context,
      [...currentItinerary.reasons, `한 곳 줄이기(-${candidateToRemove.recommendedDurationMin}분)로 여유시간을 즉시 확보했어요.`],
      currentItinerary.excludedPlaces as any
    );
  }

  /**
   * STORY-309: Replace a place with a new candidate place
   */
  async replacePlace(
    currentItinerary: Itinerary,
    oldPlaceId: string,
    newPlaceId: string,
    context: RecommendationContext
  ): Promise<Itinerary> {
    const newPlace = await this.placeRepo.getById(newPlaceId);
    if (!newPlace) {
      throw new Error(`Place with id ${newPlaceId} not found`);
    }

    const currentPlaces = this.getPlacesFromItinerary(currentItinerary);
    const updatedPlaces = currentPlaces.map((p) => (p.id === oldPlaceId ? newPlace : p));

    return this.rebuildItinerary(
      updatedPlaces,
      context,
      currentItinerary.reasons,
      currentItinerary.excludedPlaces as any
    );
  }

  /**
   * STORY-310: Reorder places according to array of IDs
   */
  async reorderPlaces(
    currentItinerary: Itinerary,
    orderedPlaceIds: string[],
    context: RecommendationContext
  ): Promise<Itinerary> {
    const currentPlaces = this.getPlacesFromItinerary(currentItinerary);
    const placeMap = new Map<string, Place>(currentPlaces.map((p) => [p.id, p]));

    const reorderedPlaces: Place[] = [];
    for (const id of orderedPlaceIds) {
      const place = placeMap.get(id);
      if (place) {
        reorderedPlaces.push(place);
      }
    }

    return this.rebuildItinerary(
      reorderedPlaces,
      context,
      currentItinerary.reasons,
      currentItinerary.excludedPlaces as any
    );
  }

  /**
   * Retrieve alternative candidates not currently in the itinerary
   */
  async getReplacementCandidates(currentItinerary: Itinerary): Promise<Place[]> {
    const allPlaces = await this.placeRepo.listCandidates();
    const currentPlaceIds = new Set(this.getPlacesFromItinerary(currentItinerary).map((p) => p.id));
    return allPlaces.filter((p) => !currentPlaceIds.has(p.id) && p.id !== "7");
  }
}
