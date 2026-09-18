import { Place } from "@/domain/models/place";
import { TourMascot } from "@/features/tour-stamps/TourMascot";

interface TourStampProps {
  place: Place;
  visitedAt: string;
  compact?: boolean;
}

export function TourStamp({ place, visitedAt, compact = false }: TourStampProps) {
  const visitDate = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(visitedAt));

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/75 bg-[#fffdf9] text-center text-primary shadow-[inset_0_0_0_5px_rgba(120,102,178,0.08)] ${
        compact ? "h-16 w-16" : "h-36 w-36"
      }`}
      aria-label={`${place.name} 방문 스탬프`}
    >
      <TourMascot compact={compact} />
      <strong className={`${compact ? "mt-0.5 max-w-12 text-[8px]" : "mt-1 max-w-28 text-xs"} truncate font-bold`}>
        {place.name}
      </strong>
      <span className={`${compact ? "text-[7px]" : "text-[10px]"} font-medium`}>{visitDate}</span>
      <span className={`absolute ${compact ? "bottom-1" : "bottom-2"} rounded-full bg-primary px-1.5 py-0.5 ${compact ? "text-[6px]" : "text-[8px]"} font-bold text-white`}>
        BEBE RICE
      </span>
    </div>
  );
}
