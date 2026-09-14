import { Place } from "@/domain/models/place";
import { PlaceRepository } from "./place-repository.interface";
import { SEED_PLACES } from "../data/seed-places.data";

export class SeedPlaceRepository implements PlaceRepository {
  async listCandidates(): Promise<Place[]> {
    return [...SEED_PLACES];
  }

  async getById(id: string): Promise<Place | null> {
    const found = SEED_PLACES.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async findById(id: string): Promise<Place | null> {
    return this.getById(id);
  }
}
