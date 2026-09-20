import { z } from "zod";
import { Place } from "@/domain/models/place";
import { getSupabase, isSupabaseConfigured, requireUser } from "@/lib/supabase";
import { UserFacingError } from "@/lib/client-errors";
import { makeCustomPlace } from "./custom-place";
import type { ActiveCourse } from "@/features/itinerary/active-course";

const placeInput = z.object({ name: z.string().trim().min(1).max(100), address: z.string().trim().min(3).max(250), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), category: z.enum(["RESTAURANT", "CAFE", "NATURE", "PARK", "EXPERIENCE", "INDOOR", "OTHER"]) });
export async function listCustomPlaces(): Promise<Place[]> {
  if (!isSupabaseConfigured()) return [];
  const db = getSupabase(); const { data: auth } = await db.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await db.from("custom_places").select("data").eq("user_id", auth.user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(row => row.data as Place);
}
export async function saveCustomPlace(input: unknown): Promise<Place> {
  const parsed = placeInput.safeParse(input);
  if (!parsed.success) throw new UserFacingError("장소명, 주소, 좌표와 테마를 확인해 주세요.");
  const { db, user } = await requireUser();
  const place = makeCustomPlace({ ...parsed.data, id: `user-${crypto.randomUUID()}` });
  // Verified Auth identity, never a form value. RLS rejects a mid-request account switch.
  const { error } = await db.from("custom_places").insert({ id: place.id, user_id: user.id, data: place });
  if (error) throw error;
  return place;
}
export async function deleteCustomPlace(id: string) {
  if (!id.startsWith("user-")) throw new UserFacingError("기본 장소는 삭제할 수 없어요.");
  const { db, user } = await requireUser();
  const { data, error } = await db.from("visit_photos").select("id").eq("user_id", user.id).eq("place_id", id);
  if (error) throw error;
  const { deleteVisitPhoto } = await import("@/features/place-detail/photo-repository");
  for (const photo of data || []) await deleteVisitPhoto(photo.id);
  const result = await db.from("custom_places").delete().eq("id", id).eq("user_id", user.id);
  if (result.error) throw result.error;
}
export async function readSavedPlan(): Promise<ActiveCourse | null> {
  if (!isSupabaseConfigured()) return null;
  const db = getSupabase(); const { data: auth } = await db.auth.getUser(); if (!auth.user) return null;
  const { data, error } = await db.from("saved_plans").select("data").eq("user_id", auth.user.id).maybeSingle();
  if (error) throw error;
  return data?.data || null;
}
export async function savePlan(plan: ActiveCourse, signal?: AbortSignal) {
  const { db, user } = await requireUser();
  if (signal?.aborted) return;
  // Upsert identity comes from verified Auth user; RLS independently enforces ownership.
  let request = db.from("saved_plans").upsert({ user_id: user.id, data: plan }, { onConflict: "user_id" });
  if (signal) request = request.abortSignal(signal);
  const { error } = await request; if (error) throw error;
}
