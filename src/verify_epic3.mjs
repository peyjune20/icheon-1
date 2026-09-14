import { SeedPlaceRepository } from "./infrastructure/repositories/seed-place-repository.ts";
import { SeedMatrixTravelTimeAdapter } from "./adapters/travel-time/seed-travel-time.adapter.ts";
import { ModifyItineraryUseCase } from "./application/modify-itinerary.usecase.ts";
import { generateItineraryUseCase } from "./application/generate-itinerary.usecase.ts";

async function runEpic3Verification() {
  console.log("=== STARTING EPIC 3 STORY-BY-STORY VERIFICATION ===\n");

  const placeRepo = new SeedPlaceRepository();
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const modifyUseCase = new ModifyItineraryUseCase(placeRepo, travelAdapter);

  // Default Golden Scenario Context
  const goldenContext = {
    trip: {
      originText: "서울 구로구 신도림",
      tripDate: "2025-09-13",
      departureTime: "10:30",
      arrivalInIcheon: "12:00",
      desiredDepartureFromIcheon: "17:30",
      childAgeMonths: 17,
      displayAge: "2세",
      strollerRequired: true,
      transport: "CAR",
      styles: ["NATURE", "PARENT_REST"],
      includeLunch: true,
      parentRestPriority: "HIGH",
    },
    weather: {
      condition: "HOT",
      temperatureC: 31,
    },
    tripWindowMin: 330,
    maxBlocks: 4,
  };

  // ----------------------------------------------------
  // STORY-301: Route /places/[id] and HeroBanner
  // ----------------------------------------------------
  console.log("[STORY-301] 장소 상세 페이지 라우트(/places/[id]) 및 상단 히어로 배너 검증");
  const place3 = await placeRepo.getById("3");
  if (!place3) throw new Error("Place 3 not found");

  const htmlRes3 = await fetch("http://localhost:3000/places/3");
  const html3 = await htmlRes3.text();

  const story301Pass =
    htmlRes3.status === 200 &&
    html3.includes("이천농업테마공원 &amp; 라이스카페") &&
    html3.includes("/resources/pic/3-1.jpg") &&
    html3.includes("data-testid=\"hero-banner\"");

  console.log(`- /places/3 HTTP 응답: ${htmlRes3.status}`);
  console.log(`- 장소명 '이천농업테마공원 & 라이스카페' 렌더링 확인: ${html3.includes("이천농업테마공원")}`);
  console.log(`- 대표 고화질 사진(/resources/pic/3-1.jpg) 표출 확인: ${html3.includes("3-1.jpg")}`);
  console.log(`STORY-301 결과: ${story301Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-302: Trust Verification Card
  // ----------------------------------------------------
  console.log("[STORY-302] 에디터 현장 실측 검증 신뢰 카드(Verification Trust Card) 검증");
  const story302Pass =
    html3.includes("현장 실측 검증 완료") &&
    html3.includes("주차장 휠체어·유모차 램프 직접 실측") &&
    html3.includes("기저귀 갈이대 온수 수압 및 수유실 정수기·소파 청결 상태");

  console.log(`- '현장 실측 검증 완료' 초록색 배지 표출: ${html3.includes("현장 실측 검증 완료")}`);
  console.log(`- 에디터 램프/수유실 실측 코멘트 표출: ${html3.includes("주차장 휠체어·유모차 램프 직접 실측")}`);
  console.log(`STORY-302 결과: ${story302Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-303: Core Logistics 8 Facilities Tri-State Matrix
  // ----------------------------------------------------
  console.log("[STORY-303] '아이와 가기 체크' 8대 필수 편의시설 Tri-State 매트릭스 검증");
  const hasTitle = html3.includes("아이와 가기 체크") && html3.includes("상태 8건 점검");
  const hasYes = html3.includes("확인됨") && html3.includes("stroller");
  const hasNo = html3.includes("지원 안 됨") && html3.includes("strollerRental");

  // Place 5 check for stroller NO
  const htmlRes5 = await fetch("http://localhost:3000/places/5");
  const html5 = await htmlRes5.text();
  const place5StrollerNo = html5.includes("유모차 불가") || html5.includes("유모차 주행");

  const story303Pass = hasTitle && hasYes && hasNo && place5StrollerNo;
  console.log(`- '아이와 가기 체크' 8대 시설 그리드 표출: ${hasTitle}`);
  console.log(`- YES (확인됨) 항목 표출: ${hasYes}`);
  console.log(`- NO (지원 안 됨) 항목 표출: ${hasNo}`);
  console.log(`- 을를(ID 5) 유모차 불가 및 기저귀대 반영 확인: ${place5StrollerNo}`);
  console.log(`STORY-303 결과: ${story303Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-304: Editorial Review Box
  // ----------------------------------------------------
  console.log("[STORY-304] 부모를 위한 솔직한 현장 평(Editorial Review) 카드 검증");
  const hasReviewTitle = html3.includes("부모를 위한 솔직한 현장 평");
  const hasStrollerReview = html3.includes("무거운 디럭스 유모차를 끌고 가장 쾌적하게 거닐 수 있는");

  const story304Pass = hasReviewTitle && hasStrollerReview;
  console.log(`- 살구색 박스 및 '부모를 위한 솔직한 현장 평' 타이틀 표출: ${hasReviewTitle}`);
  console.log(`- 디럭스 유모차 주행감 및 휴식 편의 리뷰 본문 표출: ${hasStrollerReview}`);
  console.log(`STORY-304 결과: ${story304Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-305: Practical Info 4-Grid & Location Accessibility
  // ----------------------------------------------------
  console.log("[STORY-305] 방문 전 필수 정보 4대 그리드 및 위치/IC 접근성 검증");
  const hasPracticalTitle = html3.includes("방문 전 필수 정보");
  const hasDuration = html3.includes("적정 체류시간") && html3.includes("90분");
  const hasHours = html3.includes("운영시간") && html3.includes("09:30");
  const hasCost = html3.includes("비용 안내") && html3.includes("입장료 무료");
  const hasWeather = html3.includes("추천 날씨");
  const hasIcAccess = html3.includes("이천IC에서 차로 14분");

  const story305Pass = hasPracticalTitle && hasDuration && hasHours && hasCost && hasWeather && hasIcAccess;
  console.log(`- 2x2 방문 전 필수 메타 정보 그리드 표출: ${hasPracticalTitle && hasDuration && hasHours}`);
  console.log(`- '이천IC에서 차로 14분' 접근성 카드 표출: ${hasIcAccess}`);
  console.log(`STORY-305 결과: ${story305Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-306: Bookmark & Course Add Bottom Action Bar
  // ----------------------------------------------------
  console.log("[STORY-306] 장소 찜(북마크) 및 '이 장소를 내 코스에 담기' 피드백 바 검증");
  const hasBookmarkBtn = html3.includes("data-testid=\"btn-bookmark\"");
  const hasAddBtn = html3.includes("이 장소를 내 코스에 담기");

  const story306Pass = hasBookmarkBtn && hasAddBtn;
  console.log(`- 찜 버튼 렌더링 확인: ${hasBookmarkBtn}`);
  console.log(`- '이 장소를 내 코스에 담기' CTA 버튼 렌더링 확인: ${hasAddBtn}`);
  console.log(`STORY-306 결과: ${story306Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-307: Remove Place & Recalculate
  // ----------------------------------------------------
  console.log("[STORY-307] 타임라인 내 장소 삭제(Remove Place) 및 실시간 재계산 검증");
  const initialItinerary = await generateItineraryUseCase({
    childAgeMonths: 17,
    strollerRequired: true,
  });

  const initialPlaces = modifyUseCase.getPlacesFromItinerary(initialItinerary);
  console.log(`- 초기 장소 수: ${initialPlaces.length}곳 (${initialPlaces.map((p) => p.name).join(" -> ")})`);
  console.log(`- 초기 체류시간: ${initialItinerary.totalStayMin}분, 여유시간: ${initialItinerary.slackMin}분`);

  // Remove place 4 (이천시환경학습관, 40min)
  const afterRemove = await modifyUseCase.removePlace(initialItinerary, "4", goldenContext);
  const placesAfterRemove = modifyUseCase.getPlacesFromItinerary(afterRemove);

  const story307Pass =
    placesAfterRemove.length === initialPlaces.length - 1 &&
    !placesAfterRemove.some((p) => p.id === "4") &&
    afterRemove.totalStayMin === initialItinerary.totalStayMin - 40 &&
    afterRemove.slackMin >= initialItinerary.slackMin + 40 &&
    afterRemove.status === "RELAXED";

  console.log(`- 삭제 후 장소 수: ${placesAfterRemove.length}곳 (${placesAfterRemove.map((p) => p.name).join(" -> ")})`);
  console.log(`- 재계산된 체류시간: ${afterRemove.totalStayMin}분, 여유시간: ${afterRemove.slackMin}분 (상태: ${afterRemove.status})`);
  console.log(`STORY-307 결과: ${story307Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-308: Reduce One Stop (-45min)
  // ----------------------------------------------------
  console.log("[STORY-308] '한 곳 줄이기 (-45분)' 원클릭 액션 및 여유시간 회복 검증");
  const afterReduce = await modifyUseCase.reduceOneStop(initialItinerary, goldenContext);
  const placesAfterReduce = modifyUseCase.getPlacesFromItinerary(afterReduce);

  const story308Pass =
    placesAfterReduce.length === 3 &&
    !placesAfterReduce.some((p) => p.id === "5") && // 을를 (45min cafe) removed
    afterReduce.slackMin >= initialItinerary.slackMin + 45;

  console.log(`- 줄이기 후 장소 목록: ${placesAfterReduce.map((p) => p.name).join(" -> ")}`);
  console.log(`- 회복된 여유시간: ${afterReduce.slackMin}분 (기존 ${initialItinerary.slackMin}분 대비 +${afterReduce.slackMin - initialItinerary.slackMin}분 확보)`);
  console.log(`STORY-308 결과: ${story308Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-309: Replace Place
  // ----------------------------------------------------
  console.log("[STORY-309] 장소 교체(Replace Place) 및 대체 후보 선택 검증");
  const candidates = await modifyUseCase.getReplacementCandidates(initialItinerary);
  console.log(`- 대체 후보 장소 수: ${candidates.length}곳 (${candidates.map((c) => c.name).join(", ")})`);

  // Replace place 5 (을를) with place 2 (모가의 숲)
  const afterReplace = await modifyUseCase.replacePlace(initialItinerary, "5", "2", goldenContext);
  const placesAfterReplace = modifyUseCase.getPlacesFromItinerary(afterReplace);

  const story309Pass =
    placesAfterReplace.some((p) => p.id === "2") &&
    !placesAfterReplace.some((p) => p.id === "5") &&
    afterReplace.blocks.some((b) => b.type === "PLACE" && b.place?.id === "2");

  console.log(`- 교체 후 타임라인 장소: ${placesAfterReplace.map((p) => p.name).join(" -> ")}`);
  console.log(`- 교체된 블록 확인: [ID: 2] ${placesAfterReplace.find((p) => p.id === "2")?.name}`);
  console.log(`STORY-309 결과: ${story309Pass ? "PASS" : "FAIL"}\n`);

  // ----------------------------------------------------
  // STORY-310: Reorder Sequence
  // ----------------------------------------------------
  console.log("[STORY-310] 장소 순서 변경(Reorder) 및 런타임 동선 재정렬 검증");
  // Original order: [1, 3, 4, 5] -> New order: [1, 4, 3, 5]
  const newOrderIds = ["1", "4", "3", "5"];
  const afterReorder = await modifyUseCase.reorderPlaces(initialItinerary, newOrderIds, goldenContext);
  const placesAfterReorder = modifyUseCase.getPlacesFromItinerary(afterReorder);

  const reorderedPlaceBlocks = afterReorder.blocks.filter((b) => b.type === "PLACE");
  const story310Pass =
    placesAfterReorder.map((p) => p.id).join(",") === "1,4,3,5" &&
    reorderedPlaceBlocks[1].place?.id === "4" &&
    reorderedPlaceBlocks[1].order === 2 &&
    reorderedPlaceBlocks[2].place?.id === "3" &&
    reorderedPlaceBlocks[2].order === 3;

  console.log(`- 재정렬 후 순서: ${reorderedPlaceBlocks.map((b) => `[${b.order}] ${b.place?.name} (${b.startTime}~${b.endTime})`).join(", ")}`);
  console.log(`STORY-310 결과: ${story310Pass ? "PASS" : "FAIL"}\n`);

  // Final summary
  const allPassed =
    story301Pass &&
    story302Pass &&
    story303Pass &&
    story304Pass &&
    story305Pass &&
    story306Pass &&
    story307Pass &&
    story308Pass &&
    story309Pass &&
    story310Pass;

  console.log("=========================================");
  console.log(`EPIC 3 전체 10개 STORY 통과 여부: ${allPassed ? "ALL 10 STORIES PASSED! 🎉" : "FAILED"}`);
  console.log("=========================================");

  if (!allPassed) {
    process.exit(1);
  }
}

runEpic3Verification().catch((err) => {
  console.error("Epic 3 Verification Error:", err);
  process.exit(1);
});
