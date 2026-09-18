"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Itinerary } from "@/domain/models/itinerary";
import { Place } from "@/domain/models/place";
import { RecommendationContext } from "@/domain/models/trip-input";
import { generateItineraryUseCase } from "@/application/generate-itinerary.usecase";
import { ModifyItineraryUseCase } from "@/application/modify-itinerary.usecase";
import { SeedPlaceRepository } from "@/infrastructure/repositories/seed-place-repository";
import { SeedTravelTimeAdapter } from "@/adapters/travel-time/seed-travel-time.adapter";
import { AppHeader } from "@/components/shared/AppHeader";
import { BottomNavBar } from "@/components/shared/BottomNavBar";
import { FeasibilitySummary } from "@/features/itinerary/components/FeasibilitySummary";
import { TimelineToggle } from "@/features/itinerary/components/TimelineToggle";
import { DestinationCard } from "@/features/itinerary/components/DestinationCard";
import { TransitSegment } from "@/features/itinerary/components/TransitSegment";
import { RationaleCard } from "@/features/itinerary/components/RationaleCard";
import { ExcludedPlacesCard } from "@/features/itinerary/components/ExcludedPlacesCard";
import { SecondaryActions } from "@/features/itinerary/components/SecondaryActions";
import { ReplacePlaceModal } from "@/features/itinerary/components/ReplacePlaceModal";
import { ReorderModal } from "@/features/itinerary/components/ReorderModal";
import { NavigationModal } from "@/features/itinerary/components/NavigationModal";

function ItineraryContent() {
  const searchParams = useSearchParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [context, setContext] = useState<RecommendationContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Edit Modals State
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [targetPlaceToReplace, setTargetPlaceToReplace] = useState<Place | null>(null);
  const [replaceCandidates, setReplaceCandidates] = useState<Place[]>([]);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);

  const placeRepo = useMemo(() => new SeedPlaceRepository(), []);
  const travelAdapter = useMemo(() => new SeedTravelTimeAdapter(), []);
  const modifyUseCase = useMemo(
    () => new ModifyItineraryUseCase(placeRepo, travelAdapter),
    [placeRepo, travelAdapter]
  );

  useEffect(() => {
    setError(null);
    const childAge = searchParams.get("age") ? Number(searchParams.get("age")) : 17;
    const stroller = searchParams.get("stroller") !== "false";
    // 여행 일정과 이동수단은 별도 입력 없이 안전한 당일 코스 기본값으로 생성한다.
    // 길찾기 출발지는 NavigationModal에서 기기의 현재 위치를 사용한다.
    const origin = "현재 위치";
    const departureTime = "10:00";
    const returnTime = "17:30";
    const transport = "CAR" as const;
    const stylesParam = searchParams.get("styles");
    const styles = (stylesParam ? stylesParam.split(",") : ["NATURE", "PARENT_REST"]) as any[];
    const includeLunch = searchParams.get("lunch") !== "false";
    const tripDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
    const napStart = searchParams.get("napStart") ?? "13:30";
    const napEnd = searchParams.get("napEnd") ?? "15:00";
    const parentRestPriority = (searchParams.get("parentRestPriority") as "LOW" | "MEDIUM" | "HIGH") || "HIGH";

    const [depH, depM] = departureTime.split(":").map(Number);
    const arrH = (depH + 2) % 24;
    const arrivalInIcheon = `${String(arrH).padStart(2, "0")}:${String(depM || 0).padStart(2, "0")}`;

    const [retH, retM] = returnTime.split(":").map(Number);
    const totalWindowMin = (retH * 60 + (retM || 0)) - (arrH * 60 + (depM || 0));
    const tripWindowMin = Math.max(120, totalWindowMin);

    const defaultContext: RecommendationContext = {
      trip: {
        originText: origin,
        tripDate,
        departureTime,
        arrivalInIcheon,
        desiredDepartureFromIcheon: returnTime,
        childAgeMonths: childAge,
        displayAge: childAge <= 12 ? "12개월 미만" : childAge <= 24 ? "2세" : childAge <= 48 ? "3~4세" : "5세 이상",
        strollerRequired: stroller,
        transport,
        styles,
        includeLunch,
        parentRestPriority,
        napTimeStart: napStart,
        napTimeEnd: napEnd,
      },
      weather: {
        temperatureC: styles.includes("INDOOR") ? 31 : 23,
        condition: styles.includes("INDOOR") ? "HOT" : "NORMAL",
      },
      tripWindowMin,
      maxBlocks: 4,
    };

    setContext(defaultContext);

    generateItineraryUseCase({
      childAgeMonths: childAge,
      strollerRequired: stroller,
      originText: origin,
      departureTime,
      arrivalInIcheon,
      desiredDepartureFromIcheon: returnTime,
      transport,
      styles,
      includeLunch,
      tripDate,
      napTimeStart: napStart,
      napTimeEnd: napEnd,
      parentRestPriority,
    })
      .then((data) => {
        setItinerary(data);
      })
      .catch((err) => {
        console.error("Itinerary generation error:", err);
        setError("일정을 불러오는 중 문제가 발생했습니다. 네트워크 또는 여행 조건을 다시 확인해 주세요.");
      });
  }, [searchParams, reloadKey]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4" data-testid="error-container">
        <div className="w-14 h-14 rounded-full bg-error-container/50 text-error flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-on-surface mb-1">일정 생성에 실패했습니다</h2>
          <p className="text-xs text-on-surface-variant max-w-[280px] leading-relaxed">
            {error}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="h-10 px-4 rounded-full bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary-container active:scale-95 transition-all"
            data-testid="btn-retry"
          >
            다시 시도하기
          </button>
          <a
            href="/trip"
            className="h-10 px-4 rounded-full bg-surface-container text-on-surface font-semibold text-xs flex items-center hover:bg-surface-container-high transition-all"
          >
            조건 다시 입력
          </a>
        </div>
      </div>
    );
  }

  if (!itinerary || !context) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3" data-testid="loading-indicator">
        <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
          refresh
        </span>
        <p className="text-body-md text-on-surface-variant font-medium">
          우리 가족 일정 맞추는 중...
        </p>
      </div>
    );
  }

  const placeBlocks = itinerary.blocks.filter((b) => b.type === "PLACE");
  const departureBlock = itinerary.blocks.find((b) => b.type === "DEPARTURE");
  const currentPlaces = modifyUseCase.getPlacesFromItinerary(itinerary);

  const handleStartItinerary = () => {
    setIsNavModalOpen(true);
  };

  // STORY-307: Remove Place
  const handleRemovePlace = async (placeId: string) => {
    const updated = await modifyUseCase.removePlace(itinerary, placeId, context);
    setItinerary(updated);
  };

  // STORY-308: Reduce One Stop (-45min)
  const handleReduceOneStop = async () => {
    const updated = await modifyUseCase.reduceOneStop(itinerary, context);
    setItinerary(updated);
  };

  // STORY-309: Open & Select Replace Place
  const handleOpenReplace = async (place: Place) => {
    setTargetPlaceToReplace(place);
    const candidates = await modifyUseCase.getReplacementCandidates(itinerary);
    setReplaceCandidates(candidates);
    setIsReplaceOpen(true);
  };

  const handleSelectReplaceCandidate = async (candidateId: string) => {
    if (!targetPlaceToReplace) return;
    const updated = await modifyUseCase.replacePlace(
      itinerary,
      targetPlaceToReplace.id,
      candidateId,
      context
    );
    setItinerary(updated);
    setIsReplaceOpen(false);
    setTargetPlaceToReplace(null);
  };

  // STORY-310: Open & Apply Reorder
  const handleOpenReorder = () => {
    setIsReorderOpen(true);
  };

  const handleApplyReorder = async (newOrderedPlaceIds: string[]) => {
    const updated = await modifyUseCase.reorderPlaces(itinerary, newOrderedPlaceIds, context);
    setItinerary(updated);
  };

  return (
    <>
      <AppHeader />
      <main className="flex-1 flex flex-col relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12 bg-surface">
        <div className="flex flex-col w-full max-w-3xl mx-auto pb-8">
          {/* Feasibility & Metrics (STORY-207) */}
          <FeasibilitySummary
            status={itinerary.status}
            totalDurationMin={itinerary.totalDurationMin}
            totalTravelMin={itinerary.totalTravelMin}
            slackMin={itinerary.slackMin}
            blockCount={placeBlocks.length}
          />

          {/* Timeline Section (STORY-208, 209, 212) */}
          <section className="flex flex-col gap-0 mb-space-xl">
            <TimelineToggle
              blockCount={placeBlocks.length}
              isCollapsed={isCollapsed}
              onToggle={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Timeline Blocks mapping */}
            {itinerary.blocks.map((block) => {
              if (block.type === "PLACE") {
                return (
                  <DestinationCard
                    key={block.id}
                    block={block}
                    isCollapsed={isCollapsed}
                    onRemove={handleRemovePlace}
                    onOpenReplace={handleOpenReplace}
                  />
                );
              }

              if (block.type === "TRAVEL") {
                return (
                  <div key={block.id} className="relative pl-7 pb-2 timeline-item">
                    <div className="absolute left-[13px] top-0 bottom-0 w-[2px] bg-secondary-container"></div>
                    <TransitSegment
                      note={block.transitNote || block.title}
                      durationMin={block.durationMin}
                    />
                  </div>
                );
              }

              return null;
            })}

            {/* Final Safe Return Indicator */}
            {departureBlock && (
              <div className="relative pl-7 timeline-item">
                <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm text-label-md">
                  <span className="material-symbols-outlined text-[16px]">home</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-high text-on-surface text-label-md font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">traffic</span>
                  <span>{departureBlock.title}</span>
                </div>
              </div>
            )}
          </section>

          {/* Recommendation Rationale (STORY-210) */}
          <RationaleCard reasons={itinerary.reasons} />

          {/* Excluded Places Section (STORY-211) */}
          <ExcludedPlacesCard excludedPlaces={itinerary.excludedPlaces} />

          {/* Secondary Actions Row (STORY-308, STORY-310) */}
          <SecondaryActions
            onReduceStopClick={handleReduceOneStop}
            onReorderClick={handleOpenReorder}
          />

          {/* Primary Sticky Action Anchor */}
          <section className="sticky bottom-20 lg:bottom-6 z-40 pt-2 pb-1">
            <button
              type="button"
              onClick={handleStartItinerary}
              className="w-full h-[52px] rounded-full bg-primary text-on-primary text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(49,99,66,0.25)] active:scale-[0.98] transition-all hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[20px]">navigation</span>
              <span>이 코스로 하루 시작하기</span>
            </button>
          </section>
        </div>
      </main>

      {/* STORY-309: Replace Place Modal */}
      <ReplacePlaceModal
        isOpen={isReplaceOpen}
        targetPlace={targetPlaceToReplace}
        candidates={replaceCandidates}
        onClose={() => {
          setIsReplaceOpen(false);
          setTargetPlaceToReplace(null);
        }}
        onSelectCandidate={handleSelectReplaceCandidate}
      />

      {/* STORY-310: Reorder Modal */}
      <ReorderModal
        isOpen={isReorderOpen}
        places={currentPlaces}
        onClose={() => setIsReorderOpen(false)}
        onApplyOrder={handleApplyReorder}
      />

      {/* Real-time Course Navigation Modal (Kakao Map & Google Maps) */}
      <NavigationModal
        isOpen={isNavModalOpen}
        places={currentPlaces}
        onClose={() => setIsNavModalOpen(false)}
      />

      <BottomNavBar activeTab="itinerary" />
    </>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
            refresh
          </span>
          <p className="text-body-md text-on-surface-variant font-medium">
            우리 가족 일정 맞추는 중...
          </p>
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}
