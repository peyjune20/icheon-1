import { Place } from "@/domain/models/place";
const fields = [["strollerAccessible","유모차 주행","stroller"],["diaperChangingStation","기저귀 갈이대","baby_changing_station"],["parking","주차장","local_parking"],["nursingRoom","수유실","child_care"],["toilet","화장실","wc"],["shade","그늘·휴식 공간","park"],["babyChair","아기의자","chair_alt"],["strollerRental","유모차 대여","stroller"]] as const;
export function FacilityCheckGrid({ place }: { place: Place }) {
  return <section className="mb-8" data-testid="facility-check-grid"><h2 className="mb-2 text-lg font-bold">아이와 가기 체크</h2><p className="mb-4 text-xs leading-5 text-on-surface-variant">확인한 정보와 아직 확인되지 않은 시설을 구분했어요. 운영·현장 상황은 달라질 수 있어요.</p>
    <div className="grid gap-3 sm:grid-cols-2">{fields.map(([key, name, icon]) => {
      const item = place[key], unknown = item.value === "UNKNOWN", field = item.sourceType === "FIELD_VISIT";
      return <article key={key} data-testid={`facility-${key}-${item.value}`} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
        <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary">{icon}</span><h3 className="flex-1 text-sm font-bold">{name}</h3><span className={`rounded-full px-2 py-1 text-xs ${unknown ? "bg-amber-50 text-amber-800" : "bg-surface-container text-secondary"}`}>{unknown ? "미확인" : item.value === "YES" ? field ? "현장 확인" : "공개 안내 확인" : "지원 안 됨"}</span></div>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{item.note || (unknown ? "공개 자료에서 확인하지 못했어요. 방문 전 문의해 주세요." : item.value === "YES" ? "이용 가능으로 기록되어 있어요. 세부 조건은 방문 전 확인하세요." : "미지원으로 기록되어 있어요.")}</p>
        {item.sourceRef && <a href={item.sourceRef} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-secondary underline">확인 자료 ↗</a>}
      </article>;
    })}</div></section>;
}
