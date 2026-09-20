"use client";
import { useCallback, useEffect, useState } from "react";
import { Place } from "@/domain/models/place";
import { PlaceMap } from "@/components/shared/PlaceMap";
import { MapPoint, resolveMapPoint, kakaoCarUrl, splitCarCourse, kakaoSearchUrl } from "@/lib/map-points";

export function NavigationModal({ isOpen, places, onClose }: { isOpen: boolean; places: Place[]; onClose: () => void }) {
  const [coords, setCoords] = useState<MapPoint | null>(null);
  const [resolved, setResolved] = useState<MapPoint[]>(places);
  const [gpsMessage, setGpsMessage] = useState("현재 위치를 확인하고 있어요.");
  const [tab, setTab] = useState<"FIRST" | "ALL">("FIRST");
  const [resolving, setResolving] = useState(false);
  const locate = useCallback(() => {
    setCoords(null); setGpsMessage("현재 위치를 확인하고 있어요.");
    if (!navigator.geolocation) { setGpsMessage("기기에서 현재 위치를 지원하지 않아요. 카카오맵에서 출발지를 선택해 주세요."); return; }
    navigator.geolocation.getCurrentPosition(p => {
      setCoords({ id: "gps", name: "현재 위치", lat: p.coords.latitude, lng: p.coords.longitude, coordinateSource: "GPS" });
      setGpsMessage("현재 위치부터 자동차로 이동하는 코스예요.");
    }, () => setGpsMessage("현재 위치를 가져오지 못했어요. 권한을 허용하거나 카카오맵에서 출발지를 직접 선택해 주세요."), { timeout: 8000, maximumAge: 60000 });
  }, []);
  useEffect(() => { if (isOpen) { setTab("FIRST"); locate(); } }, [isOpen, locate]);
  const serialized = JSON.stringify(places);
  useEffect(() => {
    if (!isOpen) return;
    let active = true; setResolved(places); setResolving(true);
    Promise.all(places.map(resolveMapPoint)).then(points => { if (active) { setResolved(points); setResolving(false); } });
    return () => { active = false; };
  }, [isOpen, serialized]);
  useEffect(() => { if (!isOpen) return; const close = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [isOpen, onClose]);
  if (!isOpen || !resolved.length) return null;
  const first = resolved[0];
  const fullCourse = coords ? [coords, ...resolved] : resolved;
  const firstCourse = coords ? [coords, first] : [first];
  const segments = splitCarCourse(fullCourse);
  const firstLink = kakaoCarUrl(firstCourse);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm" data-testid="navigation-modal">
    <section role="dialog" aria-modal="true" aria-labelledby="navigation-title" className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-primary">카카오맵과 함께 출발해요</p><h2 id="navigation-title" className="mt-1 text-xl font-bold">이 코스로 하루 시작하기</h2></div><button aria-label="닫기" onClick={onClose} className="h-10 w-10 rounded-full bg-surface-container text-xl">×</button></div>
      <div className="my-4 flex rounded-xl bg-surface-container p-1 text-sm font-bold">{([["FIRST", "첫 목적지 바로 출발"], ["ALL", "전체 코스 길찾기 (" + places.length + "곳)"]] as const).map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-lg p-3 ${tab === id ? "bg-white text-primary shadow-sm" : ""}`}>{label}</button>)}</div>
      <div className="overflow-y-auto pr-1">
        <p role="status" className="mb-3 rounded-xl bg-surface-container-low p-3 text-sm">{gpsMessage} {!coords && <button onClick={locate} className="ml-2 font-bold text-primary">다시 연결</button>} {resolving && "목적지 확인 중…"}</p>
        <PlaceMap points={tab === "FIRST" ? firstCourse : fullCourse} route />
        <p className="mt-2 text-xs leading-5 text-on-surface-variant">지도 안 도로선은 OSRM 참고 경로(실시간 교통 미반영)예요. 실제 자동차 안내·통행 가능 여부는 아래 카카오맵에서 확인하세요.</p>
        {tab === "FIRST" ? <>
          <h3 className="mt-4 text-lg font-bold">현재 위치 → {first.name}</h3><p className="mt-1 text-sm">{first.address}</p>
          <a href={firstLink || kakaoSearchUrl(first)} target="_blank" rel="noreferrer" className="mt-4 block rounded-xl bg-[#fee500] p-3 text-center text-sm font-bold text-black">{firstLink ? coords ? "카카오맵 자동차 길찾기" : "카카오맵에서 출발지 선택" : "카카오맵에서 정확한 장소 선택"} ↗</a>
        </> : <>
          <p className="mt-3 text-sm leading-6">{fullCourse.map(p => p.name).join(" → ")}</p>
          {!coords && <p className="mt-2 text-xs text-primary">현재 위치가 없어 전체 코스는 첫 장소부터 표시해요. 첫 장소까지는 위 탭에서 출발지를 선택하세요.</p>}
          {segments.length > 1 && <p className="mt-2 text-xs">카카오 경유지 최대 5개에 맞춰 구간을 나눴어요. 앞 구간의 마지막 장소에서 다음 구간이 이어집니다.</p>}
          {segments.map((section, i) => {
            const href = kakaoCarUrl(section);
            return href ? <a key={i} href={href} target="_blank" rel="noreferrer" className="my-4 block rounded-xl bg-[#fee500] p-3 text-center text-sm font-bold text-black">{segments.length > 1 ? (i + 1) + "구간 · " : ""}카카오맵 전체 자동차 경로 ↗</a> : <p key={i} className="my-4 rounded-xl bg-surface-container p-3 text-sm">정확한 위치를 확인하지 못한 장소가 있어요. 아래에서 해당 장소를 확인한 뒤 길찾기를 이용해 주세요.</p>;
          })}
          <ol className="mt-4 space-y-3">{resolved.map((place, index) => {
            const origin = index ? resolved[index - 1] : coords;
            const href = kakaoCarUrl(origin ? [origin, place] : [place]);
            return <li key={place.id} className="rounded-xl border border-outline-variant/30 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">{index + 1}. {place.name}</h3><a href={href || kakaoSearchUrl(place)} target="_blank" rel="noreferrer" className="rounded-full bg-[#fee500] px-3 py-2 text-xs font-bold text-black">{href ? index ? "이전 장소에서 자동차 길찾기" : coords ? "현재 위치에서 자동차 길찾기" : "출발지 선택" : "정확한 장소 확인"} ↗</a></div><p className="mt-2 text-xs text-on-surface-variant">{place.address}</p></li>;
          })}</ol>
        </>}
      </div>
      <button onClick={onClose} className="mt-4 w-full rounded-full bg-surface-container py-3 text-sm font-bold">닫기</button>
    </section>
  </div>;
}
