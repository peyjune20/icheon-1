"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Place } from "@/domain/models/place";

interface PhotoGalleryProps {
  place: Place;
  compact?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ place, compact = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const mediaItems = place.mediaFiles && place.mediaFiles.length > 0
    ? place.mediaFiles
    : (place.imageFiles && place.imageFiles.length > 0 ? place.imageFiles : [place.thumbnailImage || "/resources/pic/3-1.jpg"])
        .map((src) => ({ src, type: "IMAGE" as const, description: undefined }));
  const descriptions = place.imageDescriptions && place.imageDescriptions.length > 0
    ? place.imageDescriptions
    : [
        place.recommendationReason || place.editorialReview || "현장 실측 전수 완료 안심 장소",
      ];

  const currentMedia = mediaItems[currentIndex] || mediaItems[0];
  const currentDescription = currentMedia.description || descriptions[currentIndex] || descriptions[0] || `${place.name} 현장 안내`;
  const isVideo = currentMedia.type === "VIDEO";
  const isAiRecommended = place.recommendationSource === "AI_RECOMMENDED";

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full flex flex-col gap-2.5" data-testid={`gallery-${place.id}`}>
      {/* Main Active Image Viewport */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className={`relative w-full rounded-2xl overflow-hidden bg-surface-container cursor-pointer group shadow-sm ${
          compact ? "aspect-[16/10]" : "aspect-[16/9]"
        }`}
      >
        {isVideo ? (
          <video
            src={currentMedia.src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full bg-black object-contain"
            aria-label={`${place.name} 현장 영상 ${currentIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <Image
            src={currentMedia.src}
            alt={`${place.name} - 사진 ${currentIndex + 1}`}
            fill
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-contain bg-surface-container transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-primary font-bold text-xs shadow-xs">
            <span className="material-symbols-outlined text-[14px]">{isVideo ? "video_library" : isAiRecommended ? "auto_awesome" : "photo_library"}</span>
            <span>{isAiRecommended ? "AI 추천 장소 안내" : isVideo ? "현장 영상" : "현장 실측 갤러리"}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
            {currentIndex + 1} / {mediaItems.length}
          </span>
        </div>

        {/* Prev / Next Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="이전 사진"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-sm z-20 transition-all opacity-80 group-hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="다음 사진"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-sm z-20 transition-all opacity-80 group-hover:opacity-100"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </>
        )}

        {/* Bottom Photo Description Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 flex flex-col gap-1 pointer-events-none text-white">
          <div className="flex items-center gap-1.5 text-xs text-primary-container font-semibold">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>{isAiRecommended ? "AI 추천 포인트" : isVideo ? "현장 영상" : `에디터 실측 포인트 #${currentIndex + 1}`}</span>
          </div>
          <p className="text-sm font-medium text-white drop-shadow-md line-clamp-2 leading-snug">
            {currentDescription}
          </p>
        </div>

        {/* Fullscreen Magnify Hint */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="p-1.5 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {mediaItems.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
          {mediaItems.map((media, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={media.src + idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${place.name} 사진 ${idx + 1} 보기`}
                className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-primary scale-105 shadow-xs"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {media.type === "VIDEO" ? (
                  <>
                    <video src={media.src} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full bg-black object-cover" aria-label={`영상 썸네일 ${idx + 1}`} />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                      <span className="material-symbols-outlined text-[20px]">play_circle</span>
                    </span>
                  </>
                ) : (
                  <Image
                    src={media.src}
                    alt={`썸네일 ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pt-safe z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              <span className="text-xs text-white/70">{place.name} 실측 갤러리</span>
              <span className="text-sm font-bold text-white">
                {currentIndex + 1} / {mediaItems.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            className="relative flex-1 w-full max-w-2xl mx-auto my-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[70vh]">
              {isVideo ? (
                <video src={currentMedia.src} controls playsInline className="absolute inset-0 h-full w-full bg-black object-contain" aria-label={`${place.name} 확대 영상 ${currentIndex + 1}`} />
              ) : (
                <Image
                  src={currentMedia.src}
                  alt={`${place.name} 확대 사진 ${currentIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                />
              )}
            </div>

            {mediaItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="이전 사진"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center"
                  aria-label="다음 사진"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Caption */}
          <div
            className="max-w-md mx-auto w-full bg-white/10 backdrop-blur-md rounded-xl p-3.5 text-white mb-safe text-center z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-primary-container font-semibold block mb-0.5">
              {isAiRecommended ? "AI 추천 포인트" : isVideo ? "현장 영상" : `실측 포인트 #${currentIndex + 1}`}
            </span>
            <p className="text-sm font-medium leading-relaxed">
              {currentDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
