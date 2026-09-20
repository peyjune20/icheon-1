import { Place } from "@/domain/models/place";
import { getTourMascotLabel, getTourMascotTheme, TourMascot } from "@/features/tour-stamps/TourMascot";

interface TourStampProps {
  place: Place;
  visitedAt: string;
  compact?: boolean;
  onRemove?: () => void;
}

export function TourStamp({ place, visitedAt, compact = false, onRemove }: TourStampProps) {
  const visitDate = new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(visitedAt));
  const theme = getTourMascotTheme(place.category);
  const stampTone = {
    rice: "border-tertiary/75 bg-[#fffaf0] text-tertiary",
    cafe: "border-primary/75 bg-[#fff8fa] text-primary",
    nature: "border-secondary/75 bg-[#f7fcf5] text-secondary",
    park: "border-primary/75 bg-[#fff9ef] text-primary",
    indoor: "border-secondary/75 bg-[#f8f6ff] text-secondary",
    experience: "border-tertiary/75 bg-[#fffaf0] text-tertiary",
  }[theme];
  const badgeTone = {
    rice: "bg-tertiary",
    cafe: "bg-primary",
    nature: "bg-secondary",
    park: "bg-primary",
    indoor: "bg-secondary",
    experience: "bg-tertiary",
  }[theme];

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed text-center shadow-[inset_0_0_0_5px_rgba(120,102,178,0.08)] ${stampTone} ${
        compact ? "h-16 w-16" : "h-36 w-36"
      }`}
      aria-label={`${place.name} 방문 스탬프`}
    >
      {onRemove && !compact && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-on-surface-variant shadow-xs transition-colors hover:bg-primary hover:text-white"
          aria-label={`${place.name} 스탬프 해제`}
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </button>
      )}
      <TourMascot compact={compact} category={place.category} />
      <strong className={`${compact ? "mt-0.5 max-w-12 text-[8px]" : "mt-1 max-w-28 text-xs"} truncate font-bold`}>
        {place.name}
      </strong>
      <span className={`${compact ? "text-[7px]" : "text-[10px]"} font-medium`}>{visitDate}</span>
      <span className={`absolute ${compact ? "bottom-1" : "bottom-2"} rounded-full ${badgeTone} px-1.5 py-0.5 ${compact ? "text-[6px]" : "text-[8px]"} font-bold text-white`}>
        {getTourMascotLabel(place.category)}
      </span>
    </div>
  );
}
