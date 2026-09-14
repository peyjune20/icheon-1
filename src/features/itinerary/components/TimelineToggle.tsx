interface TimelineToggleProps {
  blockCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const TimelineToggle = ({
  blockCount,
  isCollapsed,
  onToggle,
}: TimelineToggleProps) => {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <span className="font-headline text-headline-md text-on-surface font-bold">
          베베로드 추천 타임라인
        </span>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-label-sm font-medium">
          {blockCount}개 장소
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="text-label-md text-primary font-semibold flex items-center gap-0.5 active:opacity-75 transition-opacity"
      >
        <span className="material-symbols-outlined text-[16px]">
          {isCollapsed ? "unfold_more" : "unfold_less"}
        </span>
        <span>{isCollapsed ? "상세히 보기" : "간단히 보기"}</span>
      </button>
    </div>
  );
};
