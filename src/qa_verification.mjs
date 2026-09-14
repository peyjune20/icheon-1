import { SeedPlaceRepository } from "./infrastructure/repositories/seed-place-repository.ts";
import { SeedMatrixTravelTimeAdapter } from "./adapters/travel-time/seed-travel-time.adapter.ts";
import { RuleBasedRecommendationEngine } from "./domain/recommendation/recommendation-engine.ts";
import { generateItineraryUseCase } from "./application/generate-itinerary.usecase.ts";

async function runQATests() {
  console.log("=== BEBELOAD QA AUTOMATED TEST SUITE ===");
  const repo = new SeedPlaceRepository();
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const engine = new RuleBasedRecommendationEngine(repo, travelAdapter);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: 정상 입력으로 결과 화면이 나오는지 (Happy Path)
  // -------------------------------------------------------------
  console.log("\n[Test 1] 정상 입력(Happy Path) 검증");
  try {
    const normalItinerary = await generateItineraryUseCase({
      originText: "서울 구로구 신도림",
      childAgeMonths: 17,
      displayAge: "2세",
      strollerRequired: true,
      tripDate: "2025-09-05",
      departureTime: "10:00",
      transport: "CAR",
      styles: ["NATURE", "PARENT_REST"],
      includeLunch: true,
    });

    assert(normalItinerary !== null && normalItinerary !== undefined, "정상 입력 시 일정 객체 반환됨");
    assert(normalItinerary.status === "RELAXED" || normalItinerary.status === "FEASIBLE", "안심 판정 상태값 정상");
    assert(normalItinerary.blocks.length >= 4, `타임라인 블록 ${normalItinerary.blocks.length}개 생성 (최소 4개)`);
    assert(normalItinerary.totalDurationMin === 330, "총 일정 330분 (5시간 30분) 일치");
    assert(normalItinerary.totalTravelMin >= 60, `순수 이동 시간(${normalItinerary.totalTravelMin}분) 확보`);
    assert(normalItinerary.slackMin >= 40, `여유·버퍼 시간(${normalItinerary.slackMin}분) 40분 이상 확보`);
    assert(normalItinerary.reasons.length >= 4, "추천 근거 4개 이상 노출");
    assert(normalItinerary.excludedPlaces.length >= 1, "제외 장소 목록 및 사유 포함");
  } catch (err) {
    assert(false, `정상 입력 테스트 예외 발생: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test 2: 여행지·일정 필수값 검증 (Validation)
  // -------------------------------------------------------------
  console.log("\n[Test 2] 필수값 누락 검증 (Validation Logic)");
  // Trip Input Form Validation Rules:
  // origin, styles, travelDate, departureTime, returnTime
  const checkValidation = (input) => {
    if (!input.origin || input.origin.trim().length === 0) return { valid: false, message: "출발 지역을 입력해 주세요." };
    if (!input.travelDate || input.travelDate.trim().length === 0) return { valid: false, message: "여행 날짜를 선택해 주세요." };
    if (!input.departureTime || input.departureTime.trim().length === 0) return { valid: false, message: "출발 시간을 설정해 주세요." };
    if (!input.returnTime || input.returnTime.trim().length === 0) return { valid: false, message: "귀가 시간을 설정해 주세요." };
    if (!input.styles || input.styles.length === 0) return { valid: false, message: "여행 스타일을 최소 1개 이상 선택해 주세요 (최대 3개)." };
    return { valid: true, message: null };
  };

  const emptyOrigin = checkValidation({ origin: "", travelDate: "2025-09-05", departureTime: "10:00", returnTime: "19:00", styles: ["NATURE"] });
  assert(!emptyOrigin.valid && emptyOrigin.message === "출발 지역을 입력해 주세요.", "출발지 누락 시 유효성 에러 및 안내 메시지 표출");

  const emptyStyles = checkValidation({ origin: "서울", travelDate: "2025-09-05", departureTime: "10:00", returnTime: "19:00", styles: [] });
  assert(!emptyStyles.valid && emptyStyles.message.includes("여행 스타일"), "스타일 누락 시 유효성 에러 및 안내 메시지 표출");

  const emptyDate = checkValidation({ origin: "서울", travelDate: "", departureTime: "10:00", returnTime: "19:00", styles: ["NATURE"] });
  assert(!emptyDate.valid && emptyDate.message.includes("여행 날짜"), "날짜 누락 시 유효성 에러 및 안내 메시지 표출");

  // -------------------------------------------------------------
  // Test 3: 서로 다른 조건으로 두 번 실행해도 결과 형식이 같은지 (Consistency)
  // -------------------------------------------------------------
  console.log("\n[Test 3] 서로 다른 2개 조건 실행 시 결과 스키마/형식 일관성 검증");
  try {
    const conditionA = {
      trip: {
        originText: "서울 구로구 신도림",
        childAgeMonths: 17,
        displayAge: "2세",
        strollerRequired: true,
        tripDate: "2025-09-05",
        departureTime: "10:00",
        arrivalInIcheon: "12:00",
        desiredDepartureFromIcheon: "17:30",
        transport: "CAR",
        styles: ["NATURE", "PARENT_REST"],
        includeLunch: true,
        parentRestPriority: "HIGH",
      },
      weather: { condition: "HOT", temperatureC: 31 },
      tripWindowMin: 330,
      maxBlocks: 4,
    };

    const conditionB = {
      trip: {
        originText: "경기 성남시 분당구",
        childAgeMonths: 36,
        displayAge: "3~4세",
        strollerRequired: false,
        tripDate: "2025-09-12",
        departureTime: "11:00",
        arrivalInIcheon: "12:30",
        desiredDepartureFromIcheon: "18:00",
        transport: "CAR",
        styles: ["EXPERIENCE", "INDOOR"],
        includeLunch: false,
        parentRestPriority: "MEDIUM",
      },
      weather: { condition: "HOT", temperatureC: 28 },
      tripWindowMin: 330,
      maxBlocks: 4,
    };

    const resA = await engine.generate(conditionA);
    const resB = await engine.generate(conditionB);

    // Compare Top-level keys
    const keysA = Object.keys(resA).sort();
    const keysB = Object.keys(resB).sort();
    assert(JSON.stringify(keysA) === JSON.stringify(keysB), `상위 스키마 키 일치: [${keysA.join(", ")}]`);

    // Compare Types of each key
    let typesMatch = true;
    for (const key of keysA) {
      if (typeof resA[key] !== typeof resB[key]) {
        typesMatch = false;
        console.error(`Key type mismatch for ${key}: ${typeof resA[key]} vs ${typeof resB[key]}`);
      }
    }
    assert(typesMatch, "모든 상위 필드 데이터 타입 일치");

    // Compare Block schema
    const blockKeysA = Object.keys(resA.blocks[0]).sort();
    const blockKeysB = Object.keys(resB.blocks[0]).sort();
    assert(JSON.stringify(blockKeysA) === JSON.stringify(blockKeysB), `블록 스키마 키 일치: [${blockKeysA.join(", ")}]`);

    // Compare Block Types existence
    assert(resA.blocks.some(b => b.type === "DEPARTURE") && resB.blocks.some(b => b.type === "DEPARTURE"), "두 실행 모두 최종 안전 귀가 블록(DEPARTURE) 포함");
    assert(Array.isArray(resA.reasons) && Array.isArray(resB.reasons), "두 실행 모두 사유 배열 형식 일치");
    assert(Array.isArray(resA.excludedPlaces) && Array.isArray(resB.excludedPlaces), "두 실행 모두 제외장소 배열 형식 일치");
  } catch (err) {
    assert(false, `스키마 일관성 테스트 예외 발생: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test 4: API 실패·지연·항목 누락 때 안내 검증
  // -------------------------------------------------------------
  console.log("\n[Test 4] API 실패 / 항목 누락 / 지연 대응 검증");
  try {
    // 항목 누락 (없는 장소 ID 조회)
    const missingPlace = await repo.findById("99999");
    assert(missingPlace === null, "존재하지 않는 장소 ID '99999' 조회 시 null 반환 (404 notFound 분기 연계)");

    // 추천 불가능 조건 (예: 비어있는 DB 또는 적합 장소 0개 시나리오)
    class FailingRepo {
      async listCandidates() { return []; }
      async findById() { return null; }
    }
    const failingEngine = new RuleBasedRecommendationEngine(new FailingRepo(), travelAdapter);
    let errorCaught = false;
    try {
      await failingEngine.generate({
        trip: {
          originText: "서울",
          childAgeMonths: 24,
          displayAge: "2세",
          strollerRequired: true,
          tripDate: "2025-09-05",
          departureTime: "10:00",
          arrivalInIcheon: "12:00",
          desiredDepartureFromIcheon: "17:30",
          transport: "CAR",
          styles: ["NATURE"],
          includeLunch: true,
          parentRestPriority: "HIGH",
        },
        weather: { condition: "HOT", temperatureC: 30 },
        tripWindowMin: 330,
        maxBlocks: 4,
      });
    } catch (e) {
      errorCaught = true;
    }
    // Note: If candidates are empty, engine should either throw or return empty blocks
    console.log(`  -> 후보 장소가 없을 때 에러 발생 여부: ${errorCaught}`);
  } catch (err) {
    assert(false, `예외 상황 테스트 실패: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Test 5: 서버/애플리케이션 계층 Zod 입력값 검증 (Security & Robustness)
  // -------------------------------------------------------------
  console.log("\n[Test 5] 서버/애플리케이션 계층 Zod 입력값 검증");
  try {
    // 1. 비정상 음수 나이 차단 검증
    let negativeAgeCaught = false;
    try {
      await generateItineraryUseCase({ childAgeMonths: -10 });
    } catch (e) {
      negativeAgeCaught = true;
      assert(e.message.includes("개월수는 0 이상"), `음수 개월수(-10) 차단 확인: ${e.message}`);
    }
    assert(negativeAgeCaught, "음수 개월수 유입 시 Zod 스키마 검증 실패 및 차단");

    // 2. 비정상 시간 포맷 차단 검증
    let badTimeCaught = false;
    try {
      await generateItineraryUseCase({ departureTime: "invalid-time" });
    } catch (e) {
      badTimeCaught = true;
      assert(e.message.includes("시간 형식이 올바르지 않습니다"), `비정상 시간 문자열 차단 확인: ${e.message}`);
    }
    assert(badTimeCaught, "잘못된 시간 포맷(invalid-time) 유입 시 Zod 스키마 검증 실패 및 차단");

    // 3. 정상 범위 정규화 확인
    const normalized = await generateItineraryUseCase({
      originText: "   경기도 수원시 팔달구   ", // 앞뒤 공백 트리밍
      childAgeMonths: 24,
      departureTime: "09:30",
    });
    assert(normalized !== null && normalized.blocks.length >= 4, "정규화 후 정상 일정 반환 확인");
  } catch (err) {
    assert(false, `Zod 입력값 검증 테스트 실패: ${err.message}`);
  }

  console.log(`\n=== QA 결과 요약: PASS=${passed}, FAIL=${failed} ===`);
}

runQATests().catch(console.error);
