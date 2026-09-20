interface RationaleCardProps {
  reasons: string[];
  displayAge: string;
  weatherLabel: string;
  napTimeLabel: string;
}

export const RationaleCard = ({ reasons, displayAge, weatherLabel, napTimeLabel }: RationaleCardProps) => {
  return (
    <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md mb-space-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[22px] text-primary">psychology_alt</span>
        <h2 className="font-headline text-headline-md text-on-surface font-bold">
          왜 이렇게 추천했나요?
        </h2>
      </div>

      {/* Decision Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {reasons.map((reason, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-sm font-medium"
          >
            {reason}
          </span>
        ))}
      </div>

      {/* Rationale Text */}
      <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-lg">
        {weatherLabel} 컨디션과 {displayAge} 아이의 이동 리듬, 선택한 취향을 고려한 계획이에요. 낮잠 설정은 {napTimeLabel}이며,
        해당 시간과 겹치는 이동 구간을 표시했어요. 실제 아이 컨디션에 따라 방문 순서를 바꿔 주세요.
      </p>
    </section>
  );
};
