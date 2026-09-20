import { Place } from "@/domain/models/place";
import { PlaceMap } from "@/components/shared/PlaceMap";

export function LocationPreview({ place }: { place: Place }) {
  return <section className="mb-8" data-testid="location-preview">
    <h2 className="mb-2 text-lg font-bold">위치 및 주변 접근성</h2>
    <p className="mb-3 text-sm leading-6 text-on-surface-variant">{place.roadAddress || place.address}</p>
    <PlaceMap points={[place]} />
    {place.researchedInfo?.access && <p className="mt-3 text-sm leading-6">{place.researchedInfo.access}</p>}
    {!place.coordinateSource && <p className="mt-2 text-xs text-on-surface-variant">정확한 입구 좌표가 미확인인 곳은 주소 검색 지도를 사용해요. 입구·주차장은 카카오맵에서도 확인해 주세요.</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={`https://map.kakao.com/?q=${encodeURIComponent(`${place.name} ${place.address}`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-[#fee500] px-4 py-3 text-sm font-bold text-[#191919]">카카오맵에서 실제 장소 보기 ↗</a>
      {place.coordinateSource && <a href={`https://map.kakao.com/link/to/${encodeURIComponent(place.name)},${place.lat},${place.lng}`} target="_blank" rel="noreferrer" className="rounded-xl bg-surface-container px-4 py-3 text-sm font-bold">카카오 길찾기 ↗</a>}
    </div>
  </section>;
}
