interface TransitSegmentProps {
  note: string;
  durationMin: number;
}

export const TransitSegment = ({ note }: TransitSegmentProps) => {
  const isNap = note.includes("낮잠");

  if (isNap) {
    return (
      <div className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-label-sm self-start my-2 w-fit shadow-xs">
        <span className="material-symbols-outlined text-[18px] text-tertiary">bedtime</span>
        <span className="font-semibold">{note}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-surface-container-low text-on-surface-variant text-label-sm self-start my-2 w-fit shadow-xs">
      <span className="material-symbols-outlined text-[16px] text-primary">directions_car</span>
      <span>{note}</span>
    </div>
  );
};
