import { Place } from "@/domain/models/place";

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
      className={`relative flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-primary/70 bg-primary/5 text-center text-primary shadow-[inset_0_0_0_5px_rgba(49,99,66,0.05)] ${
        compact ? "h-16 w-16" : "h-32 w-32"
      }`}
      aria-label={`${place.name} 방문 스탬프`}
    >
      <span className={`material-symbols-outlined ${compact ? "text-[18px]" : "text-[30px]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        workspace_premium
      </span>
      <strong className={`${compact ? "mt-0.5 max-w-12 text-[8px]" : "mt-1 max-w-24 text-xs"} truncate font-bold`}>
        {place.name}
      </strong>
      <span className={`${compact ? "text-[7px]" : "text-[10px]"} font-medium`}>{visitDate}</span>
      <span className={`absolute ${compact ? "bottom-1" : "bottom-2"} rounded-full bg-primary px-1.5 py-0.5 ${compact ? "text-[6px]" : "text-[8px]"} font-bold text-white`}>
        TOUR PASS
      </span>
    </div>
  );
}
