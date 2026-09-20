"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignInHint } from "@/features/custom-places/CustomPlaceManager";
import { ACCOUNT_CHANGED } from "@/lib/supabase";
import { friendlyError, UserFacingError } from "@/lib/client-errors";
import { deleteVisitPhoto, listVisitPhotos, releasePhotoPreviews, uploadVisitPhoto, VisitPhoto } from "../photo-repository";
export function VisitorPhotos({ placeId }: { placeId: string }) {
  const [photos, setPhotos] = useState<VisitPhoto[]>([]); const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(""); const [message, setMessage] = useState(""); const [signIn, setSignIn] = useState(false); const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  const previews = useRef<VisitPhoto[]>([]), generation = useRef(0);
  const clear = useCallback(() => { releasePhotoPreviews(previews.current); previews.current = []; setPhotos([]); }, []);
  const load = useCallback(async () => {
    const current = ++generation.current; clear(); setReady(false);
    try {
      const next = await listVisitPhotos(placeId);
      if (current !== generation.current) { releasePhotoPreviews(next); return; }
      previews.current = next; setPhotos(next); setReady(true); setSignIn(false);
    } catch (e) {
      if (current !== generation.current) return;
      setSignIn(e instanceof UserFacingError && e.code === "AUTH");
      setMessage(friendlyError(e, "방문 사진을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
    }
  }, [clear, placeId]);
  useEffect(() => {
    setMessage(""); setFile(null); setCaption(""); if (input.current) input.current.value = "";
    load(); const accountChanged = () => { setMessage(""); setFile(null); setCaption(""); if (input.current) input.current.value = ""; load(); };
    window.addEventListener(ACCOUNT_CHANGED, accountChanged);
    return () => { generation.current++; releasePhotoPreviews(previews.current); previews.current = []; window.removeEventListener(ACCOUNT_CHANGED, accountChanged); };
  }, [load]);
  const upload = async (event: React.FormEvent) => {
    event.preventDefault(); if (!file || !ready) return; setBusy(true); setMessage("");
    const current = generation.current;
    try {
      await uploadVisitPhoto(placeId, file, caption);
      if (current !== generation.current) return;
      setFile(null); setCaption(""); if (input.current) input.current.value = "";
      setMessage("사진이 저장되었습니다."); await load();
    } catch (e) { if (current === generation.current) { setSignIn(e instanceof UserFacingError && e.code === "AUTH"); setMessage(friendlyError(e, "사진 저장에 실패했어요. 잠시 후 다시 시도해 주세요.")); } } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm("이 방문 사진을 삭제할까요? 복구할 수 없어요.")) return; setBusy(true);
    const current = generation.current;
    try { await deleteVisitPhoto(id); if (current === generation.current) { setMessage("방문 사진을 삭제했어요."); await load(); } }
    catch (e) { if (current === generation.current) setMessage(friendlyError(e, "사진 삭제에 실패했어요. 다시 시도해 주세요.")); } finally { setBusy(false); }
  };
  return <section className="my-8 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6">
    <h2 className="text-xl font-bold">우리 가족이 남긴 방문 사진</h2>
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">AI 추천·현장 실측 장소 모두 기록할 수 있어요. 본인에게만 공개되며 위치 메타데이터는 제거합니다. 타인의 얼굴·개인정보가 담긴 사진은 동의를 받은 후 올려 주세요.</p>
    {signIn ? <div className="mt-4"><SignInHint /></div> : <form onSubmit={upload} className="mt-4 flex flex-wrap gap-3">
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} aria-label="방문 사진 선택" className="w-full text-sm" />
      <input value={caption} maxLength={200} onChange={e => setCaption(e.target.value)} aria-label="방문 사진 설명" placeholder="사진에 남길 한 줄 (선택)" className="min-w-0 flex-1 rounded-xl border p-3 text-sm" />
      <button disabled={!file || busy || !ready} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "처리 중…" : "사진 저장"}</button>
    </form>}
    <p className="mt-2 text-xs text-on-surface-variant">JPG·JPEG·PNG·WEBP · 최대 10MB</p>
    <p role="status" className="mt-3 text-sm text-secondary">{message} {!ready && !signIn && <button type="button" onClick={load} className="ml-2 underline">연결 다시 확인</button>}</p>
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">{photos.map(photo => <figure key={photo.id}>{photo.previewUrl ? <a href={photo.previewUrl} target="_blank" rel="noreferrer"><img src={photo.previewUrl} alt={photo.title || "직접 남긴 방문 사진"} className="aspect-[4/3] w-full rounded-xl object-cover" loading="lazy" /></a> : <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-surface-container p-3 text-center text-xs">사진을 불러오지 못했어요. 연결을 확인하거나 삭제를 다시 시도해 주세요.</div>}<figcaption className="mt-2 text-xs leading-5">{photo.title || "방문 기록"}<span className="block text-on-surface-variant">{new Date(photo.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span></figcaption><button disabled={busy} onClick={() => remove(photo.id)} className="text-xs text-primary underline">사진 삭제</button></figure>)}</div>
  </section>;
}
