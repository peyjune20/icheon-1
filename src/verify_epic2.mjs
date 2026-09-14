import { SeedPlaceRepository } from "../src/infrastructure/repositories/seed-place-repository.js";
import { SeedMatrixTravelTimeAdapter } from "../src/adapters/travel-time/seed-travel-time.adapter.js";
import { evaluateHardConstraints } from "../src/domain/recommendation/hard-constraints.js";
import { calculatePlaceScore } from "../src/domain/recommendation/place-scorer.js";
import { buildTimelineBlocks } from "../src/domain/scheduling/timeline-scheduler.js";
import { calculateBuffers } from "../src/domain/scheduling/buffer-calculator.js";
import { evaluateDensity } from "../src/domain/scheduling/density-evaluator.js";
import { RuleBasedRecommendationEngine } from "../src/domain/recommendation/recommendation-engine.js";

async function verifyEpic2() {
  console.log("=== STARTING EPIC 2 VERIFICATION ===");

  const repo = new SeedPlaceRepository();
  const places = await repo.listCandidates();

  // STORY-201 검증
  console.log("\n[STORY-201] 7개 Seed 장소 및 이미지 경로 검증:");
  console.log(`- 장소 총 개수: ${places.length}개 (기대: 7개)`);
  places.forEach((p) => {
    console.log(`  - [ID: ${p.id}] ${p.name} | 사진 수: ${p.imageFiles.length} | 대표 썸네일: ${p.thumbnailImage}`);
  });
  const story201Pass = places.length === 7 && places.slice(0, 5).every((p) => p.imageFiles.length >= 4);
  console.log(`STORY-201 통과 여부: ${story201Pass ? "PASS" : "FAIL"}`);

  // STORY-202 검증
  console.log("\n[STORY-202] TravelTimeAdapter 이동시간 검증:");
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const t1_3 = await travelAdapter.getTravelTime("1", "3"); // 미솥지음 -> 공원
  const t3_4 = await travelAdapter.getTravelTime("3", "4"); // 공원 -> 학습관
  const t4_5 = await travelAdapter.getTravelTime("4", "5"); // 학습관 -> 을를
  console.log(`  - 1 -> 3 (미솥지음 -> 공원): ${t1_3.durationMin}분 (기대: 20분)`);
  console.log(`  - 3 -> 4 (공원 -> 학습관): ${t3_4.durationMin}분 (기대: 30분)`);
  console.log(`  - 4 -> 5 (학습관 -> 을를): ${t4_5.durationMin}분 (기대: 15분)`);
  const story202Pass = t1_3.durationMin === 20 && t3_4.durationMin === 30 && t4_5.durationMin === 15;
  console.log(`STORY-202 통과 여부: ${story202Pass ? "PASS" : "FAIL"}`);

  // Context 설정 (김민지 가족 시나리오)
  const context = {
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
    tripWindowMin: 330,
    weather: { condition: "HOT", temperatureC: 31 },
    maxBlocks: 4,
  };

  // STORY-203 검증
  console.log("\n[STORY-203] Hard Constraints 필터링 검증:");
  const moga = places.find((p) => p.id === "2"); // 모가의 숲 (폭염 야외)
  const misot = places.find((p) => p.id === "1"); // 미솥지음 (실내)
  const mogaFilter = evaluateHardConstraints(moga, context);
  const misotFilter = evaluateHardConstraints(misot, context);
  console.log(`  - 모가의 숲 (폭염 HOT_AVOID): eligible = ${mogaFilter.eligible}, 사유 = ${mogaFilter.reason}`);
  console.log(`  - 미솥지음: eligible = ${misotFilter.eligible}`);
  const story203Pass = !mogaFilter.eligible && misotFilter.eligible;
  console.log(`STORY-203 통과 여부: ${story203Pass ? "PASS" : "FAIL"}`);

  // STORY-204 검증
  console.log("\n[STORY-204] Soft Scoring (100점 만점) 검증:");
  const misotScore = calculatePlaceScore(misot, context);
  const park = places.find((p) => p.id === "3");
  const parkScore = calculatePlaceScore(park, context);
  console.log(`  - 미솥지음 총점: ${misotScore.totalScore}점 / Breakdown:`, misotScore.breakdown);
  console.log(`  - 이천농업생태공원 총점: ${parkScore.totalScore}점 / Breakdown:`, parkScore.breakdown);
  const story204Pass = misotScore.totalScore > 70 && parkScore.totalScore > 70;
  console.log(`STORY-204 통과 여부: ${story204Pass ? "PASS" : "FAIL"}`);

  // STORY-205 & 206 & 전체 추천 엔진 검증
  console.log("\n[STORY-205 & 206] 타임라인 스케줄링 및 과밀도 검증:");
  const engine = new RuleBasedRecommendationEngine(repo, travelAdapter);
  const itinerary = await engine.generate(context);
  console.log(`  - 추천 생성 블록 수: ${itinerary.blocks.length}개`);
  console.log(`  - 총 체류시간: ${itinerary.totalStayMin}분, 순수 이동: ${itinerary.totalTravelMin}분, 버퍼: ${itinerary.bufferMin}분`);
  console.log(`  - 여유시간(Slack Time): ${itinerary.slackMin}분, 상태: ${itinerary.status}`);
  console.log(`  - 제외 장소:`, itinerary.excludedPlaces.map((e) => `${e.place.name}(${e.tag})`));

  const placeBlocks = itinerary.blocks.filter((b) => b.type === "PLACE");
  console.log("  - 타임라인 순서:");
  placeBlocks.forEach((b) => console.log(`    [${b.order}] ${b.startTime}~${b.endTime} ${b.title} (${b.durationMin}분)`));

  const story205Pass = placeBlocks.length === 4 && placeBlocks[0].title === "미솥지음";
  const story206Pass = itinerary.slackMin >= 40 && itinerary.status === "RELAXED";
  console.log(`STORY-205 통과 여부: ${story205Pass ? "PASS" : "FAIL"}`);
  console.log(`STORY-206 통과 여부: ${story206Pass ? "PASS" : "FAIL"}`);

  console.log("\n=== ALL STORY VERIFICATIONS COMPLETE ===");
}

verifyEpic2().catch(console.error);
