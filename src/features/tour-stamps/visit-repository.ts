import { requireUser } from "@/lib/supabase";
import { UserFacingError } from "@/lib/client-errors";
import type { TourStampRecord } from "./tour-stamps.storage";
import { isVisitDate } from "./visit-dates";

const columns = "place_id,visited_at";
const fromRow = (row: { place_id: string; visited_at: string }): TourStampRecord => ({ placeId: row.place_id, visitedAt: row.visited_at });

export async function listVisitRecords(expectedUserId: string): Promise<TourStampRecord[]> {
  const { db, user } = await requireUser(expectedUserId);
  const { data, error } = await db.from("visit_records").select(columns).eq("user_id", user.id).order("visited_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function saveVisitRecord(placeId: string, visitedAt: string, expectedUserId: string): Promise<TourStampRecord> {
  if (!isVisitDate(visitedAt)) throw new UserFacingError("오늘 이전의 올바른 방문 날짜를 선택해 주세요.");
  const { db, user } = await requireUser(expectedUserId);
  // Identity comes from Auth; RLS checks it again, including ownership of custom places.
  const { data, error } = await db.from("visit_records").upsert(
    { user_id: user.id, place_id: placeId, visited_at: visitedAt }, { onConflict: "user_id,place_id" },
  ).select(columns).single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteVisitRecord(placeId: string, expectedUserId: string) {
  const { db, user } = await requireUser(expectedUserId);
  const { error } = await db.from("visit_records").delete().eq("user_id", user.id).eq("place_id", placeId);
  if (error) throw error;
}

export async function importVisitRecords(records: TourStampRecord[], expectedUserId: string) {
  if (!records.length) return [];
  if (records.some(record => !isVisitDate(record.visitedAt))) throw new UserFacingError("기존 기록의 방문 날짜를 확인해 주세요.");
  const { db, user } = await requireUser(expectedUserId);
  const unique = [...new Map(records.map(record => [record.placeId, record])).values()];
  // Do not overwrite visits already saved on another device; never erase local originals.
  const { data, error } = await db.from("visit_records").upsert(
    unique.map(record => ({ user_id: user.id, place_id: record.placeId, visited_at: record.visitedAt })),
    { onConflict: "user_id,place_id", ignoreDuplicates: true },
  ).select(columns);
  if (error) throw error;
  return (data || []).map(fromRow);
}
