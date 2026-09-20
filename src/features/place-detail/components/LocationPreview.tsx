import React from "react";
import { Place } from "@/domain/models/place";

interface LocationPreviewProps {
  place: Place;
}

interface NearbyAccess {
  ic: string;
  transit: string;
  landmark: string;
  drive: string;
}

const getNearbyAccess = (place: Place): NearbyAccess => {
  const byPlaceId: Record<string, NearbyAccess> = {
    "1": { ic: "서이천IC", transit: "경강선 이천역", landmark: "신둔 도자예술마을", drive: "서이천IC에서 차량 약 8분" },
    "2": { ic: "남이천IC", transit: "이천종합터미널", landmark: "이천농업테마공원", drive: "남이천IC에서 차량 약 12분" },
    "3": { ic: "남이천IC", transit: "이천종합터미널", landmark: "쌀문화전시관", drive: "남이천IC에서 차량 약 14분" },
    "4": { ic: "남이천IC", transit: "부발역", landmark: "이천환경학습관", drive: "남이천IC에서 차량 약 9분" },
    "5": { ic: "일죽IC", transit: "이천종합터미널", landmark: "율면 생활권", drive: "일죽IC에서 차량 약 11분" },
    "6": { ic: "남이천IC", transit: "이천종합터미널", landmark: "이천농업테마공원", drive: "공원 주차장에서 도보 약 2분" },
    "7": { ic: "일죽IC", transit: "이천종합터미널", landmark: "성호호수", drive: "일죽IC에서 차량 약 18분" },
  };

  if (byPlaceId[place.id]) return byPlaceId[place.id];
  if (place.lat > 37.25) {
    return { ic: "서이천IC", transit: "경강선 이천역", landmark: "설봉공원·이천 시내", drive: "이천 시내 주요 거점에서 차량 약 10~20분" };
  }
  return { ic: "남이천IC", transit: "부발역·이천종합터미널", landmark: "모가·마장 권역", drive: "모가·마장 권역 주요 거점에서 차량 약 10~20분" };
};

export const LocationPreview: React.FC<LocationPreviewProps> = ({ place }) => {
  const access = getNearbyAccess(place);
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.roadAddress || place.address}`)}`;

  const landmarks = [
    { label: access.ic, icon: "directions_car", position: "left-[10%] top-[21%]" },
    { label: access.transit, icon: "train", position: "right-[10%] top-[19%]" },
    { label: access.landmark, icon: "park", position: "left-[12%] bottom-[14%]" },
  ];

  return (
    <div className="mb-6 w-full" data-testid="location-preview">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-on-surface">위치 및 주변 접근성</h2>
          <p className="mt-0.5 text-xs text-on-surface-variant">주요 이동 거점과 함께 보는 간단한 위치 안내예요.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{access.drive}</span>
      </div>

      <div className="relative h-72 overflow-hidden rounded-3xl border border-outline-variant/35 bg-[#f4f1ff] shadow-sm sm:h-80">
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: "radial-gradient(#d6d0ed 1.25px, transparent 1.25px)", backgroundSize: "20px 20px" }} />
        <div className="absolute -left-10 top-[48%] h-12 w-[70%] -rotate-[16deg] rounded-full border-y-[13px] border-white/90 bg-[#e4e0f5] shadow-sm" />
        <div className="absolute right-[17%] top-[-18%] h-[130%] w-14 rotate-[22deg] rounded-full border-x-[12px] border-white/90 bg-[#e4e0f5] shadow-sm" />
        <div className="absolute -right-10 bottom-2 h-20 w-64 rotate-[10deg] rounded-full border-[12px] border-[#e2f3ff]" />
        <div className="absolute left-[34%] top-[31%] h-28 w-40 rounded-[45%] border-8 border-[#d8ebbd] bg-[#edf8dd] opacity-90" />
        <div className="absolute right-[12%] bottom-[12%] h-16 w-24 rounded-full bg-[#ffe0b8]/80" />

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-secondary shadow-xs">
          <span className="material-symbols-outlined mr-1 text-[15px] align-[-2px]">map</span>
          이천 이동 거점 지도
        </div>
        {landmarks.map((landmark) => (
          <div key={landmark.label} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${landmark.position}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-secondary shadow-md">
              <span className="material-symbols-outlined text-[17px]">{landmark.icon}</span>
            </span>
            <span className="mt-1 block max-w-28 truncate rounded-full bg-white/95 px-2 py-0.5 text-center text-[10px] font-bold text-on-surface shadow-xs">{landmark.label}</span>
          </div>
        ))}

        <div className="absolute left-[57%] top-[55%] z-20 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(237,113,133,0.35)]">
            <span className="material-symbols-outlined text-[29px]">location_on</span>
            <span className="absolute -bottom-1 h-3 w-3 rotate-45 bg-primary" />
          </span>
          <span className="mt-2 block max-w-36 truncate rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-sm">{place.name}</span>
        </div>

        <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
          <a href={kakaoMapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#FEE500] px-3 text-[11px] font-bold text-[#191919] shadow-sm hover:brightness-95">
            카카오맵
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
          <a href={googleMapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-xl bg-white px-3 text-[11px] font-bold text-[#1a73e8] shadow-sm hover:bg-surface-container-low">
            구글 지도
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-on-surface-variant">* 지도는 이동 거점을 이해하기 위한 안내도이며, 실제 도로 경로는 지도 앱에서 확인해 주세요.</p>
    </div>
  );
};
