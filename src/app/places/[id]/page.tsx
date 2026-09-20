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
import { VisitorPhotos } from "@/features/place-detail/components/VisitorPhotos";

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
      {/* Main Detail Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-28 lg:pb-12">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/places" className="inline-flex h-9 items-center gap-1 rounded-full bg-surface-container-low px-3 text-xs font-bold text-primary hover:bg-surface-container">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            장소 탐색으로
          </Link>
          <span className="text-xs font-semibold text-on-surface-variant">장소 상세 정보</span>
        </div>
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
        <VisitorPhotos placeId={place.id} />
      </main>

      {/* STORY-306: Sticky Bottom Action Bar */}
      <BottomActionBar place={place} />
    </div>
  );
}
