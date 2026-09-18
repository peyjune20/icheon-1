"use client";

import React, { useState } from "react";
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
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["NATURE", "PARENT_REST"]);

  // Optional Accordion State
  const [napStart, setNapStart] = useState("13:30");
  const [napEnd, setNapEnd] = useState("15:00");
  const [includeLunch, setIncludeLunch] = useState(true);
  const [parentRestPriority, setParentRestPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("HIGH");

  // 여행 시간과 이동수단은 추천 엔진의 안전한 기본값으로 처리한다.
  // 사용자는 아이 정보와 원하는 여행 스타일만 고르면 된다.
  const isFormValid = selectedStyles.length >= 1;
  const validationMessage =
    selectedStyles.length === 0
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
      lunch: String(includeLunch),
      styles: selectedStyles.join(","),
      napStart,
      napEnd,
      parentRestPriority,
    });

    router.push(`/itinerary?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      {/* Top Header & Progress */}
      <header className="sticky top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-high pt-safe">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-2">
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

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-32">
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

          {/* Section B: 여행 스타일 */}
          <section className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/30" data-testid="section-styles">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  B
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

          {/* Section C: 세부 맞춤 설정 (Accordion) */}
          <details className="group bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden" open>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                  C
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
              <div className="p-3 bg-surface-container-low rounded-lg flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">bedtime</span>
                    아이 낮잠 시간대
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white text-primary font-bold shadow-xs">
                    {napStart && napEnd ? `${napStart} ~ ${napEnd}` : "낮잠 없음"}
                  </span>
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "12:30 ~ 14:00", start: "12:30", end: "14:00" },
                    { label: "13:00 ~ 14:30", start: "13:00", end: "14:30" },
                    { label: "13:30 ~ 15:00", start: "13:30", end: "15:00" },
                    { label: "14:00 ~ 15:30", start: "14:00", end: "15:30" },
                    { label: "낮잠 없음", start: "", end: "" },
                  ].map((preset) => {
                    const isSelected = napStart === preset.start && napEnd === preset.end;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setNapStart(preset.start);
                          setNapEnd(preset.end);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-white font-bold shadow-xs"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                        data-testid={`preset-nap-${preset.label}`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Inputs */}
                {napStart !== "" && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-outline-variant/30 text-xs">
                      <span className="text-secondary text-[11px]">시작</span>
                      <input
                        type="time"
                        value={napStart}
                        onChange={(e) => setNapStart(e.target.value)}
                        className="w-full bg-transparent font-semibold text-on-surface outline-hidden text-xs"
                        data-testid="input-nap-start"
                      />
                    </div>
                    <span className="text-secondary text-xs">~</span>
                    <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-outline-variant/30 text-xs">
                      <span className="text-secondary text-[11px]">종료</span>
                      <input
                        type="time"
                        value={napEnd}
                        onChange={(e) => setNapEnd(e.target.value)}
                        className="w-full bg-transparent font-semibold text-on-surface outline-hidden text-xs"
                        data-testid="input-nap-end"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-secondary leading-snug">
                  {napStart && napEnd
                    ? "차량 이동 중 낮잠 구간 또는 조용한 카페/쉼터로 자동 배치됩니다."
                    : "낮잠 시간 제약 없이 아이와 부모의 컨디션에 맞춘 여유로운 동선으로 구성됩니다."}
                </p>
              </div>

              {/* Lunch Preference */}
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div>
                  <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <span>점심 식사 포함</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        includeLunch ? "bg-primary/15 text-primary" : "bg-surface-container text-secondary"
                      }`}
                    >
                      {includeLunch ? "포함" : "제외"}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary mt-0.5">
                    {includeLunch
                      ? "이천 도착 직후 (12:00 경) 아기의자 완비 쌀밥 맛집 배정"
                      : "식사 코스를 제외하고 자연 산책 & 실내 쉼터 위주 구성"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeLunch(!includeLunch)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    includeLunch ? "bg-primary text-white shadow-xs" : "bg-outline-variant/40 text-on-surface-variant hover:bg-outline-variant/60"
                  }`}
                  data-testid="toggle-lunch"
                  aria-label="점심식사 포함 여부 토글"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {includeLunch ? "check" : "close"}
                  </span>
                </button>
              </div>

              {/* Parent Rest Priority */}
              <div className="p-3 bg-surface-container-low rounded-lg flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface">부모 휴식 중요도</span>
                  <span className="text-xs text-primary font-bold">
                    {parentRestPriority === "LOW"
                      ? "가벼움 (카페 20분)"
                      : parentRestPriority === "MEDIUM"
                      ? "보통 (카페 40분)"
                      : "높음 (카페 60분 보장)"}
                  </span>
                </div>

                {/* 3-Step Selection Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "LOW", label: "가벼움 (20분)", desc: "테이크아웃 위주" },
                    { id: "MEDIUM", label: "보통 (40분)", desc: "차 한잔의 여유" },
                    { id: "HIGH", label: "높음 (60분)", desc: "부모 힐링 보장" },
                  ].map((priority) => {
                    const isSelected = parentRestPriority === priority.id;
                    return (
                      <button
                        key={priority.id}
                        type="button"
                        onClick={() => setParentRestPriority(priority.id as "LOW" | "MEDIUM" | "HIGH")}
                        className={`p-2 rounded-lg text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-primary text-white font-bold shadow-xs scale-[1.02]"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                        data-testid={`priority-${priority.id.toLowerCase()}`}
                      >
                        <span className="text-[11px] leading-none">{priority.label}</span>
                        <span className={`text-[9px] ${isSelected ? "text-white/80" : "text-secondary"}`}>
                          {priority.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary rounded-full transition-all duration-300 ${
                      parentRestPriority === "LOW"
                        ? "w-1/3"
                        : parentRestPriority === "MEDIUM"
                        ? "w-2/3"
                        : "w-full"
                    }`}
                  />
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
          <div className="fixed bottom-0 inset-x-0 mx-auto bg-surface/95 backdrop-blur-md px-4 sm:px-6 py-3 border-t border-outline-variant/30 z-50">
            <div className="max-w-3xl mx-auto">
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
          </div>
        </form>
      </main>
    </div>
  );
}
