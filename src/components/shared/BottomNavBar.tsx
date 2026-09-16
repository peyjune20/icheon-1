"use client";

import Link from "next/link";

interface BottomNavBarProps {
  activeTab?: "home" | "itinerary" | "places" | "mytrip";
}

export const BottomNavBar = ({ activeTab = "itinerary" }: BottomNavBarProps) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(43,43,43,0.05)]">
      <div className="max-w-[480px] mx-auto flex justify-around items-center h-16 px-gutter-mobile">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            activeTab === "home" ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="text-label-sm">홈</span>
        </Link>
        <Link
          href="/itinerary"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            activeTab === "itinerary" ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">alt_route</span>
          <span className="text-label-sm">코스 추천</span>
        </Link>
        <Link
          href="/places"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            activeTab === "places" ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          <span className="text-label-sm">장소 탐색</span>
        </Link>
        <button
          type="button"
          onClick={() => alert("내 일정 보관함 기능은 준비 중입니다.")}
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            activeTab === "mytrip" ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">calendar_month</span>
          <span className="text-label-sm">내 일정</span>
        </button>
      </div>
    </nav>
  );
};
