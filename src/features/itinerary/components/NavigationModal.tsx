"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Place } from "@/domain/models/place";

interface NavigationModalProps {
  isOpen: boolean;
  places: Place[];
  onClose: () => void;
}

interface RoutePoint {
  place: Place;
  x: number;
  y: number;
}

function RouteMapPreview({ places }: { places: Place[] }) {
  const points = useMemo<RoutePoint[]>(() => {
    const latitudes = places.map((place) => place.lat);
    const longitudes = places.map((place) => place.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const latRange = Math.max(maxLat - minLat, 0.01);
    const lngRange = Math.max(maxLng - minLng, 0.01);

    return places.map((place, index) => ({
      place,
      x: 22 + ((place.lng - minLng) / lngRange) * 58 + (index % 2) * 2,
      y: 18 + ((maxLat - place.lat) / latRange) * 58 + (index % 3) * 2,
    }));
  }, [places]);

  const currentPosition = { x: 10, y: 83 };
  const routeLine = [currentPosition, ...points]
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-primary/15 bg-[#fff3f7]" role="img" aria-label="현재 위치에서 전체 코스 방문지를 잇는 이천 투어 경로 지도">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(#f7c7d5 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="absolute -right-8 top-5 h-28 w-48 rotate-[-20deg] rounded-full border-[14px] border-[#dfe4ff]/70" />
      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-secondary shadow-xs">
        <span className="material-symbols-outlined mr-1 text-[14px]">map</span>
        이천 하루 투어 맵
      </div>
      <p className="absolute bottom-3 left-4 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] text-on-surface-variant shadow-xs">
        실제 도로 경로는 아래 지도 앱에서 안내해요.
      </p>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={routeLine} fill="none" stroke="#f38da0" strokeWidth="1.8" strokeDasharray="3 2" strokeLinecap="round" />
        <circle cx={currentPosition.x} cy={currentPosition.y} r="2.8" fill="#7866b2" stroke="#ffffff" strokeWidth="1" />
        {points.map((point) => (
          <circle key={point.place.id} cx={point.x} cy={point.y} r="3.2" fill="#ed7185" stroke="#ffffff" strokeWidth="1.3" />
        ))}
      </svg>

      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${currentPosition.x}%`, top: `${currentPosition.y}%` }}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs text-white shadow-sm">●</span>
        <span className="mt-1 block whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-secondary shadow-xs">현재 위치</span>
      </div>
      {points.map((point, index) => (
        <div key={point.place.id} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">{index + 1}</span>
          <span className="mt-1 block max-w-20 truncate rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-on-surface shadow-xs">{point.place.name}</span>
        </div>
      ))}
    </div>
  );
}

export const NavigationModal: React.FC<NavigationModalProps> = ({ isOpen, places, onClose }) => {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"LOCATING" | "SUCCESS" | "DENIED" | "UNAVAILABLE">("LOCATING");
  const [activeTab, setActiveTab] = useState<"FIRST" | "ALL">("FIRST");

  const requestCurrentLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("UNAVAILABLE");
      return;
    }

    setGpsStatus("LOCATING");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGpsStatus("SUCCESS");
      },
      () => setGpsStatus("DENIED"),
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentCoords(null);
    setActiveTab("FIRST");
    requestCurrentLocation();
  }, [isOpen, requestCurrentLocation]);

  if (!isOpen || places.length === 0) return null;

  const firstPlace = places[0];
  const hasCurrentLocation = gpsStatus === "SUCCESS" && currentCoords !== null;

  const getKakaoMapUrl = (place: Place) =>
    `https://map.kakao.com/link/from/${encodeURIComponent("현재 위치")},${currentCoords?.lat},${currentCoords?.lng}/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;

  const getGoogleMapsUrl = (place: Place) => {
    const params = new URLSearchParams({
      api: "1",
      origin: `${currentCoords?.lat},${currentCoords?.lng}`,
      destination: `${place.lat},${place.lng}`,
      travelmode: "driving",
      dir_action: "navigate",
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const getGoogleFullCourseUrl = () => {
    const lastPlace = places[places.length - 1];
    const params = new URLSearchParams({
      api: "1",
      origin: `${currentCoords?.lat},${currentCoords?.lng}`,
      destination: `${lastPlace.lat},${lastPlace.lng}`,
      travelmode: "driving",
      dir_action: "navigate",
    });
    const waypointCoordinates = places.slice(0, -1).map((place) => `${place.lat},${place.lng}`).join("|");
    if (waypointCoordinates) params.set("waypoints", waypointCoordinates);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const gpsStatusMessage =
    gpsStatus === "SUCCESS"
      ? "현재 위치를 확인했어요. 모든 길찾기는 현재 위치에서 출발합니다."
      : gpsStatus === "LOCATING"
        ? "현재 위치를 확인하고 있어요..."
        : gpsStatus === "DENIED"
          ? "현재 위치 권한을 허용하면 정확한 출발 경로를 안내할 수 있어요."
          : "이 기기에서는 현재 위치를 확인할 수 없어요.";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#482a38]/45 p-0 backdrop-blur-xs sm:items-center sm:p-4" data-testid="navigation-modal">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[22px]">navigation</span>
            </span>
            <div>
              <span className="text-[11px] font-bold text-primary">실시간 내비게이션 연동</span>
              <h3 className="text-lg font-bold text-on-surface">이 코스로 하루 시작하기</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="my-4 flex items-center justify-between gap-3 rounded-2xl bg-secondary-container/70 px-3 py-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined shrink-0 text-[17px] text-secondary">my_location</span>
            <span>{gpsStatusMessage}</span>
          </div>
          {hasCurrentLocation ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">GPS 연결됨</span>
          ) : (
            <button type="button" onClick={requestCurrentLocation} className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white hover:bg-primary-container">
              GPS 연결
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-1.5 rounded-2xl bg-surface-container p-1">
          <button type="button" onClick={() => setActiveTab("FIRST")} className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${activeTab === "FIRST" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant"}`}>
            첫 목적지 바로 출발
          </button>
          <button type="button" onClick={() => setActiveTab("ALL")} className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${activeTab === "ALL" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant"}`}>
            전체 코스 길찾기 ({places.length}곳)
          </button>
        </div>

        <div className="flex-1 space-y-3.5 overflow-y-auto pr-0.5">
          {activeTab === "FIRST" ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-primary"><span className="material-symbols-outlined text-[16px]">flag</span>첫 번째 도착지</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">현재 위치에서 출발</span>
                </div>
                <h4 className="mt-3 text-xl font-bold text-on-surface">{firstPlace.name}</h4>
                <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-[14px]">location_on</span>{firstPlace.roadAddress || firstPlace.address}</p>
              </div>

              {hasCurrentLocation ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <a href={getKakaoMapUrl(firstPlace)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-between rounded-xl bg-[#FEE500] px-4 text-sm font-bold text-[#191919] shadow-xs transition-all hover:bg-[#FADA0A] active:scale-[0.98]" data-testid="nav-kakaomap">
                    <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#191919] text-xs font-black text-[#FEE500]">K</span>카카오맵</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                  <a href={getGoogleMapsUrl(firstPlace)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-between rounded-xl border border-outline-variant/50 bg-white px-4 text-sm font-bold text-[#1a73e8] shadow-xs transition-all hover:bg-surface-container-low active:scale-[0.98]" data-testid="nav-googlemaps">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">near_me</span>구글 지도</span>
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-4 py-3 text-center text-xs text-on-surface-variant">
                  GPS 연결 후 현재 위치에서 출발하는 길찾기를 실행할 수 있어요.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <RouteMapPreview places={places} />
              <div className="rounded-2xl bg-primary/5 p-3">
                <p className="text-xs font-bold text-on-surface">현재 위치 → {places.map((place) => place.name).join(" → ")}</p>
                <p className="mt-1 text-[11px] leading-5 text-on-surface-variant">전체 코스는 구글 지도에서 모든 방문지를 경유지로 넣어 시작할 수 있고, 카카오맵은 각 목적지 버튼에서 현재 위치 기준으로 실행됩니다.</p>
                {hasCurrentLocation ? (
                  <a href={getGoogleFullCourseUrl()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-secondary text-xs font-bold text-white hover:bg-secondary/90">
                    <span className="material-symbols-outlined text-[17px]">route</span>전체 코스 구글 지도 실행
                  </a>
                ) : (
                  <button type="button" onClick={requestCurrentLocation} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-container">
                    <span className="material-symbols-outlined text-[17px]">my_location</span>GPS 연결 후 전체 코스 시작
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {places.map((place, index) => (
                  <div key={place.id} className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span><h5 className="truncate text-sm font-bold">{place.name}</h5></div>
                      <span className="shrink-0 text-[10px] text-on-surface-variant">{place.recommendedDurationMin}분 체류</span>
                    </div>
                    <p className="mt-1 truncate pl-8 text-[11px] text-on-surface-variant">{place.roadAddress || place.address}</p>
                    {hasCurrentLocation ? (
                      <div className="mt-2 flex items-center gap-2 pl-8">
                        <a href={getKakaoMapUrl(place)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-[#FEE500] px-2.5 py-1.5 text-[11px] font-bold text-[#191919] hover:brightness-95"><span>카카오맵</span><span className="material-symbols-outlined text-[12px]">open_in_new</span></a>
                        <a href={getGoogleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#1a73e8] hover:bg-surface-container"><span>구글맵</span><span className="material-symbols-outlined text-[12px]">open_in_new</span></a>
                      </div>
                    ) : (
                      <button type="button" onClick={requestCurrentLocation} className="mt-2 ml-8 text-[11px] font-bold text-primary hover:underline">GPS 연결 후 현재 위치에서 길찾기</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-outline-variant/30 pt-3">
          <button type="button" onClick={onClose} className="h-11 w-full rounded-full bg-surface-container text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high">닫기</button>
        </div>
      </div>
    </div>
  );
};
