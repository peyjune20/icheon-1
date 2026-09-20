import { Place } from "@/domain/models/place";
export const placeDetailHref = (place: Pick<Place, "id">) => /^\d+$/.test(place.id) ? `/places/${place.id}` : `/my-place?id=${encodeURIComponent(place.id)}`;
