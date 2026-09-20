import { Place } from "@/domain/models/place";
export function PracticalInfoGrid({ place }: { place: Place }) {
  const info = place.researchedInfo, ai = place.recommendationSource === "AI_RECOMMENDED";
  const days = ["일","월","화","수","목","금","토"];
  const items = [
    ["체류 계획", `약 ${place.recommendedDurationMin}분`, "가족의 속도에 맞춰 조절하는 추천 시간이에요."],
    ["운영시간", info?.hours || (ai ? "공식 운영시간 미확인" : `${place.openingHours.open}–${place.openingHours.close}`), info?.closed || (place.openingHours.closedDays.length ? `정기 휴무: ${place.openingHours.closedDays.map(d=>days[d]).join(", ")}요일 · 임시 휴무 확인` : "임시 휴무·행사 일정은 방문 전 확인하세요.")],
    ["비용 안내", info?.cost || "최신 요금은 운영처에 확인해 주세요.", "연령·체험·예약 조건에 따라 달라질 수 있어요."],
    ["날씨와 이용", place.indoorOutdoor === "INDOOR" ? "실내 중심" : place.indoorOutdoor === "MIXED" ? "실내·실외 공간" : "야외 중심", place.indoorOutdoor === "OUTDOOR" ? "강수·기온·현장 통제를 확인하세요." : "냉난방·실내 이용 가능 구역은 운영처에 확인하세요."]
  ];
  return <section className="mb-8" data-testid="practical-info-grid"><h2 className="mb-3 text-lg font-bold">방문 전 필수 정보</h2>{place.unavailableReason && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-900">{place.unavailableReason}</p>}
    <div className="grid gap-3 sm:grid-cols-2">{items.map(([title,value,note])=><div key={title} className="rounded-2xl border border-outline-variant/30 bg-white p-5"><h3 className="text-xs text-secondary">{title}</h3><p className="mt-2 text-sm font-bold">{value}</p><p className="mt-2 text-xs leading-5 text-on-surface-variant">{note}</p></div>)}</div>
    {info && <div className="mt-4 rounded-xl bg-surface-container-low p-4 text-xs leading-6"><p>AI가 공개 안내를 조사해 정리했어요 · 자료 확인 {info.checkedAt}. 현장 실측 인증과는 다르며, 최신 운영 여부와 유아 시설은 방문 전 다시 확인해 주세요.</p>{info.phone && <a href={`tel:${info.phone}`} className="mr-4 font-bold">전화 문의 {info.phone}</a>}{info.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="mr-3 font-bold text-secondary underline">{s.label} ↗</a>)}</div>}
  </section>;
}
