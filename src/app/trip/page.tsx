"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AgeOption {
  label: string;
  months: number;
  displayAge: string;
}

const AGE_OPTIONS: AgeOption[] = [
  { label: "12개월 미만", months: 9, displayAge: "1세 미만" },
  { label: "1세", months: 12, displayAge: "1세" },
  { label: "● 2세 (13~24)", months: 17, displayAge: "2세" },
  { label: "3~4세", months: 36, displayAge: "3~4세" },
  { label: "5세 이상", months: 60, displayAge: "5세 이상" },
];

const STYLE_OPTIONS = [
  { id: "NATURE", label: "🌿 자연 속 산책" },
  { id: "PARENT_REST", label: "☕ 부모도 쉬고 싶어요" },
  { id: "LOCAL_FOOD", label: "🍚 이천다운 쌀밥 맛집" },
  { id: "EXPERIENCE", label: "🧸 유아 친화 체험" },
  { id: "INDOOR", label: "🏠 쾌적한 실내 위주" },
  { id: "PHOTO", label: "📷 가족 감성 사진" },
];

export default function TripInputPage() {
  const router = useRouter();

  // Form State
  const [selectedAge, setSelectedAge] = useState<AgeOption>(AGE_OPTIONS[2]); // 2세 (17개월)
  const [strollerRequired, setStrollerRequired] = useState(true);
  const [origin, setOrigin] = useState("서울 구로구 신도림");
  const [travelDate, setTravelDate] = useState("2025-09-13");
  const [departureTime, setDepartureTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("17:30");
  const [transport, setTransport] = useState<"CAR" | "PUBLIC_TRANSPORT">("CAR");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["NATURE", "PARENT_REST"]);

  // Optional Accordion State
  const [napStart, setNapStart] = useState("13:30");
  const [napEnd, setNapEnd] = useState("15:00");
  const [includeLunch, setIncludeLunch] = useState(true);
  const [parentRestPriority, setParentRestPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");

  // Real-time trip window calculation (Arrival 12:00 ~ Departure 17:30 = 330 min)
  const tripWindowMinutes = useMemo(() => {
    const [depH, depM] = departureTime.split(":").map(Number);
    const [retH, retM] = returnTime.split(":").map(Number);
    // Assuming 2h travel to Icheon
    const arrivalH = depH + 2;
    const totalMinutes = (retH * 60 + retM) - (arrivalH * 60 + depM);
    return Math.max(60, totalMinutes);
  }, [departureTime, returnTime]);

  const tripWindowHours = Math.floor(tripWindowMinutes / 60);
  const tripWindowMins = tripWindowMinutes % 60;

  // Validation: Origin must not be empty, and at least 1 style must be selected (max 3)
  const isFormValid = origin.trim().length > 0 && selectedStyles.length >= 1;
  const validationMessage =
    origin.trim().length === 0
      ? "출발 지역을 입력해 주세요."
      : selectedStyles.length === 0
      ? "여행 스타일을 최소 1개 이상 선택해 주세요 (최대 3개)."
      : null;

  const handleToggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== styleId));
    } else {
      if (selectedStyles.length >= 3) {
        alert("여행 스타일은 최대 3개까지만 선택 가능합니다.");
        return;
      }
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const params = new URLSearchParams({
      age: String(selectedAge.months),
      stroller: String(strollerRequired),
      origin,
      transport,
      lunch: String(includeLunch),
      date: travelDate,
      departureTime,
      returnTime,
      styles: selectedStyles.join(","),
    });

    router.push(`/itinerary?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      {/* Top Header & Progress */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high pt-safe">
        <div className="max-w-[480px] mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">eco</span>
              1/2 기본 조건 설정
            </span>
            <span className="text-xs text-secondary">약 1분 소요</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-1/2 transition-all duration-300" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-4 pb-32">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            우리 가족 여행을 알려주세요
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            아이와 무리 없이 움직일 수 있는 안심 코스를 만들어드릴게요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Section A: 아이 정보 */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30" data-testid="section-child-info">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                A
              </span>
              <h2 className="text-base font-bold text-on-surface">아이 정보</h2>
            </div>

            {/* Age selector */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-on-surface-variant">아이 나이대</label>
                <span className="text-xs text-primary font-medium">개월수 맞춤 분석</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setSelectedAge(opt)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      selectedAge.months === opt.months
                        ? "bg-primary text-white shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                    data-testid={`age-chip-${opt.months}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-start gap-1.5 p-2 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
                <p className="text-xs text-on-surface-variant">
                  {selectedAge.displayAge} 아이 기준으로 넉넉한 기저귀 교환 및 보행 버퍼를 자동 계산해요.
                </p>
              </div>
            </div>

            {/* Stroller Segmented Control */}
            <div>
              <label className="text-xs font-semibold text-on-surface-variant block mb-2">유모차 동행 여부</label>
              <div className="grid grid-cols-2 p-1 bg-surface-container-low rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setStrollerRequired(true)}
                  className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    strollerRequired
                      ? "bg-white text-primary shadow-xs"
                      : "text-on-surface-variant hover:bg-white/50"
                  }`}
                  data-testid="stroller-yes"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  사용해요 (권장)
                </button>
                <button
                  type="button"
                  onClick={() => setStrollerRequired(false)}
                  className={`h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !strollerRequired
                      ? "bg-white text-primary shadow-xs"
                      : "text-on-surface-variant hover:bg-white/50"
                  }`}
                  data-testid="stroller-no"
                >
                  사용하지 않아요
                </button>
              </div>
              <p className="text-xs text-secondary mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">stroller</span>
                계단이 없거나 경사로 및 엘리베이터가 확보된 장소를 최우선 추천해요.
              </p>
            </div>
          </section>

          {/* Section B: 여행 일정 */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30" data-testid="section-schedule">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  B
                </span>
                <h2 className="text-base font-bold text-on-surface">여행 일정</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                당일 나들이
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Departure Location */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">my_location</span>
                  <span className="text-xs font-medium text-on-surface-variant">출발 지역</span>
                </div>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="예: 서울 구로구 신도림"
                  className="text-xs font-semibold bg-white border border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-on-surface focus:outline-primary text-right max-w-[170px]"
                  data-testid="input-origin"
                />
              </div>

              {/* Date */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                  <span className="text-xs font-medium text-on-surface-variant">여행 날짜</span>
                </div>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="text-xs font-semibold bg-white border border-outline-variant/40 rounded-lg px-2 py-1 text-on-surface focus:outline-primary"
                  data-testid="input-travel-date"
                />
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <span className="text-[11px] text-secondary block">출발 시간</span>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="text-sm font-bold bg-white border border-outline-variant/30 rounded px-1.5 py-0.5 mt-1 w-full text-on-surface"
                    data-testid="input-departure-time"
                  />
                  <span className="text-[11px] text-primary mt-1 block">이천 12:00 도착 예상</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <span className="text-[11px] text-secondary block">귀가 출발 희망</span>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="text-sm font-bold bg-white border border-outline-variant/30 rounded px-1.5 py-0.5 mt-1 w-full text-on-surface"
                    data-testid="input-return-time"
                  />
                  <span className="text-[11px] text-tertiary mt-1 block">저녁 정체 전 복귀</span>
                </div>
              </div>

              {/* Real-time Trip Window Badge */}
              <div className="p-2.5 bg-primary/10 rounded-lg flex items-center justify-between" data-testid="badge-trip-window">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                  <span className="text-xs font-bold text-primary">이천 체류 가능 시간</span>
                </div>
                <span className="text-xs font-bold text-primary">
                  약 {tripWindowHours}시간 {tripWindowMins > 0 ? `${tripWindowMins}분` : ""}
                </span>
              </div>
            </div>
          </section>

          {/* Section C: 이동수단 */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30" data-testid="section-transport">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                C
              </span>
              <h2 className="text-base font-bold text-on-surface">이동수단</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setTransport("CAR")}
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  transport === "CAR"
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-surface-container-low border-transparent opacity-75"
                }`}
                data-testid="transport-car"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">directions_car</span>
                  {transport === "CAR" && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-primary">자가용 (권장)</div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">승하차 버퍼 10분 포함</p>
                </div>
              </div>

              <div
                onClick={() => setTransport("PUBLIC_TRANSPORT")}
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  transport === "PUBLIC_TRANSPORT"
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-surface-container-low border-transparent opacity-75"
                }`}
                data-testid="transport-public"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">subway</span>
                  {transport === "PUBLIC_TRANSPORT" && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-on-surface">경강선 · 대중교통</div>
                  <p className="text-[11px] text-secondary mt-0.5">역사 엘리베이터 동선</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section D: 여행 스타일 */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30" data-testid="section-styles">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  D
                </span>
                <h2 className="text-base font-bold text-on-surface">여행 스타일</h2>
              </div>
              <span className="text-xs text-secondary">최대 3개 선택</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = selectedStyles.includes(style.id);
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleToggleStyle(style.id)}
                    className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                    }`}
                    data-testid={`style-chip-${style.id}`}
                  >
                    {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {style.label}
                  </button>
                );
              })}
            </div>
            {selectedStyles.length === 0 && (
              <p className="text-xs text-error mt-2" data-testid="style-error-msg">
                여행 스타일을 최소 1개 이상 선택해 주세요.
              </p>
            )}
          </section>

          {/* Section E: 세부 맞춤 설정 (Accordion) */}
          <details className="group bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden" open>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                  E
                </span>
                <div>
                  <h2 className="text-sm font-bold text-on-surface">조금 더 맞춤 설정하기</h2>
                  <span className="text-[11px] text-secondary">낮잠 시간 &amp; 부모 휴식 비중</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-secondary transition-transform duration-200 group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="px-4 pb-4 flex flex-col gap-3 pt-1 border-t border-outline-variant/10">
              {/* Nap Schedule */}
              <div className="p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">bedtime</span>
                    아이 낮잠 시간대
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white text-primary font-bold shadow-xs">
                    오후 {napStart} ~ {napEnd}
                  </span>
                </div>
                <p className="text-[11px] text-secondary leading-snug">
                  차량 이동 중 낮잠 구간 또는 조용한 카페로 자동 배치됩니다.
                </p>
              </div>

              {/* Lunch Preference */}
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-on-surface">점심 식사 포함</div>
                  <div className="text-[11px] text-secondary">이천 도착 직후 (12:00 경) 권장</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeLunch(!includeLunch)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    includeLunch ? "bg-primary text-white" : "bg-outline-variant/50 text-white"
                  }`}
                  data-testid="toggle-lunch"
                >
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </button>
              </div>

              {/* Parent Rest Priority */}
              <div className="p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-on-surface">부모 휴식 중요도</span>
                  <span className="text-xs text-primary font-bold">높음 (카페 40분 보장)</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-4/5" />
                </div>
              </div>
            </div>
          </details>

          {/* Validation Notice Banner (if invalid) */}
          {validationMessage && (
            <div className="p-3 bg-error-container/40 rounded-xl flex items-center gap-2 text-error text-xs font-medium" data-testid="validation-notice">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationMessage}</span>
            </div>
          )}

          {/* Sticky Bottom Submit Action */}
          <div className="fixed bottom-0 inset-x-0 max-w-[480px] mx-auto bg-surface/95 backdrop-blur-md px-4 py-3 border-t border-outline-variant/30 z-50">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full h-[52px] rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                isFormValid
                  ? "bg-primary hover:bg-primary-container text-white active:scale-[0.98]"
                  : "bg-surface-container text-on-surface-variant/50 cursor-not-allowed shadow-none"
              }`}
              data-testid="btn-submit-trip"
            >
              <span>우리 가족 코스 추천받기 (4개 코스 예상)</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <p className="text-[11px] text-center text-secondary mt-1.5 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified_user</span>
              아이의 체력을 고려해 무리한 다중 장소는 자동으로 필터링됩니다.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
