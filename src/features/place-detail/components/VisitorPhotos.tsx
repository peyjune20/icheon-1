"use client";
import { useEffect, useRef, useState } from "react";
import { SignInHint } from "@/features/custom-places/CustomPlaceManager";
type Photo = { id: string; caption: string; createdAt: string };
export function VisitorPhotos({ placeId }: { placeId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]); const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(""); const [message, setMessage] = useState(""); const [signIn, setSignIn] = useState(false); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  const load = async () => {
    const response = await fetch(`/api/photos?placeId=${encodeURIComponent(placeId)}`);
    if (response.status === 401) { setSignIn(true); return; }
    if (!response.ok) throw new Error("방문 사진을 불러오지 못했어요.");
    setPhotos(await response.json());
  };
  useEffect(() => { load().catch(e => setMessage(e.message)); }, [placeId]);
  const upload = async (event: React.FormEvent) => {
    event.preventDefault(); if (!file) return; setBusy(true); setMessage("");
    try {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 20 * 1024 * 1024) throw new Error("20MB 이하 JPG·PNG·WebP를 선택해 주세요.");
      // Re-encode to remove EXIF (including GPS) and reduce size before sending.
      const bitmap = await createImageBitmap(file); const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height)); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("사진을 읽지 못했어요.")), "image/jpeg", .87));
      const form = new FormData(); form.set("photo", blob, "visit.jpg"); form.set("caption", caption);
      const response = await fetch(`/api/photos?placeId=${encodeURIComponent(placeId)}`, { method: "POST", body: form }); const data = await response.json();
      if (!response.ok) { setSignIn(response.status === 401); throw new Error(data.error); }
      setPhotos(p => [data, ...p]); setFile(null); setCaption(""); if (input.current) input.current.value = ""; setMessage("방문 사진을 저장했어요.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "업로드하지 못했어요. 다시 시도해 주세요."); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm("이 방문 사진을 삭제할까요? 복구할 수 없어요.")) return; setBusy(true);
    try { const response = await fetch(`/api/photos/${id}`, { method: "DELETE" }); if (!response.ok) throw new Error("사진 삭제에 실패했어요."); setPhotos(p => p.filter(photo => photo.id !== id)); setMessage("방문 사진을 삭제했어요."); } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  return <section className="my-8 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6">
    <h2 className="text-xl font-bold">우리 가족이 남긴 방문 사진</h2>
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">AI 추천·현장 실측 장소 모두 기록할 수 있어요. 본인에게만 공개되며 위치 메타데이터는 제거합니다. 타인의 얼굴·개인정보가 담긴 사진은 동의를 받은 후 올려 주세요.</p>
    {signIn ? <div className="mt-4"><SignInHint /></div> : <form onSubmit={upload} className="mt-4 flex flex-wrap gap-3">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} aria-label="방문 사진 선택" className="w-full text-sm" />
      <input value={caption} maxLength={200} onChange={e => setCaption(e.target.value)} aria-label="방문 사진 설명" placeholder="사진에 남길 한 줄 (선택)" className="min-w-0 flex-1 rounded-xl border p-3 text-sm" />
      <button disabled={!file || busy} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "처리 중…" : "사진 저장"}</button>
    </form>}
    <p role="status" className="mt-3 text-sm text-secondary">{message}</p>
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">{photos.map(photo => <figure key={photo.id}><a href={`/api/photos/${photo.id}`} target="_blank" rel="noreferrer"><img src={`/api/photos/${photo.id}`} alt={photo.caption || "직접 남긴 방문 사진"} className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" /></a><figcaption className="mt-2 text-xs leading-5">{photo.caption || "방문 기록"}<span className="block text-on-surface-variant">{photo.createdAt.slice(0, 10)}</span></figcaption><button disabled={busy} onClick={() => remove(photo.id)} className="text-xs text-primary underline">사진 삭제</button></figure>)}</div>
  </section>;
}
