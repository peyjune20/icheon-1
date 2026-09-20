import Link from "next/link";
import Image from "next/image";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNavBar } from "@/components/shared/BottomNavBar";

const COURSE_STOPS = [
  { time: "10:30", name: "이천농업테마공원", detail: "유모차로 걷기 좋은 호수 산책" },
  { time: "12:00", name: "미솥지음", detail: "아기의자와 가족 좌석이 있는 쌀밥 식사" },
  { time: "13:30", name: "라이스카페", detail: "낮잠 시간에도 편안한 부모 쉼표" },
  { time: "15:30", name: "덕평공룡수목원", detail: "AI 추천 후보 · 아이 눈높이의 가벼운 마무리 산책" },
];

const COURSE_POINTS = [
  ["route", "무리 없는 동선", "한 장소에서 다음 장소까지의 이동 시간을 넉넉히 잡았어요."],
  ["stroller", "아이와 함께", "유모차, 수유, 기저귀 교체처럼 꼭 필요한 정보를 먼저 확인했어요."],
  ["coffee", "부모도 쉬는 하루", "아이의 낮잠과 부모 휴식 시간을 코스 안에 자연스럽게 담았어요."],
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-24 sm:px-6 lg:pb-16 lg:pt-32">
        <section className="grid items-stretch gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="flex flex-col justify-center py-2 lg:py-8">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary-fixed px-3 py-1.5 text-xs font-bold text-on-primary-fixed shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              아이와 함께 걷는 이천 당일 코스
            </div>
            <p className="text-sm font-bold text-primary">ICHEON DAY TOUR · FOR FAMILIES</p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.22] tracking-tight sm:text-5xl lg:text-[56px]">
              아이가 편안하면,
              <br />여행도 오래 기억됩니다.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-on-surface-variant sm:text-lg">
              산책, 식사, 낮잠과 부모의 휴식까지. 이천베베로드는 가족이 실제로 소화할 수 있는 속도로 이천의 하루를 소개합니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/trip"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[0_5px_18px_-3px_rgba(49,99,66,0.35)] transition-all hover:bg-primary-container active:scale-[0.98]"
                data-testid="btn-start-course"
              >
                우리 가족 코스 만들기
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <a href="#course-intro" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-outline-variant bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-surface-container-low">
                대표 코스 살펴보기
                <span className="material-symbols-outlined text-[18px]">south</span>
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 border-t border-outline-variant/40 pt-5">
              <div>
                <p className="text-2xl font-bold text-primary">20</p>
                <p className="mt-1 text-xs text-on-surface-variant">코스 조합 후보</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5.5h</p>
                <p className="mt-1 text-xs text-on-surface-variant">아이 컨디션을 고려한 하루</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">7 + 13</p>
                <p className="mt-1 text-xs text-on-surface-variant">실측 + AI 추천</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-surface-container shadow-lg lg:min-h-[540px]">
            <Image
              src="/resources/pic/3-1.jpg"
              alt="이천농업테마공원의 산책 풍경"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#453564]/90 via-[#7866b2]/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                이천 베베 추천 코스 01
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">호수 산책부터 쌀밥 한 상까지</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                도착 직후 뛰어다니지 않아도 되는 산책과 식사, 잠깐의 휴식을 차례로 이어갑니다.
              </p>
            </div>
          </div>
        </section>

        <section id="course-intro" className="mt-16 scroll-mt-28 rounded-[28px] bg-surface-container-low p-5 sm:p-8 lg:mt-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <div>
              <p className="text-xs font-bold text-primary">A DAY IN ICHEON</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">하루의 리듬을 따라가는<br />이천 가족 투어</h2>
              <p className="mt-4 text-sm leading-6 text-on-surface-variant">
                관광지를 많이 넣기보다, 아이가 즐길 시간과 부모가 숨을 고를 시간을 남기는 것을 이 코스의 기준으로 삼았습니다.
              </p>
              <Link href="/itinerary" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                내 조건으로 코스 확인하기
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </Link>
            </div>
            <ol className="relative grid gap-3 md:grid-cols-2">
              {COURSE_STOPS.map((stop, index) => (
                <li key={stop.name} className="relative rounded-2xl bg-white p-4 shadow-xs">
                  <span className="absolute right-4 top-4 text-xs font-bold text-primary/60">0{index + 1}</span>
                  <p className="text-sm font-bold text-primary">{stop.time}</p>
                  <h3 className="mt-2 text-base font-bold">{stop.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{stop.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mt-16 lg:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-primary">WHY THIS COURSE</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">여행 전에도, 여행 중에도 안심할 수 있도록</h2>
            </div>
            <Link href="/places" className="text-sm font-bold text-primary hover:underline">장소별 정보 모두 보기</Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COURSE_POINTS.map(([icon, title, description]) => (
              <article key={title} className="rounded-2xl border border-outline-variant/30 bg-white p-5 shadow-xs">
                <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-[22px] text-primary">{icon}</span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <BottomNavBar activeTab="home" />
    </div>
  );
}
