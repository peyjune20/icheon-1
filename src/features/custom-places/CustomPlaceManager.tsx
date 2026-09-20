"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Place, PlaceCategory } from "@/domain/models/place";
import { PLACES_CHANGED } from "./use-places";
import { placeDetailHref } from "./place-links";

const categories: [PlaceCategory, string][] = [["NATURE", "자연·숲"], ["PARK", "공원"], ["CAFE", "카페"], ["RESTAURANT", "식당"], ["EXPERIENCE", "체험"], ["INDOOR", "실내 관람"], ["OTHER", "기타"]];
type SearchPlace = { name: string; address: string; lat: number; lng: number };
export function SignInHint() { const returnTo = typeof window === "undefined" ? "/places" : window.location.pathname + window.location.search + window.location.hash; return <a className="font-bold text-primary underline" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`} target="_top">로그인하고 내 기록 저장하기</a>; }
export function CustomPlaceManager({ places }: { places: Place[] }) {
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (window.location.hash === "#add-place" && panel.current) panel.current.open = true; }, []);
  const [query, setQuery] = useState(""); const [results, setResults] = useState<SearchPlace[]>([]);
  const [draft, setDraft] = useState({ name: "", address: "", lat: "", lng: "", category: "NATURE" });
  const [message, setMessage] = useState(""); const [signIn, setSignIn] = useState(false); const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Place | null>(null);
  const search = async () => {
    setBusy(true); setMessage(""); setSignIn(false);
    try { const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`); const body = await response.json(); if (!response.ok) { setSignIn(response.status === 401); throw new Error(body.error); } setResults(body); if (!body.length) setMessage("검색 결과가 없어요. 주소나 ‘이천’ 지역명을 함께 넣거나 직접 입력해 주세요."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "검색 연결을 확인해 주세요."); } finally { setBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(""); setSignIn(false);
    try {
      const response = await fetch("/api/places", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, lat: Number(draft.lat), lng: Number(draft.lng) }) });
      const body = await response.json(); if (!response.ok) { setSignIn(response.status === 401); throw new Error(body.error); }
      setSaved(body); setMessage("내 장소에 저장했어요. 상세 페이지에서 사진과 코스를 추가해 보세요."); window.dispatchEvent(new Event(PLACES_CHANGED));
    } catch (e) { setMessage(e instanceof Error ? e.message : "저장하지 못했어요. 입력은 그대로 유지됩니다."); } finally { setBusy(false); }
  };
  const remove = async (place: Place) => {
    if (!window.confirm(`${place.name}과 이 장소에 올린 내 사진을 삭제할까요? 삭제 후 복구할 수 없어요.`)) return;
    setBusy(true);
    try { const response = await fetch(`/api/places/${place.id}`, { method: "DELETE" }); if (!response.ok) throw new Error("삭제하지 못했어요. 다시 시도해 주세요."); window.dispatchEvent(new Event(PLACES_CHANGED)); if (saved?.id === place.id) setSaved(null); setMessage("장소와 내 사진을 삭제했어요."); }
    catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  };
  return <details ref={panel} id="add-place" className="my-6 rounded-3xl border border-outline-variant/40 bg-white p-5 sm:p-6">
    <summary className="cursor-pointer text-lg font-bold">＋ 목록에 없는 장소도 내 여행에 추가하기 <span className="ml-2 text-xs font-normal text-on-surface-variant">검색 · 직접 입력 · 관리</span></summary>
    <p className="mt-3 text-sm leading-6 text-on-surface-variant">추가한 장소와 사진은 로그인한 본인에게만 보여요. 기본 30곳은 유지되고, 내 장소만 삭제할 수 있어요.</p>
    <div className="mt-4 flex gap-2"><input aria-label="새 장소 검색" className="min-w-0 flex-1 rounded-xl border p-3 text-sm" placeholder="지역 + 장소명 또는 도로명주소" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); search(); } }} /><button disabled={busy || query.trim().length < 2} onClick={search} className="rounded-xl bg-secondary px-5 text-sm font-bold text-white disabled:opacity-50">검색</button></div>
    <p className="mt-2 text-xs text-on-surface-variant">검색: OpenStreetMap / 카카오 키 연결 시 카카오. <a className="underline" href={`https://map.kakao.com/link/search/${encodeURIComponent(query || "이천 관광")}`} target="_blank" rel="noreferrer">카카오맵에서도 검색 ↗</a></p>
    {results.length > 0 && <div className="mt-3 max-h-60 space-y-2 overflow-auto">{results.map((p, i) => <button key={i} onClick={() => setDraft(d => ({ ...d, ...p, lat: String(p.lat), lng: String(p.lng) }))} className="block w-full rounded-xl bg-surface-container-low p-3 text-left text-sm"><strong>{p.name}</strong><span className="block text-xs">{p.address}</span></button>)}</div>}
    <form onSubmit={save} className="mt-5 grid gap-3 sm:grid-cols-2">
      {([["name", "장소명"], ["address", "주소"], ["lat", "위도 (예: 37.28)"], ["lng", "경도 (예: 127.43)"]] as const).map(([key, label]) => <label key={key} className="text-xs font-semibold">{label}<input required maxLength={key === "address" ? 250 : 100} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} type={key === "lat" || key === "lng" ? "number" : "text"} step="any" className="mt-1 block w-full rounded-xl border p-3 text-sm font-normal" /></label>)}
      <label className="text-xs font-semibold">테마<select className="mt-1 block w-full rounded-xl border p-3 text-sm" value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>{categories.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
      <button disabled={busy} className="self-end rounded-xl bg-primary p-3 font-bold text-white disabled:opacity-50">내 장소 저장</button>
    </form>
    <p role="status" className="mt-3 text-sm">{message} {signIn && <SignInHint />}</p>
    {saved && <Link className="mt-3 inline-block font-bold text-primary underline" href={placeDetailHref(saved)}>저장한 {saved.name} 상세 보기 →</Link>}
    {places.filter(p => p.recommendationSource === "USER_ADDED").map(place => <div key={place.id} className="mt-3 flex items-center justify-between gap-3 border-t pt-3"><Link href={placeDetailHref(place)} className="text-sm font-bold">{place.name} →</Link><button disabled={busy} onClick={() => remove(place)} className="text-xs text-primary underline">내 장소 삭제</button></div>)}
  </details>;
}
