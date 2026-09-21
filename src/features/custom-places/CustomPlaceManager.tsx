"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Place, PlaceCategory } from "@/domain/models/place";
import { PLACES_CHANGED } from "./use-places";
import { placeDetailHref } from "./place-links";
import { searchKakaoPlaces, SearchPlace } from "@/lib/kakao-maps";
import { friendlyError, UserFacingError } from "@/lib/client-errors";
import { saveCustomPlace } from "./account-repository";
import { DeletePlaceButton } from "./DeletePlaceButton";
import { ACCOUNT_CHANGED } from "@/lib/supabase";

const categories: [PlaceCategory, string][] = [["NATURE", "자연·숲"], ["PARK", "공원"], ["CAFE", "카페"], ["RESTAURANT", "식당"], ["EXPERIENCE", "체험"], ["INDOOR", "실내 관람"], ["OTHER", "기타"]];
export function SignInHint() { const returnTo = typeof window === "undefined" ? "/places" : window.location.pathname + window.location.search + window.location.hash; return <Link className="font-bold text-primary underline" href={`/account?returnTo=${encodeURIComponent(returnTo)}`}>로그인하고 내 기록 저장하기</Link>; }
export function CustomPlaceManager({ places }: { places: Place[] }) {
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (window.location.hash === "#add-place" && panel.current) panel.current.open = true; }, []);
  const [query, setQuery] = useState(""); const [results, setResults] = useState<SearchPlace[]>([]);
  const [draft, setDraft] = useState({ name: "", address: "", lat: "", lng: "", category: "NATURE" });
  const [message, setMessage] = useState(""); const [signIn, setSignIn] = useState(false); const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Place | null>(null);
  const generation = useRef(0);
  useEffect(() => { const clearAccount = () => { generation.current++; setSaved(null); setMessage(""); setSignIn(false); }; window.addEventListener(ACCOUNT_CHANGED, clearAccount); return () => { generation.current++; window.removeEventListener(ACCOUNT_CHANGED, clearAccount); }; }, []);
  const search = async () => {
    setBusy(true); setMessage(""); setSignIn(false);
    setResults([]);
    try { const body = await searchKakaoPlaces(query); setResults(body); if (!body.length) setMessage("검색 결과가 없어요. 주소나 지역명을 함께 넣거나 직접 입력해 주세요."); }
    catch (e) { setMessage(friendlyError(e, "장소 검색에 실패했어요. 잠시 후 다시 시도해 주세요.")); } finally { setBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(""); setSignIn(false);
    const current = generation.current;
    try {
      const body = await saveCustomPlace({ ...draft, lat: Number(draft.lat), lng: Number(draft.lng) });
      if (current !== generation.current) return;
      setSaved(body); setMessage("내 장소에 저장했어요. 상세 페이지에서 사진과 코스를 추가해 보세요."); window.dispatchEvent(new Event(PLACES_CHANGED));
    } catch (e) { if (current === generation.current) { setSignIn(e instanceof UserFacingError && e.code === "AUTH"); setMessage(friendlyError(e, "저장하지 못했어요. 입력은 그대로 유지됩니다.")); } } finally { setBusy(false); }
  };
  return <details ref={panel} id="add-place" className="my-6 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6">
    <summary className="cursor-pointer text-lg font-bold">＋ 목록에 없는 장소도 내 여행에 추가하기 <span className="ml-2 text-xs font-normal text-on-surface-variant">검색 · 직접 입력 · 관리</span></summary>
    <p className="mt-3 text-sm leading-6 text-on-surface-variant">추가한 장소와 사진은 로그인한 본인에게만 보여요. 기본 30곳은 유지되고, 내 장소만 삭제할 수 있어요.</p>
    <div className="mt-4 flex gap-2"><input aria-label="새 장소 검색" className="min-w-0 flex-1 rounded-xl border p-3 text-sm" placeholder="지역 + 장소명 또는 도로명주소" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); search(); } }} /><button disabled={busy || query.trim().length < 2} onClick={search} className="rounded-xl bg-secondary px-5 text-sm font-bold text-white disabled:opacity-50">검색</button></div>
    <p className="mt-2 text-xs text-on-surface-variant">검색: 카카오맵 · 이천 지역 우선, 다른 지역도 검색할 수 있어요. <a className="underline" href={`https://map.kakao.com/link/search/${encodeURIComponent(query || "이천 관광")}`} target="_blank" rel="noreferrer">카카오맵에서도 검색 ↗</a></p>
    {results.length > 0 && <div className="mt-3 max-h-60 space-y-2 overflow-auto">{results.map(p => <button key={p.id} onClick={() => setDraft(d => ({ ...d, name: p.name, address: p.address, lat: String(p.lat), lng: String(p.lng) }))} className="block w-full rounded-xl bg-surface-container-low p-3 text-left text-sm"><strong>{p.name}</strong><span className="block text-xs">{p.address}</span>{p.jibunAddress !== p.address && <span className="block text-xs text-on-surface-variant">지번: {p.jibunAddress}</span>}</button>)}</div>}
    <form onSubmit={save} className="mt-5 grid gap-3 sm:grid-cols-2">
      {([["name", "장소명"], ["address", "주소"], ["lat", "위도 (예: 37.28)"], ["lng", "경도 (예: 127.43)"]] as const).map(([key, label]) => <label key={key} className="text-xs font-semibold">{label}<input required maxLength={key === "address" ? 250 : 100} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} type={key === "lat" || key === "lng" ? "number" : "text"} step="any" className="mt-1 block w-full rounded-xl border p-3 text-sm font-normal" /></label>)}
      <label className="text-xs font-semibold">테마<select className="mt-1 block w-full rounded-xl border p-3 text-sm" value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>{categories.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <button disabled={busy} className="self-end rounded-xl bg-primary p-3 font-bold text-white disabled:opacity-50">내 장소 저장</button>
    </form>
    <p role="status" className="mt-3 text-sm">{message} {signIn && <SignInHint />}</p>
    {saved && <Link className="mt-3 inline-block font-bold text-primary underline" href={placeDetailHref(saved)}>저장한 {saved.name} 상세 보기 →</Link>}
    {places.filter(p => p.recommendationSource === "USER_ADDED").map(place => <div key={place.id} className="mt-3 flex items-center justify-between gap-3 border-t pt-3"><Link href={placeDetailHref(place)} className="text-sm font-bold">{place.name} →</Link><DeletePlaceButton place={place} onDeleted={() => { if (saved?.id === place.id) setSaved(null); setMessage("장소와 방문 기록·내 사진을 삭제했어요."); }} /></div>)}
  </details>;
}
