"use client";

import Link from "next/link";

export const AppHeader = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(49,99,66,0.05)] pt-safe">
      <div className="max-w-[480px] mx-auto h-16 px-margin-mobile flex items-center justify-between">
        <Link href="/" className="flex items-center gap-space-sm">
          <span className="font-headline text-headline-lg text-primary tracking-tight font-bold">이천베베로드</span>
          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-label-sm">
            <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
            <span>이천시</span>
          </div>
        </Link>
        <div className="flex items-center gap-space-sm">
          <button
            aria-label="알림 및 안심팁"
            onClick={() => alert("오늘의 날씨 안심팁: 최고기온 31℃ 무더위로 오후 실내 일정이 우선 추천되었습니다.")}
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-sm shadow-[0_0_0_1.5px_#4A7C59]">
            민지
          </div>
        </div>
      </div>
    </header>
  );
};
