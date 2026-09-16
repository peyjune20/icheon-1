import { generateItineraryUseCase } from "./application/generate-itinerary.usecase";
import { SeedPlaceRepository } from "./infrastructure/repositories/seed-place-repository";
import { ModifyItineraryUseCase } from "./application/modify-itinerary.usecase";
import { SeedMatrixTravelTimeAdapter } from "./adapters/travel-time/seed-travel-time.adapter";

async function verifyUserFeedback() {
  console.log("=== USER FEEDBACK REQUIREMENTS VERIFICATION ===");
  let passCount = 0;
  let failCount = 0;

  function assert(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  ✓ PASS: ${desc}`);
      passCount++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failCount++;
    }
  }

  // 1. 점심 식사 제외 (includeLunch: false) 검증
  console.log("\n[1] 점심 식사 제외 (includeLunch: false) 검증");
  const noLunchItinerary = await generateItineraryUseCase({
    originText: "서울 구로구 신도림",
    childAgeMonths: 17,
    includeLunch: false,
    styles: ["NATURE", "PARENT_REST"],
    departureTime: "10:00",
    desiredDepartureFromIcheon: "17:30",
  });
  const placesInNoLunch = noLunchItinerary.blocks
    .filter((b) => b.type === "PLACE")
    .map((b) => b.place);
  const hasRestaurant = placesInNoLunch.some((p) => p?.category === "RESTAURANT");
  assert(!hasRestaurant, "점심식사 제외 시 식당(미솥지음 등)이 일정표에 포함되지 않음");
  console.log("  - 생성된 장소들:", placesInNoLunch.map((p) => `${p?.name} (${p?.category})`).join(", "));

  // 2. 여행 스타일 변경 시 코스 변동 검증 (자연 산책 NATURE -> 모가의 숲/성호호수 포함)
  console.log("\n[2] 자연 산책 스타일(NATURE) 시 자연 명소 추천 검증");
  const natureItinerary = await generateItineraryUseCase({
    originText: "서울 강남구",
    childAgeMonths: 28,
    includeLunch: false,
    styles: ["NATURE", "PHOTO"],
    departureTime: "10:00",
    desiredDepartureFromIcheon: "17:30",
  });
  const naturePlaces = natureItinerary.blocks
    .filter((b) => b.type === "PLACE")
    .map((b) => b.place?.name);
  console.log("  - 자연 스타일 추천 코스:", naturePlaces.join(" -> "));
  assert(
    naturePlaces.some((name) => name?.includes("모가의 숲") || name?.includes("성호호수") || name?.includes("공원")),
    "자연 스타일 선택 시 모가의 숲/성호호수/생태공원 자연 명소가 적극 추천됨"
  );

  // 3. 체류 시간에 따른 장소 수 동적 조절 검증 (3시간 vs 6시간)
  console.log("\n[3] 여행 일정(체류 시간)에 따른 코스 장소 수 동적 조절");
  const shortTrip = await generateItineraryUseCase({
    originText: "서울 송파구",
    departureTime: "10:00", // 12:00 도착
    desiredDepartureFromIcheon: "14:30", // 2시간 30분 체류
    includeLunch: false,
    styles: ["NATURE"],
  });
  const shortPlacesCount = shortTrip.blocks.filter((b) => b.type === "PLACE").length;
  console.log(`  - 2.5시간 단기 체류 장소 수: ${shortPlacesCount}개`);
  assert(shortPlacesCount <= 3, "단기 체류 시 무리한 4개 장소 대신 2~3개 여유 장소 배정");

  // 4. 모가의 숲 & 성호호수 장소 데이터 및 갤러리 이미지 확인
  console.log("\n[4] 모가의 숲 & 성호호수 장소 데이터 및 갤러리 이미지 확인");
  const repo = new SeedPlaceRepository();
  const allPlaces = await repo.listCandidates();
  const moga = allPlaces.find((p) => p.id === "2");
  const seongho = allPlaces.find((p) => p.id === "7");

  assert(Boolean(moga && moga.imageFiles.length >= 4), `모가의 숲 이미지 등록 완료 (${moga?.imageFiles.length}장)`);
  assert(Boolean(seongho && seongho.imageFiles.length >= 3), `성호호수 이미지 등록 완료 (${seongho?.imageFiles.length}장)`);
  assert(Boolean(seongho?.imageDescriptions && seongho.imageDescriptions.length >= 3), "성호호수 사진별 실측 설명 캡션 등록 확인");
  assert(seongho?.strollerAccessible.value === "YES", "성호호수 평지 수변 덱로드 유모차 가능 판정 확인");

  // 5. 부모 휴식 중요도에 따른 카페 체류 시간 및 낮잠 시간대 연동 확인
  console.log("\n[5] 부모 휴식 중요도(HIGH 60분 vs LOW 25분) & 낮잠 시간대 검증");
  const highRestTrip = await generateItineraryUseCase({
    originText: "서울",
    parentRestPriority: "HIGH",
    styles: ["PARENT_REST"],
    includeLunch: true,
  });
  const cafeBlock = highRestTrip.blocks.find((b) => b.type === "PLACE" && b.place?.category === "CAFE");
  console.log(`  - HIGH 우선순위 카페 체류 시간: ${cafeBlock?.durationMin}분`);
  assert(cafeBlock?.durationMin === 60, "부모 휴식 HIGH 선택 시 카페 60분 보장");

  // 6. 장소 교체 모달 후보에 모가의 숲과 성호호수 진입 확인
  console.log("\n[6] 장소 교체 모달 후보에 모가의 숲과 성호호수 진입 확인");
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const modifyUseCase = new ModifyItineraryUseCase(repo, travelAdapter);
  const candidates = await modifyUseCase.getReplacementCandidates(shortTrip);
  const candidateNames = candidates.map((c) => c.name);
  console.log("  - 대체 가능 후보 목록:", candidateNames.join(", "));
  assert(candidateNames.some((n) => n.includes("성호호수")), "성호호수가 대체 후보 목록에 정상 진입");
  assert(candidateNames.some((n) => n.includes("모가의 숲")), "모가의 숲이 대체 후보 목록에 정상 진입");

  console.log(`\n=== VERIFICATION RESULT: PASS=${passCount}, FAIL=${failCount} ===`);
  if (failCount > 0) process.exit(1);
}

verifyUserFeedback().catch((err) => {
  console.error(err);
  process.exit(1);
});
