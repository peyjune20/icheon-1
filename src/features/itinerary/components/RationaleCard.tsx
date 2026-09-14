interface RationaleCardProps {
  reasons: string[];
}

export const RationaleCard = ({ reasons }: RationaleCardProps) => {
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
        오늘 최고 기온이 31℃로 예보되어 오후 햇볕이 가장 강한 15시대에 실내 온실 및 수족관 코스를
        배치했습니다. 2세 아이의 수면 리듬을 고려하여 14:50 공원 출발 직후 카시트에서 숙면을 취할
        수 있도록 30분 거리 구간으로 최적화했습니다.
      </p>
    </section>
  );
};
