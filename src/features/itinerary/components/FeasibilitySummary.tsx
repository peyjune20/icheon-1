interface FeasibilitySummaryProps {
  status: "RELAXED" | "FEASIBLE" | "TIGHT";
  totalDurationMin: number;
  totalTravelMin: number;
  slackMin: number;
  blockCount: number;
}

export const FeasibilitySummary = ({
  status,
  totalDurationMin,
  totalTravelMin,
  slackMin,
  blockCount,
}: FeasibilitySummaryProps) => {
  const totalHours = Math.floor(totalDurationMin / 60);
  const totalMins = totalDurationMin % 60;
  const travelHours = Math.floor(totalTravelMin / 60);
  const travelMins = totalTravelMin % 60;

  return (
    <div className="flex flex-col w-full">
      {/* Top Header & Reassurance Block */}
      <section className="flex flex-col gap-2 pt-3 pb-5">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm">
          <span className="material-symbols-outlined text-[14px]">family_star</span>
          <span>김민지 가족 맞춤 코스</span>
        </div>
        <h1 className="font-headline text-headline-lg text-on-surface tracking-tight mt-1">
          오늘은 {blockCount}개 블록이 적당해요
        </h1>
        <p className="text-body-md text-on-surface-variant leading-relaxed">
          2세 아이와 무더운 날씨, 유모차 사용을 고려해 무리 없는 동선으로 구성했어요.
        </p>
      </section>

      {/* Summary Metrics Feasibility Card */}
      <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md mb-space-lg">
        {/* Feasibility Status Banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container text-primary mb-3">
          <span className="material-symbols-outlined text-[20px] text-primary fill">
            check_circle
          </span>
          <span className="text-label-md text-primary font-semibold">
            {status === "RELAXED"
              ? "무리 없는 일정이에요 (2세 아이 기준 안심)"
              : status === "TIGHT"
              ? "조금 빠듯한 일정이에요 (장소를 줄여보세요)"
              : "소화 가능한 표준 일정이에요"}
          </span>
        </div>

        {/* 3-Column Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 mb-2 text-center">
          <div className="flex flex-col items-center bg-surface-container-low rounded-lg py-2.5 px-1">
            <span className="text-label-sm text-secondary">총 일정</span>
            <span className="font-numeric text-numeric-callout text-on-surface mt-0.5">
              {totalHours > 0 ? `${totalHours}시간 ` : ""}
              {totalMins > 0 ? `${totalMins}분` : ""}
            </span>
          </div>
          <div className="flex flex-col items-center bg-surface-container-low rounded-lg py-2.5 px-1">
            <span className="text-label-sm text-secondary">순수 이동</span>
            <span className="font-numeric text-numeric-callout text-on-surface mt-0.5">
              {travelHours > 0 ? `${travelHours}시간 ` : ""}
              {travelMins}분
            </span>
          </div>
          <div className="flex flex-col items-center bg-surface-container-low rounded-lg py-2.5 px-1">
            <span className="text-label-sm text-primary font-medium">여유·버퍼</span>
            <span className="font-numeric text-numeric-callout text-primary mt-0.5">
              {slackMin}분 확보
            </span>
          </div>
        </div>

        {/* Explanatory note */}
        <p className="text-body-sm text-on-surface-variant flex items-center gap-1.5 px-1 mt-1">
          <span className="material-symbols-outlined text-[16px] text-primary">shield</span>
          <span>장소 간 이동시간 15~20분 내외로 아이가 차 안에서 보채지 않는 거리입니다.</span>
        </p>
      </section>
    </div>
  );
};
