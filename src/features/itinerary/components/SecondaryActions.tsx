interface SecondaryActionsProps {
  onReorderClick?: () => void;
  onReduceStopClick?: () => void;
}

export const SecondaryActions = ({
  onReorderClick,
  onReduceStopClick,
}: SecondaryActionsProps) => {
  return (
    <section className="grid grid-cols-2 gap-2 mb-4">
      <button
        type="button"
        onClick={onReorderClick}
        className="h-12 flex items-center justify-center gap-1.5 rounded-full bg-surface-container text-on-surface text-label-md font-medium active:bg-surface-container-high transition-colors"
        data-testid="btn-open-reorder"
      >
        <span className="material-symbols-outlined text-[18px]">swap_vert</span>
        <span>장소 순서 바꾸기</span>
      </button>
      <button
        type="button"
        onClick={onReduceStopClick}
        className="h-12 flex items-center justify-center gap-1.5 rounded-full bg-surface-container text-on-surface text-label-md font-medium active:bg-surface-container-high transition-colors"
        data-testid="btn-reduce-stop"
      >
        <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
        <span>한 곳 줄이기</span>
      </button>
    </section>
  );
};
