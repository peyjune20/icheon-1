import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNavBar } from "@/components/shared/BottomNavBar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      <AppHeader />

      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-16 pb-28">
        {/* Value Proposition Hero Section */}
        <section className="relative flex flex-col pt-3 mb-6">
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              spa
            </span>
            <span className="text-xs font-semibold tracking-tight">영유아 동반 이천 당일치기 큐레이션</span>
          </div>

          <h1 className="text-2xl text-on-surface font-bold tracking-tight leading-snug">
            아이와 함께,<br />
            <span className="text-primary">무리 없는 이천 하루.</span>
          </h1>

          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            아이 개월수와 여행 스타일만 알려주세요.<br />
            수유 텀, 기저귀 갈이대, 유모차 길까지 챙긴 진짜 소화 가능한 일정을 선물할게요.
          </p>

          {/* Warm Editorial Hero Card */}
          <div className="relative w-full rounded-2xl overflow-hidden mt-4 shadow-sm bg-surface-container-lowest">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
              <Image
                src="/resources/pic/3-1.jpg"
                alt="이천농업테마공원 완경사 산책로"
                fill
                priority
                sizes="(max-width: 480px) 100vw, 480px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-white/90 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px]">verified</span> 이천 현장 전수 답사 완료
                  </span>
                  <span className="text-base font-bold text-white drop-shadow-sm">
                    이천농업테마공원
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-semibold">
                  유모차 PASS
                </span>
              </div>
            </div>

            {/* Quick trust bar */}
            <div className="flex items-center justify-around py-3 px-2 bg-surface-container-low text-on-surface">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[16px] text-primary">child_care</span>
                <span>0~36개월 맞춤 동선</span>
              </div>
              <div className="h-3 w-px bg-outline-variant/60" />
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[16px] text-primary">airline_seat_recline_extra</span>
                <span>전 코스 아기의자 보장</span>
              </div>
            </div>
          </div>

          {/* Primary Launch Action Button (FR-HOME-007) */}
          <Link
            href="/trip"
            className="mt-4 w-full h-[52px] rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center gap-2 shadow-[0_4px_16px_-2px_rgba(49,99,66,0.3)] active:scale-[0.98] transition-all font-bold text-sm"
            data-testid="btn-start-course"
          >
            <span>우리 가족 맞춤 코스 만들기</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </section>

        {/* 5 Core Trust Standards */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 mb-5 border border-outline-variant/30">
          <h2 className="text-sm font-bold text-on-surface mb-2.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            이천베베로드 5대 안심 기준
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
            <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-1.5">
              <span className="text-[#2D8A4E] font-bold">✓</span> 유모차 완경사로 직접 실측
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-1.5">
              <span className="text-[#2D8A4E] font-bold">✓</span> 독립 수유실 및 온수 확인
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-1.5">
              <span className="text-[#2D8A4E] font-bold">✓</span> 장소당 주차 버퍼 10분 강제
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low flex items-center gap-1.5">
              <span className="text-[#2D8A4E] font-bold">✓</span> 4개 초과 과밀 일정 원천 방지
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar activeTab="home" />
    </div>
  );
}
