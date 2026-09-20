"use client";
import Image from "next/image";
import Link from "next/link";
import { Place } from "@/domain/models/place";
import { placeDetailHref } from "@/features/custom-places/place-links";
import { TourStampRecord } from "./tour-stamps.storage";
import { VILLAGE_SLOTS } from "./village-layout";
export const COLLECTIONS = [
  { category: "RESTAURANT", title: "쌀밥 요리사", row: 0 },
  { category: "NATURE", title: "숲 해설가", row: 1 },
  { category: "PARK", title: "공원 지킴이", row: 2 },
  { category: "CAFE", title: "카페 바리스타", row: 3 },
  { category: "EXPERIENCE", title: "체험 놀이터 지기", row: 4 },
  { category: "INDOOR", title: "실내 큐레이터", row: 5 },
];
function Sprite({ row, column }: { row: number; column: number }) {
  const xs = [0, 260, 505, 752, 992, 1254], ys = [0, 219, 425, 622, 829, 1028, 1254];
  const x = xs[column], y = ys[row], w = xs[column + 1] - x, h = ys[row + 1] - y;
  return <svg viewBox={`${x} ${y} ${w} ${h}`} className="h-full w-full overflow-hidden" aria-hidden="true"><image href="/assets/village-sprites.png" width="1254" height="1254" /></svg>;
}
export function VillageCollection({ places, stamps }: { places: Place[]; stamps: TourStampRecord[] }) {
  const visited = new Set(stamps.map(s => s.placeId));
  const groups = COLLECTIONS.map(group => ({ ...group, places: places.filter(p => p.category === group.category) }));
  const total = groups.reduce((sum, g) => sum + g.places.length, 0);
  const count = groups.reduce((sum, g) => sum + g.places.filter(p => visited.has(p.id)).length, 0);
  return <section className="mt-8 rounded-[28px] border border-outline-variant/30 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold text-primary">BEBE COLLECTION</p><h2 className="mt-1 text-xl font-bold">한 곳씩, 우리 이천 마을을 색칠해요</h2></div><span className="rounded-full bg-primary-fixed px-3 py-2 text-sm font-bold">{count} / {total} 조형물 완성</span></div>
    <p className="mt-3 text-sm leading-6 text-on-surface-variant">장소 하나 = 조형물 하나. 방문한 장소의 나무·집·동물만 색이 채워져요. 조형물을 누르면 해당 장소로 이동합니다.</p>
    <p className="mt-2 text-xs text-primary sm:hidden">마을을 좌우로 밀어 숨어 있는 조형물을 찾아보세요.</p>
    <div className="mt-5 overflow-x-auto rounded-3xl border border-outline-variant/25" tabIndex={0} aria-label="가로로 살펴볼 수 있는 마을 지도">
      <div className="relative aspect-[16/10] min-w-[900px]">
        <Image src="/assets/village-connected.png" alt="냇가와 두 다리, 논과 집, 오솔길이 이어진 한 장의 이천 상상 마을" fill sizes="1100px" className="object-cover" />
        {VILLAGE_SLOTS.map(slot => {
          const place = places.find(p => p.id === slot.placeId); if (!place) return null;
          const group = COLLECTIONS.find(g => g.category === place.category); if (!group) return null;
          const active = visited.has(place.id);
          return <Link key={place.id} href={placeDetailHref(place)} title={place.name + " · " + (active ? "방문 완료" : "아직 방문 전")} aria-label={place.name + " " + (active ? "색칠 완료" : "미방문 그림자")} data-village-slot={place.id} data-visited={active} className="group absolute -translate-x-1/2 -translate-y-full rounded-xl focus:outline-2 focus:outline-primary" style={{ left: slot.x + "%", top: slot.y + "%", width: slot.width + "%", height: slot.height + "%", zIndex: Math.round(slot.y) }}>
            <div className="h-full w-full transition duration-500 motion-reduce:transition-none group-hover:scale-110" style={{ filter: active ? "drop-shadow(0 3px 2px #59432835)" : "brightness(0) opacity(0.38)" }}><Sprite row={group.row} column={slot.column} /></div>
            <span className="pointer-events-none absolute left-1/2 top-full hidden w-max max-w-48 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-[10px] font-bold shadow-md group-hover:block group-focus:block">{place.name}</span>
          </Link>;
        })}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{groups.map(group => <div key={group.category} className="rounded-xl bg-surface-container-low px-3 py-2 text-xs"><strong>{group.title}</strong><span className="float-right">{group.places.filter(p => visited.has(p.id)).length}/{group.places.length}</span><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-outline-variant/30"><div className="h-full rounded-full bg-primary" style={{ width: `${group.places.length ? group.places.filter(p => visited.has(p.id)).length / group.places.length * 100 : 0}%` }} /></div></div>)}</div>
  </section>;
}
