import Link from "next/link";
import Image from "next/image";
import { ItineraryBlock } from "@/domain/models/itinerary";
import { Place } from "@/domain/models/place";

interface DestinationCardProps {
  block: ItineraryBlock;
  isCollapsed?: boolean;
  onRemove?: (placeId: string) => void;
  onOpenReplace?: (place: Place) => void;
}

export const DestinationCard = ({
  block,
  isCollapsed = false,
  onRemove,
  onOpenReplace,
}: DestinationCardProps) => {
  const { place, order, startTime, endTime, durationMin, subtitle, recommendationReason } = block;

  if (!place) return null;

  return (
    <div className="relative pl-9 pb-8 timeline-item" data-testid={`destination-card-${place.id}`}>
      {/* Connector line */}
      <div className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-secondary-container"></div>

      {/* Circle Node */}
      <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm font-headline text-label-md font-bold z-10" data-testid={`node-order-${order}`}>
        {order}
      </div>

      {/* Destination Card Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30 transition-all hover:shadow-md">
        {/* Visual Header with Image */}
        {/* Visual Header with Image & Gallery Preview */}
        {!isCollapsed && place.thumbnailImage && (
          <div className="flex flex-col bg-surface-container">
            <Link
              href={`/places/${place.id}`}
              className="block relative aspect-[16/9] min-h-[210px] w-full overflow-hidden group"
            >
              <Image
                src={place.thumbnailImage}
                alt={place.name}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-contain bg-surface-container-low transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
                <span className="inline-flex items-center justify-center gap-1 rounded-full bg-surface-container-lowest/90 px-2 py-0.5 text-center text-label-sm font-medium text-on-surface backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">
                    {place.category === "RESTAURANT"
                      ? "restaurant"
                      : place.category === "CAFE"
                      ? "coffee"
                      : place.category === "PARK"
                      ? "park"
                      : "nature_people"}
                  </span>
                  {subtitle || "주요 방문지"}
                </span>
                <span className="inline-flex items-center justify-center rounded-full bg-surface-container-lowest/90 px-2 py-0.5 text-center text-label-sm text-on-surface-variant backdrop-blur-sm">
                  {place.indoorOutdoor === "INDOOR"
                    ? "실내 에어컨"
                    : place.indoorOutdoor === "MIXED"
                    ? "실내 + 그늘"
                    : "야외 자연"}
                </span>
              </div>

              {/* Photo Count Badge */}
              {place.imageFiles && place.imageFiles.length > 1 && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1 z-10">
                  <span className="material-symbols-outlined text-[13px]">photo_library</span>
                  <span>사진 {place.imageFiles.length}장</span>
                </div>
              )}

              <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-white font-numeric text-label-sm z-10">
                {startTime} — {endTime} ({durationMin}분)
              </div>
            </Link>

            {/* Mini Photo Strip Preview */}
            {place.imageFiles && place.imageFiles.length > 1 && (
              <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/20">
                {place.imageFiles.map((img, idx) => (
                  <Link
                    key={img + idx}
                    href={`/places/${place.id}`}
                    className="relative aspect-[4/3] w-full rounded-lg overflow-hidden opacity-85 hover:opacity-100 transition-opacity border border-outline-variant/30"
                  >
                    <Image
                      src={img}
                      alt={`${place.name} 사진 ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 18vw, 130px"
                      className="object-cover"
                    />
                  </Link>
                ))}
                <Link
                  href={`/places/${place.id}`}
                  className="col-span-full justify-self-end text-xs text-primary font-bold hover:underline flex items-center pt-0.5"
                >
                  갤러리 전체보기 &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <Link
              href={`/places/${place.id}`}
              className="font-headline text-headline-md text-on-surface font-bold hover:text-primary transition-colors flex items-center gap-1"
            >
              {place.name}
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                chevron_right
              </span>
            </Link>
            <span className="text-label-sm text-primary font-medium">
              {place.category === "RESTAURANT"
                ? "유아 동반 94% 만족"
                : place.category === "PARK"
                ? "유모차 친화 1등급"
                : place.category === "INDOOR"
                ? "쾌적지수 98점"
                : "잔디마당 완비"}
            </span>
          </div>

          {/* Facility Badges Grid */}
          <div className="flex flex-wrap gap-2">
            {place.parking.value === "YES" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-primary text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">check</span>주차 편리
              </span>
            )}
            {place.strollerAccessible.value === "YES" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-primary text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">check</span>유모차 완경사
              </span>
            )}
            {place.nursingRoom.value === "YES" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-primary text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">check</span>독립 수유실
              </span>
            )}
            {place.babyChair.value === "YES" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-primary text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">check</span>아기의자 완비
              </span>
            )}
            {place.diaperChangingStation.value === "YES" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-primary text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">check</span>기저귀 갈이대
              </span>
            )}
            {/* UNKNOWN Badge */}
            {place.diaperChangingStation.value === "UNKNOWN" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FEF3C7] text-[#D97706] text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">help</span>기저귀대 확인필요
              </span>
            )}
            {place.babyChair.value === "UNKNOWN" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FEF3C7] text-[#D97706] text-label-sm font-medium">
                <span className="material-symbols-outlined text-[14px]">help</span>아기의자 확인필요
              </span>
            )}
          </div>

          {/* Recommendation Reason */}
          {recommendationReason && (
            <div className="p-2.5 rounded-lg bg-surface-container-low text-on-surface-variant text-body-sm leading-relaxed">
              <span className="text-label-md text-primary font-semibold block mb-0.5">
                추천 이유
              </span>
              {recommendationReason}
            </div>
          )}

          {/* Action Row: Replace / Remove Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
            {onOpenReplace && (
              <button
                type="button"
                onClick={() => onOpenReplace(place)}
                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                data-testid={`btn-replace-place-${place.id}`}
              >
                <span className="material-symbols-outlined text-[15px] text-primary">swap_horiz</span>
                <span>장소 교체</span>
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(place.id)}
                className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                data-testid={`btn-remove-place-${place.id}`}
              >
                <span className="material-symbols-outlined text-[15px]">delete_outline</span>
                <span>장소 삭제</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
