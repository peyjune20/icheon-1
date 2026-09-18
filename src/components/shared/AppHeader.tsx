"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const AppHeader = () => {
  const pathname = usePathname();
  const navigationItems = [
    { href: "/", label: "코스 소개" },
    { href: "/itinerary", label: "코스 추천" },
    { href: "/places", label: "장소 탐색" },
    { href: "/my-trip", label: "나의 투어" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-outline-variant/25 bg-surface/90 pt-safe backdrop-blur-xl shadow-[0_1px_12px_rgba(49,99,66,0.05)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-space-sm">
          <span className="font-headline text-headline-lg font-bold tracking-tight text-primary">이천베베로드</span>
          <div className="hidden items-center gap-0.5 rounded-full bg-surface-container-low px-2 py-0.5 text-label-sm text-on-surface-variant sm:flex">
            <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
            <span>이천시</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="주요 메뉴">
          {navigationItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-space-sm">
          <button
            aria-label="알림 및 안심팁"
            onClick={() => alert("오늘의 날씨 안심팁: 최고기온 31℃ 무더위로 오후 실내 일정이 우선 추천되었습니다.")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
};
