"use client";
import Image from "next/image";
import Link from "next/link";
import { Place } from "@/domain/models/place";
import { placeDetailHref } from "@/features/custom-places/place-links";
import { TourStampRecord } from "./tour-stamps.storage";
export const COLLECTIONS = [
  { category: "RESTAURANT", title: "쌀밥 요리사", row: 0, x: 17, y: 30 },
  { category: "NATURE", title: "숲 해설가", row: 1, x: 50, y: 30 },
  { category: "PARK", title: "공원 지킴이", row: 2, x: 83, y: 30 },
  { category: "CAFE", title: "카페 바리스타", row: 3, x: 17, y: 67 },
  { category: "EXPERIENCE", title: "체험 놀이터 지기", row: 4, x: 50, y: 67 },
  { category: "INDOOR", title: "실내 큐레이터", row: 5, x: 83, y: 67 },
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
    <div className="mt-5 overflow-x-auto rounded-3xl border border-outline-variant/25" tabIndex={0} aria-label="가로로 살펴볼 수 있는 마을 지도">
      <div className="relative aspect-[16/10] min-w-[700px]">
        <Image src="/assets/village-background.png" alt="강과 오솔길이 흐르는 여섯 구역의 이천 상상 마을" fill sizes="1100px" className="object-cover" />
        {groups.map(group => <div key={group.category}>
          <div className="absolute z-10 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-center text-xs font-bold shadow-sm" style={{ left: `${group.x}%`, top: `${group.y - 13}%` }}>{group.title} {group.places.filter(p => visited.has(p.id)).length}/{group.places.length}</div>
          {group.places.map((place, index) => {
            const cols = Math.min(3, group.places.length), rows = Math.ceil(group.places.length / cols);
            const active = visited.has(place.id);
            return <Link key={place.id} href={placeDetailHref(place)} title={`${place.name} · ${active ? "방문 완료" : "아직 방문 전"}`} aria-label={`${place.name} ${active ? "색칠 완료" : "미방문 그림자"}`} className="group absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-xl focus:outline-2 focus:outline-primary" style={{ left: `${group.x + ((index % cols) - (cols - 1) / 2) * 8}%`, top: `${group.y + (Math.floor(index / cols) - (rows - 1) / 2) * 9 + 3}%`, width: `${group.places.length === 1 ? 12 : 8}%`, height: `${group.places.length === 1 ? 18 : 12}%` }}>
              <div className="h-full w-full transition duration-500 group-hover:scale-110" style={{ filter: active ? "drop-shadow(0 3px 2px #59432835)" : "brightness(0) opacity(0.22)" }}><Sprite row={group.row} column={index % 5} /></div>
              <span className="pointer-events-none absolute left-1/2 top-full hidden w-max max-w-48 -translate-x-1/2 rounded-md bg-white px-2 py-1 text-[10px] font-bold shadow-md group-hover:block group-focus:block">{place.name}</span>
            </Link>;
          })}
        </div>)}
      </div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{groups.map(group => <div key={group.category} className="rounded-xl bg-surface-container-low px-3 py-2 text-xs"><strong>{group.title}</strong><span className="float-right">{group.places.filter(p => visited.has(p.id)).length}/{group.places.length}</span><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-outline-variant/30"><div className="h-full rounded-full bg-primary" style={{ width: `${group.places.length ? group.places.filter(p => visited.has(p.id)).length / group.places.length * 100 : 0}%` }} /></div></div>)}</div>
  </section>;
}
