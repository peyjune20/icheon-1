import { requireUser } from "@/lib/supabase";
import { UserFacingError } from "@/lib/client-errors";
export const PHOTO_BUCKET = "visit-photos";
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export type VisitPhoto = { id: string; user_id: string; title: string; image_url: string; object_path: string; created_at: string; place_id: string; previewUrl?: string };

export function validatePhoto(file: Pick<File, "type" | "size">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new UserFacingError("JPG·JPEG·PNG·WEBP 사진만 올릴 수 있어요.");
  if (!file.size || file.size > MAX_PHOTO_BYTES) throw new UserFacingError("사진은 10MB 이하로 선택해 주세요.");
}
export async function preparePhoto(file: File): Promise<Blob> {
  validatePhoto(file);
  // Browsers apply EXIF orientation before drawing; the new JPEG contains pixel data, not source metadata.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    if (bitmap.width * bitmap.height > 80_000_000) throw new UserFacingError("사진 해상도가 너무 커요. 작은 크기로 내보낸 뒤 올려 주세요.");
    const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d"); if (!context) throw new UserFacingError("이 브라우저에서 사진을 처리하지 못했어요.");
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new UserFacingError("사진을 읽지 못했어요. 다른 사진을 선택해 주세요.")), "image/jpeg", .92));
    if (blob.size > MAX_PHOTO_BYTES) throw new UserFacingError("처리한 사진이 너무 커요. 더 작은 사진을 선택해 주세요.");
    return blob;
  } finally { bitmap.close(); }
}
export async function listVisitPhotos(placeId: string): Promise<VisitPhoto[]> {
  const { db, user } = await requireUser();
  const { data, error } = await db.from("visit_photos").select("*").eq("user_id", user.id).eq("place_id", placeId).order("created_at", { ascending: false });
  if (error) throw error;
  const photos: VisitPhoto[] = [];
  try {
    for (const row of (data || []) as VisitPhoto[]) {
      // Authenticated downloads, not public URLs or shareable signed links.
      const download = await db.storage.from(PHOTO_BUCKET).download(row.object_path);
      // Keep the owned metadata visible if a file was removed but DB deletion failed.
      // The user can then retry deletion instead of losing access to the entire list.
      if (download.error) { console.error("Visit photo download failed", download.error); photos.push(row); }
      else photos.push({ ...row, previewUrl: URL.createObjectURL(download.data) });
    }
    return photos;
  } catch (error) { releasePhotoPreviews(photos); throw error; }
}
export function releasePhotoPreviews(photos: VisitPhoto[]) { photos.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); }); }
export async function uploadVisitPhoto(placeId: string, file: File, title: string) {
  const { db, user } = await requireUser();
  const blob = await preparePhoto(file);
  const id = crypto.randomUUID(), path = `${user.id}/${id}.jpg`;
  const upload = await db.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: false, cacheControl: "0" });
  if (upload.error) throw upload.error;
  const result = await db.from("visit_photos").insert({ id, user_id: user.id, place_id: placeId, title: title.trim().slice(0, 200), object_path: path, original_filename: file.name.slice(0, 250) });
  if (result.error) {
    const cleanup = await db.storage.from(PHOTO_BUCKET).remove([path]);
    if (cleanup.error) console.error("Photo rollback needs storage cleanup", cleanup.error);
    throw result.error;
  }
}
export async function deleteVisitPhoto(id: string) {
  const { db, user } = await requireUser();
  const { data, error } = await db.from("visit_photos").select("object_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) throw error; if (!data) throw new UserFacingError("사진을 찾지 못했어요. 목록을 새로고침해 주세요.");
  // File first; on a DB failure, retaining the row makes a second deletion retry possible.
  const removed = await db.storage.from(PHOTO_BUCKET).remove([data.object_path]); if (removed.error) throw removed.error;
  const deleted = await db.from("visit_photos").delete().eq("id", id).eq("user_id", user.id); if (deleted.error) throw deleted.error;
}
