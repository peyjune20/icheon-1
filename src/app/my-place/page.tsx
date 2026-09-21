"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePlaces } from "@/features/custom-places/use-places";
import { HeroBanner } from "@/features/place-detail/components/HeroBanner";
import { LocationPreview } from "@/features/place-detail/components/LocationPreview";
import { VisitorPhotos } from "@/features/place-detail/components/VisitorPhotos";
import { BottomActionBar } from "@/features/place-detail/components/BottomActionBar";
import { FacilityCheckGrid } from "@/features/place-detail/components/FacilityCheckGrid";
import { DeletePlaceButton } from "@/features/custom-places/DeletePlaceButton";
function MyPlaceContent() {
  const router = useRouter();
  const params = useSearchParams(); const { places, error } = usePlaces(); const place = places.find(p => p.id === params.get("id"));
  return <main className="mx-auto max-w-5xl px-5 pb-28 pt-28"><Link href="/my-trip#my-places" className="mb-6 inline-block text-sm font-bold text-primary">← 내 장소 관리</Link>{place ? <><div className="mb-5 flex justify-end"><DeletePlaceButton place={place} onDeleted={() => router.replace("/my-trip?deleted=place#my-places")} /></div><HeroBanner place={place} /><p className="mb-6 rounded-xl bg-surface-container-low p-4 text-sm">직접 추가한 장소예요. 현장 검증된 정보가 아니므로 운영시간과 편의시설은 방문 전에 확인해 주세요.</p><LocationPreview place={place} /><VisitorPhotos placeId={place.id} /><FacilityCheckGrid place={place} /><BottomActionBar place={place} /></> : <p role="status">{error || "내 장소를 불러오는 중이거나 삭제된 장소예요. 로그인 상태와 내 장소 목록을 확인해 주세요."}</p>}</main>;
}
export default function MyPlacePage() { return <Suspense fallback={<p className="p-24">장소 불러오는 중…</p>}><MyPlaceContent /></Suspense>; }
