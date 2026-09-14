import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeedPlaceRepository } from "@/infrastructure/repositories/seed-place-repository";
import { HeroBanner } from "@/features/place-detail/components/HeroBanner";
import { TrustCard } from "@/features/place-detail/components/TrustCard";
import { FacilityCheckGrid } from "@/features/place-detail/components/FacilityCheckGrid";
import { ParentReviewBox } from "@/features/place-detail/components/ParentReviewBox";
import { PracticalInfoGrid } from "@/features/place-detail/components/PracticalInfoGrid";
import { LocationPreview } from "@/features/place-detail/components/LocationPreview";
import { BottomActionBar } from "@/features/place-detail/components/BottomActionBar";

interface PlaceDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const repo = new SeedPlaceRepository();
  const places = await repo.listCandidates();
  return places.map((place) => ({
    id: place.id,
  }));
}

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const repo = new SeedPlaceRepository();
  const place = await repo.findById(params.id);

  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col text-on-surface">
      {/* Top Header */}
      <header className="sticky top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high pt-safe">
        <div className="max-w-[480px] mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link
              href="/itinerary"
              aria-label="뒤로 가기"
              className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
            </Link>
            <span className="text-base font-bold text-on-surface truncate">장소 상세 정보</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="공유하기"
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Detail Container */}
      <main className="flex-1 w-full max-w-[480px] mx-auto px-4 pt-3 pb-28">
        {/* STORY-301: Hero Banner */}
        <HeroBanner place={place} />

        {/* STORY-302: Verification Trust Card */}
        <TrustCard place={place} />

        {/* STORY-303: Core Logistics 8 Facilities Tri-State Matrix */}
        <FacilityCheckGrid place={place} />

        {/* STORY-304: Editorial Parent Review Box */}
        <ParentReviewBox place={place} />

        {/* STORY-305: Practical Info 4-Grid & Location Accessibility */}
        <PracticalInfoGrid place={place} />
        <LocationPreview place={place} />
      </main>

      {/* STORY-306: Sticky Bottom Action Bar */}
      <BottomActionBar place={place} />
    </div>
  );
}
