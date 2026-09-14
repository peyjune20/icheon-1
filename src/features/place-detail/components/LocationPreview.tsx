import React from "react";
import Image from "next/image";
import { Place } from "@/domain/models/place";

interface LocationPreviewProps {
  place: Place;
}

export const LocationPreview: React.FC<LocationPreviewProps> = ({ place }) => {
  const getIcDistance = () => {
    switch (place.id) {
      case "3":
        return "이천IC에서 차로 14분";
      case "1":
        return "서이천IC에서 차로 8분";
      case "2":
        return "남이천IC에서 차로 12분";
      case "4":
        return "남이천IC에서 차로 9분";
      case "5":
        return "일죽IC에서 차로 11분";
      default:
        return "이천IC에서 차로 15분 내외";
    }
  };

  const previewImage = place.imageFiles.length > 1 ? place.imageFiles[1] : (place.imageFiles[0] || "/resources/pic/3-1.jpg");

  return (
    <div className="w-full mb-6" data-testid="location-preview">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-on-surface">위치 및 주변 접근성</h2>
        <span className="text-xs text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10">
          {getIcDistance()}
        </span>
      </div>

      <div className="w-full h-44 rounded-xl relative overflow-hidden shadow-sm flex items-end p-3 bg-surface-container">
        <Image
          src={previewImage}
          alt={place.name}
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm max-w-full">
          <span className="material-symbols-outlined text-[20px] text-primary shrink-0">navigation</span>
          <span className="text-xs text-on-surface font-semibold truncate">
            {place.roadAddress || place.address}
          </span>
        </div>
      </div>
    </div>
  );
};
