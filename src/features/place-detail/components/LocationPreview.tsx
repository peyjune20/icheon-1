import { Place } from "@/domain/models/place";
import { PlaceMap } from "@/components/shared/PlaceMap";
import { kakaoSearchUrl, kakaoCarUrl } from "@/lib/map-points";

export function LocationPreview({ place }: { place: Place }) {
  return <section className="mb-8" data-testid="location-preview">
    <h2 className="mb-2 text-lg font-bold">위치 및 주변 접근성</h2>
    <p className="mb-3 text-sm leading-6 text-on-surface-variant">{place.roadAddress || place.address}</p>
    {place.addressEvidence && <p className="mb-3 text-xs leading-5 text-on-surface-variant">{place.addressEvidence.note} <a href={place.addressEvidence.url} target="_blank" rel="noreferrer" className="underline">주소 확인 자료 ↗</a> · {place.addressEvidence.checkedAt} 조회 · AI 대조 정보이므로 방문 전 확인해 주세요.</p>}
    <PlaceMap points={[place]} />
    {place.researchedInfo?.access && <p className="mt-3 text-sm leading-6">{place.researchedInfo.access}</p>}
    {!place.coordinateSource && <p className="mt-2 text-xs text-on-surface-variant">카카오 Places에서 장소명을 대조해 위치를 찾아요. 정확한 입구·주차장은 카카오맵에서 최종 확인해 주세요.</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={kakaoSearchUrl(place)} target="_blank" rel="noreferrer" className="rounded-xl bg-[#fee500] px-4 py-3 text-sm font-bold text-[#191919]">카카오맵에서 실제 장소 보기 ↗</a>
      {kakaoCarUrl([place]) && <a href={kakaoCarUrl([place])!} target="_blank" rel="noreferrer" className="rounded-xl bg-surface-container px-4 py-3 text-sm font-bold">카카오 길찾기 ↗</a>}
    </div>
  </section>;
}
