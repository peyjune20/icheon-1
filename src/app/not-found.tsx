import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-on-surface">
      <div className="w-14 h-14 rounded-full bg-error-container/50 text-error flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px]">warning</span>
      </div>
      <h2 className="text-xl font-bold text-on-surface mb-2">장소를 찾을 수 없습니다</h2>
      <p className="text-xs text-on-surface-variant max-w-[280px] mb-6 leading-relaxed">
        요청하신 페이지 또는 장소 정보가 존재하지 않거나 일시적으로 이동되었습니다.
      </p>
      <Link
        href="/itinerary"
        className="h-11 px-5 rounded-full bg-primary text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-primary-container"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>추천 일정으로 돌아가기</span>
      </Link>
    </div>
  );
}
