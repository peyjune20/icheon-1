"use client";

import React, { useState, useEffect } from "react";
import { Place } from "@/domain/models/place";

interface NavigationModalProps {
  isOpen: boolean;
  places: Place[];
  onClose: () => void;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  places,
  onClose,
}) => {
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"LOCATING" | "SUCCESS" | "DENIED" | "UNAVAILABLE">("LOCATING");
  const [activeTab, setActiveTab] = useState<"FIRST" | "ALL">("FIRST");

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    setCurrentCoords(null);
    if (!navigator.geolocation) {
      setGpsStatus("UNAVAILABLE");
      return;
    }

    setGpsStatus("LOCATING");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("SUCCESS");
      },
      () => {
        setGpsStatus("DENIED");
      },
      { timeout: 6000, enableHighAccuracy: true, maximumAge: 60_000 }
    );
  }, [isOpen]);

  if (!isOpen || places.length === 0) return null;

  const firstPlace = places[0];

  const getKakaoMapUrl = (place: Place) => {
    if (currentCoords) {
      return `https://map.kakao.com/link/from/${encodeURIComponent("현재 위치")},${currentCoords.lat},${currentCoords.lng}/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
    }
    return `https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
  };

  const getGoogleMapsUrl = (place: Place) => {
    const params = new URLSearchParams({
      api: "1",
      destination: `${place.lat},${place.lng}`,
      travelmode: "driving",
      dir_action: "navigate",
    });
    if (currentCoords) params.set("origin", `${currentCoords.lat},${currentCoords.lng}`);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const gpsStatusMessage =
    gpsStatus === "SUCCESS"
      ? "현재 위치를 확인했어요. 첫 번째 목적지까지 바로 안내합니다."
      : gpsStatus === "LOCATING"
      ? "현재 위치를 확인 중이에요..."
      : gpsStatus === "DENIED"
      ? "위치 권한이 없어 지도 앱에서 출발지를 직접 설정해 주세요."
      : "이 기기에서는 위치를 확인할 수 없어 지도 앱에서 출발지를 설정해 주세요.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      data-testid="navigation-modal"
    >
      <div className="w-full max-w-[480px] bg-surface rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">navigation</span>
            </span>
            <div>
              <span className="text-[11px] font-bold text-primary">실시간 내비게이션 연동</span>
              <h3 className="text-base font-bold text-on-surface">이 코스로 하루 시작하기</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* GPS Status Pill */}
        <div className="my-3 px-3 py-2 bg-surface-container-low rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
            <span>
              {gpsStatusMessage}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#2D8A4E] bg-[#2D8A4E]/10 px-2 py-0.5 rounded-full">
            GPS 연동
          </span>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="flex gap-1.5 p-1 bg-surface-container rounded-xl mb-3">
          <button
            type="button"
            onClick={() => setActiveTab("FIRST")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "FIRST"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            1번째 목적지 바로 출발
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "ALL"
                ? "bg-white text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            전체 코스별 길찾기 ({places.length}곳)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
          {activeTab === "FIRST" ? (
            /* First Destination Direct Start */
            <div className="flex flex-col gap-3">
              {/* Highlight Target Card */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    첫 번째 도착지
                  </span>
                  <span className="text-xs font-bold text-on-surface bg-white px-2 py-0.5 rounded-full border border-primary/20">
                    약 60~80분 소요 예상
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-on-surface">{firstPlace.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {firstPlace.roadAddress || firstPlace.address}
                  </p>
                </div>

                <div className="text-[11px] text-secondary bg-white/80 p-2 rounded-lg leading-snug">
                  💡 현 위치에서 {firstPlace.name}(으)로 내비게이션을 실행합니다. 도착 후 일정에 따라 다음 코스로 자동 안내를 이어갈 수 있습니다.
                </div>
              </div>

              {/* Navigation App Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs font-bold text-on-surface">선호하는 내비게이션 앱 선택</span>

                {/* Kakao Map */}
                <a
                  href={getKakaoMapUrl(firstPlace)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] font-bold text-xs flex items-center justify-between px-4 transition-all shadow-xs active:scale-[0.98]"
                  data-testid="nav-kakaomap"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#191919] text-[#FEE500] flex items-center justify-center font-black text-xs">
                      K
                    </span>
                    <span className="text-sm">카카오맵으로 길찾기 시작</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </a>

                {/* Google Maps */}
                <a
                  href={getGoogleMapsUrl(firstPlace)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-white hover:bg-surface-container border border-outline-variant/50 text-[#1a73e8] font-bold text-xs flex items-center justify-between px-4 transition-all shadow-xs active:scale-[0.98]"
                  data-testid="nav-googlemaps"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#1a73e8] text-[20px]">
                      near_me
                    </span>
                    <span className="text-sm text-on-surface">구글 지도 (Google Maps) 길찾기</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-secondary">open_in_new</span>
                </a>

                <p className="text-[11px] leading-snug text-on-surface-variant px-1">
                  위치 권한을 허용하면 두 지도 모두 현재 위치를 출발지로 넣어 첫 번째 목적지까지의 경로를 열어요.
                </p>
              </div>
            </div>
          ) : (
            /* All Places Route Sequence */
            <div className="flex flex-col gap-2.5">
              <p className="text-xs text-secondary mb-1">
                원하는 목적지를 선택해 카카오맵 또는 구글맵으로 바로 이동 경로를 안내받으세요.
              </p>

              {places.map((place, idx) => (
                <div
                  key={place.id}
                  className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs font-bold text-on-surface">{place.name}</h5>
                    </div>
                    <span className="text-[10px] text-secondary">
                      {place.recommendedDurationMin}분 체류
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant truncate pl-7">
                    {place.roadAddress || place.address}
                  </p>

                  <div className="flex items-center gap-2 pl-7 pt-1">
                    <a
                      href={getKakaoMapUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-[#FEE500] text-[#191919] text-[11px] font-bold flex items-center gap-1 hover:brightness-95"
                    >
                      <span>카카오맵</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                    <a
                      href={getGoogleMapsUrl(place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-white border border-outline-variant/40 text-[#1a73e8] text-[11px] font-bold flex items-center gap-1 hover:bg-surface-container"
                    >
                      <span>구글맵</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Close Button */}
        <div className="pt-3 border-t border-outline-variant/20 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
