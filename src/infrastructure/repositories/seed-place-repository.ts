import { Place } from "@/domain/models/place";
import { PlaceRepository } from "./place-repository.interface";
import { SEED_PLACES } from "../data/seed-places.data";

export class SeedPlaceRepository implements PlaceRepository {
  async listCandidates(): Promise<Place[]> {
    if (typeof window === "undefined") return [...SEED_PLACES];
    const { fetchCustomPlaces } = await import("@/features/custom-places/use-places");
    return [...SEED_PLACES, ...await fetchCustomPlaces()];
  }

  async getById(id: string): Promise<Place | null> {
    const found = (await this.listCandidates()).find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async findById(id: string): Promise<Place | null> {
    return this.getById(id);
  }
}
