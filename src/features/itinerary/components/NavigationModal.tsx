"use client";
import { useCallback, useEffect, useState } from "react";
import { Place } from "@/domain/models/place";
import { PlaceMap } from "@/components/shared/PlaceMap";

const destinationQuery = (p: Place) => p.coordinateSource ? `${p.lat},${p.lng}` : p.roadAddress || p.address;
export function googleCourseUrl(places: Place[]) {
  const params = new URLSearchParams({ api: "1", origin: destinationQuery(places[0]), destination: destinationQuery(places.at(-1)!), travelmode: "driving" });
  if (places.length > 2) params.set("waypoints", places.slice(1, -1).map(destinationQuery).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}

export function NavigationModal({ isOpen, places, onClose }: { isOpen: boolean; places: Place[]; onClose: () => void }) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsMessage, setGpsMessage] = useState("현재 위치를 확인하고 있어요.");
  const [tab, setTab] = useState<"FIRST" | "ALL">("FIRST");
  const locate = useCallback(() => {
    setGpsMessage("현재 위치를 확인하고 있어요.");
    if (!navigator.geolocation) { setGpsMessage("기기에서 현재 위치를 지원하지 않아요. 지도 앱에서 출발지를 선택해 주세요."); return; }
    navigator.geolocation.getCurrentPosition(p => { setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }); setGpsMessage("현재 위치가 연결됐어요."); }, () => setGpsMessage("위치 권한이 없어요. 지도 앱에서 현재 위치를 출발지로 선택해 주세요."), { timeout: 8000, maximumAge: 60000 });
  }, []);
  useEffect(() => { if (isOpen) { setTab("FIRST"); locate(); } }, [isOpen, locate]);
  useEffect(() => { if (!isOpen) return; const close = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [isOpen, onClose]);
  if (!isOpen || !places.length) return null;
  const kakaoTo = (destination: Place, origin?: Place) => !destination.coordinateSource || (origin && !origin.coordinateSource) ? `https://map.kakao.com/link/search/${encodeURIComponent(`${destination.name} ${destination.address}`)}` : origin
    ? `https://map.kakao.com/link/from/${encodeURIComponent(origin.name)},${origin.lat},${origin.lng}/to/${encodeURIComponent(destination.name)},${destination.lat},${destination.lng}`
    : coords ? `https://map.kakao.com/link/from/현재위치,${coords.lat},${coords.lng}/to/${encodeURIComponent(destination.name)},${destination.lat},${destination.lng}`
    : `https://map.kakao.com/link/to/${encodeURIComponent(destination.name)},${destination.lat},${destination.lng}`;
  const googleFirst = new URLSearchParams({ api: "1", destination: destinationQuery(places[0]), travelmode: "driving", dir_action: "navigate" });
  if (coords) googleFirst.set("origin", `${coords.lat},${coords.lng}`);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm" data-testid="navigation-modal">
    <section role="dialog" aria-modal="true" aria-labelledby="navigation-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-primary">지도와 함께 출발해요</p><h2 id="navigation-title" className="mt-1 text-xl font-bold">이 코스로 하루 시작하기</h2></div><button aria-label="닫기" onClick={onClose} className="h-10 w-10 rounded-full bg-surface-container text-xl">×</button></div>
      <div className="my-4 flex rounded-xl bg-surface-container p-1 text-sm font-bold">{([['FIRST', '첫 목적지 바로 출발'], ['ALL', `전체 코스 길찾기 (${places.length}곳)`]] as const).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-lg p-3 ${tab === id ? 'bg-white text-primary shadow-sm' : ''}`}>{label}</button>)}</div>
      <div className="overflow-y-auto pr-1">
        {tab === "FIRST" ? <>
          <p className="mb-3 rounded-xl bg-surface-container-low p-3 text-sm">{gpsMessage} {!coords && <button onClick={locate} className="ml-2 font-bold text-primary">다시 연결</button>}</p>
          <PlaceMap points={[places[0]]} />
          <h3 className="mt-4 text-lg font-bold">현재 위치 → {places[0].name}</h3><p className="mt-1 text-sm">{places[0].address}</p>
          <div className="mt-4 grid grid-cols-2 gap-3"><a href={kakaoTo(places[0])} target="_blank" rel="noreferrer" className="rounded-xl bg-[#fee500] p-3 text-center text-sm font-bold text-black">카카오맵 출발 ↗</a><a href={`https://www.google.com/maps/dir/?${googleFirst}`} target="_blank" rel="noreferrer" className="rounded-xl border bg-white p-3 text-center text-sm font-bold text-blue-600">구글맵 출발 ↗</a></div>
        </> : <>
          <PlaceMap points={places} route />
          <p className="mt-3 text-sm leading-6">{places.map(p => p.name).join(" → ")}</p>
          <p className="mt-2 text-xs leading-5 text-on-surface-variant">전체 경로는 첫 장소에서 마지막 장소까지 이어져요. 현재 위치에서 첫 장소로 가려면 ‘첫 목적지 바로 출발’을 이용해 주세요.</p>
          <p className="mt-2 text-xs text-on-surface-variant">입구 좌표가 미확인인 곳은 카카오 장소 검색이 열려요. 장소를 선택한 뒤 길찾기를 누르고 출발지를 확인해 주세요.</p>
          {places.length > 1 && Array.from({ length: Math.ceil((places.length - 1) / 4) }, (_, i) => places.slice(i * 4, i * 4 + 5)).map((section, i) => <a key={i} href={googleCourseUrl(section)} target="_blank" rel="noreferrer" className="my-4 block rounded-xl bg-secondary p-3 text-center text-sm font-bold text-white">{places.length > 5 ? `${i + 1}구간 · ` : ""}첫 장소 → 경유지 → 마지막 장소 · 구글 지도 ↗</a>)}
          <ol className="mt-4 space-y-3">{places.map((place, index) => <li key={place.id} className="rounded-xl border border-outline-variant/30 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">{index + 1}. {place.name}</h3><a href={kakaoTo(place, index ? places[index - 1] : undefined)} target="_blank" rel="noreferrer" className="rounded-full bg-[#fee500] px-3 py-2 text-xs font-bold text-black">{index ? '이전 장소에서 길찾기' : '현재 위치에서 길찾기'} ↗</a></div><p className="mt-2 text-xs text-on-surface-variant">{place.address}</p></li>)}</ol>
        </>}
      </div>
      <button onClick={onClose} className="mt-4 w-full rounded-full bg-surface-container py-3 text-sm font-bold">닫기</button>
    </section>
  </div>;
}
