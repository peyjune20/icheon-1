import { Place } from "@/domain/models/place";

export interface PlaceRepository {
  listCandidates(): Promise<Place[]>;
  getById(id: string): Promise<Place | null>;
  findById(id: string): Promise<Place | null>;
}
