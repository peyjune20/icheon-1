import { requireUser } from "@/lib/supabase";
import { UserFacingError } from "@/lib/client-errors";

function checkPlaceIds(ids: string[]) {
  if (ids.some(id => !/^([1-9]|[12][0-9]|30|user-[0-9a-f-]{36})$/.test(id))) {
    throw new UserFacingError("찜할 장소를 다시 확인해 주세요.");
  }
}

export async function listAccountSavedPlaces(expectedUserId: string): Promise<string[]> {
  const { db, user } = await requireUser(expectedUserId);
  const { data, error } = await db.from("saved_places").select("place_id")
    .eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(row => row.place_id as string);
}

export async function saveAccountPlaces(ids: string[], expectedUserId: string) {
  checkPlaceIds(ids);
  if (!ids.length) return;
  const { db, user } = await requireUser(expectedUserId);
  // Auth supplies the owner. RLS also enforces ownership, including personal places.
  // Import is additive and idempotent; existing rows/timestamps stay unchanged.
  const { error } = await db.from("saved_places").upsert(
    [...new Set(ids)].map(place_id => ({ user_id: user.id, place_id })),
    { onConflict: "user_id,place_id", ignoreDuplicates: true },
  );
  if (error) throw error;
}

export async function deleteAccountSavedPlace(placeId: string, expectedUserId: string) {
  checkPlaceIds([placeId]);
  const { db, user } = await requireUser(expectedUserId);
  const { error } = await db.from("saved_places").delete()
    .eq("user_id", user.id).eq("place_id", placeId);
  if (error) throw error;
}
