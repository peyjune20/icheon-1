# 기술 요구사항 정의서 (TRD) — 이천베베로드 (Icheon Bebe Road)

> **Document Type**: Technical Requirements Document (TRD)  
> **Product**: 이천베베로드 (Icheon Bebe Road)  
> **Version**: v1.0  
> **Scope**: MVP (Minimum Viable Product)  
> **Status**: Implementation Baseline  
> **Source of Truth Hierarchy**: PRD (v0.2) → FRD (v1.0) → TRD (v1.0) → Design Spec / 시안 코드  
> **Primary Platform**: Mobile-first Responsive Web  
> **Author Role**: 소프트웨어 아키텍트 (Software Architect)

---

# 0. 목적 및 개요 (Purpose & Overview)

본 문서는 **이천베베로드 MVP**의 소프트웨어 아키텍처, 데이터 모델, 컴포넌트 인터페이스, 추천 및 스케줄링 알고리즘, 미디어 자산 파이프라인, 테스트 및 배포 기준을 확정하기 위한 기술 명세서이다.

### 기술 설계의 핵심 목표
1. **결정론적 추천 엔진 (Deterministic Recommendation Engine)**: 동일한 구조적 입력에 대해 100% 동일하고 재현 가능한 결과를 생성하여 단위/통합 테스트 용이성 보장.
2. **엄격한 관심사 분리 (Separation of Concerns)**: UI(프레젠테이션) 레이어와 비즈니스/추천 도메인 로직을 완전 분리.
3. **Repository 및 Adapter 추상화**: 7개 Seed Data에 결합되지 않고 DB, CSV, 공공데이터 API, 상용 지도/날씨 API로 무중단 확장 가능한 DIP(Dependency Inversion Principle) 준수.
4. **미디어 자산 파이프라인 명세**: `/resources/pic`의 현장 사진 23종(1: 미솥지음, 2: 모가의 숲, 3: 이천농업생태공원, 4: 이천시환경학습관, 5: 을를)의 서빙 및 최적화 규격 정의.
5. **AI 격리 및 안전 가드레일**: 규칙 기반(Rule-based) 코어를 Source of Truth로 유지하며, AI/LLM 장애 시에도 P0 핵심 서비스가 무중단 작동하는 하이브리드 아키텍처 수립.

---

# 1. 핵심 기술 원칙 (Core Technical Principles)

```text
1. Rule Engine = Recommendation Source of Truth (추천 엔진의 단일 진실 공급원)
2. UI ≠ Business Logic (React 컴포넌트 내 추천 점수/일정 계산 코드 삽입 엄격 금지)
3. Place Data ≠ Recommendation Logic (장소명 하드코딩 if (place === '미솥지음') 절대 금지)
4. External Systems = Adapter Pattern (지도, 날씨, LLM은 인터페이스 뒤로 격리)
5. UNKNOWN ≠ YES (미확인 데이터를 긍정 추정하는 행위 차단, Tri-State 엄격 준수)
6. Same Structured Input → Deterministic Core Result (테스트 자동화 보장)
7. AI must never override verified structured data (AI가 실측 데이터 덮어쓰기 금지)
8. Every user input must map to actual logic (추천 결과에 영향 없는 UI 더미 필드 금지)
9. Zero Magic Numbers (모든 가중치, 체류시간, 버퍼 임계치는 Config 파일로 중앙화)
10. MVP architecture should remain replaceable, not over-engineered (오버엔지니어링 지양)
```

---

# 2. 기준 문서 우선순위 (Source of Truth Priority)

구현 중 요구사항 충돌이나 명세 불일치 발생 시 다음 우선순위를 따른다:
```text
1. PRD (docs/PRD_bebeload.md) — 제품 철학 및 핵심 정책
2. FRD (docs/FRD_bebeload.md) — 기능 동작, 화면 인터랙션 및 이미지 매핑 규격
3. TRD (docs/TRD_bebeload.md) — 아키텍처, 인터페이스, 데이터 스키마 및 알고리즘 (본 문서)
4. DESIGN_SPEC (`design/icheon_bebe_road/DESIGN.md` 및 `design/` HTML 시안)
5. 기존 코드베이스 및 리소스 자산 (`/resources/pic`)
6. 구현 편의성 (임의 변경 금지)
```

---

# 3. 기술 스택 (Technology Stack Baseline)

본 프로젝트는 모바일 퍼스트 반응형 웹으로 구축하며 다음 기술을 표준으로 정의한다:

| 분류 | 기술 스택 | 선정 이유 및 가이드라인 |
|---|---|---|
| **Framework** | **Next.js (App Router)** | SSR/SSG 지원을 통한 빠른 초기 로딩(LCP $\le$ 2.5s) 및 SEO 최적화, 정적 자산 라우팅 지원 |
| **Language** | **TypeScript (Strict Mode)** | 도메인 엔티티의 불변성 및 Tri-State 타입 안전성 보장 (`strict: true`) |
| **Styling** | **Tailwind CSS + Vanilla CSS Variables** | 디자인 시스템 토큰(Sage Green `#4A7C59`, Oatmeal `#FAF9F5` 등) 매핑 및 44px 터치 타깃 구현 |
| **Validation** | **Zod** | TripInput 스키마 런타임 검증 및 정적 TypeScript 타입 추론 연동 |
| **State Management** | **React State + URL Query Params** | 코스 공유 및 뒤로가기를 위한 URL 상태 동기화 (복잡도 증가 시 Zustand 선별 도입) |
| **Testing** | **Vitest + Testing Library** | 추천 엔진의 단위 테스트, 골든 시나리오 회귀 테스트, 컴포넌트 렌더링 검증 |
| **E2E Testing** | **Playwright** | 모바일 뷰포트(390px) 기준 홈 $\rightarrow$ 입력 $\rightarrow$ 타임라인 $\rightarrow$ 상세 E2E 흐름 검증 |
| **Media Pipeline** | **Next.js Image (`next/image`)** | `/resources/pic` 현장 사진 WebP 자동 변환, Lazy Loading, 레이아웃 쉬프트(CLS) 방지 |

---

# 4. 시스템 아키텍처 다이어그램 (System Architecture)

```mermaid
flowchart TD
    subgraph Presentation_Layer [Presentation Layer (Client & Server Components)]
        HOME[Home Page / Feature]
        INPUT[Trip Input Form Feature]
        RESULT[Recommendation Result / Timeline Feature]
        DETAIL[Place Detail Feature]
        SHARED_UI[Design System Atoms / Molecules]
    end

    subgraph Application_Layer [Application Layer (Use Cases & Orchestrators)]
        UC_GEN[GenerateItineraryUseCase]
        UC_EDIT[ModifyItineraryUseCase (Replace/Remove/Reorder)]
        UC_RECALC[RecalculateScheduleUseCase]
        UC_DETAIL[GetPlaceDetailUseCase]
    end

    subgraph Domain_Layer [Domain Layer (Pure TypeScript Core)]
        subgraph Recommendation_Engine [Recommendation Core]
            CTX_NORM[Context Normalizer]
            HARD_FILTER[Hard Constraint Filter]
            PLACE_SCORER[Place Scorer (100pt Engine)]
            ROUTE_GEN[Route Candidate Generator]
            ROUTE_SCORER[Route Evaluator]
            EXPLAINER[Explanation & Alternative Builder]
        end
        subgraph Scheduling_Engine [Scheduling Core]
            TIME_WIN[Trip Window Evaluator]
            SCHEDULER[Timeline Block Scheduler]
            BUFFER_CALC[Toddler & Parking Buffer Calculator]
            DENSITY[Slack Time & Density Evaluator]
        end
        DOMAIN_MODELS[Domain Entities & Value Objects]
        DOMAIN_CONFIG[Recommendation Config (Constants)]
    end

    subgraph Infrastructure_Layer [Infrastructure & Adapter Layer]
        REPO_IF[<<interface>> PlaceRepository]
        SEED_REPO[SeedPlaceRepository]
        TRAVEL_IF[<<interface>> TravelTimeAdapter]
        SEED_TRAVEL[SeedMatrixTravelTimeAdapter]
        WEATHER_IF[<<interface>> WeatherAdapter]
        MOCK_WEATHER[MockWeatherAdapter]
        LLM_IF[<<interface>> LLMAdapter (Optional)]
    end

    subgraph Static_Assets [Local File System Assets]
        PICS[(/resources/pic/*.jpg)]
    end

    %% Presentation to Application
    HOME --> UC_GEN
    INPUT --> UC_GEN
    RESULT --> UC_EDIT
    RESULT --> UC_RECALC
    DETAIL --> UC_DETAIL

    %% Application to Domain
    UC_GEN --> CTX_NORM
    CTX_NORM --> HARD_FILTER
    HARD_FILTER --> PLACE_SCORER
    PLACE_SCORER --> ROUTE_GEN
    ROUTE_GEN --> SCHEDULER
    SCHEDULER --> BUFFER_CALC
    BUFFER_CALC --> DENSITY
    DENSITY --> ROUTE_SCORER
    ROUTE_SCORER --> EXPLAINER

    UC_EDIT --> SCHEDULER
    UC_RECALC --> SCHEDULER

    %% Domain to Infrastructure
    HARD_FILTER --> REPO_IF
    PLACE_SCORER --> REPO_IF
    SCHEDULER --> TRAVEL_IF
    PLACE_SCORER --> WEATHER_IF

    %% Implementations
    REPO_IF --> SEED_REPO
    TRAVEL_IF --> SEED_TRAVEL
    WEATHER_IF --> MOCK_WEATHER

    SEED_REPO -. Maps image paths .-> PICS
    DETAIL -. Renders via next/image .-> PICS

    %% LLM Guardrail
    UC_GEN -. Optional text summary .-> LLM_IF
    LLM_IF -. Read-only .-> DOMAIN_MODELS
```

---

# 5. 계층별 책임 및 격리 규칙 (Layer Responsibilities & Boundaries)

| 계층 (Layer) | 역할 및 책임 | 금지 사항 (Strict Prohibitions) |
|---|---|---|
| **Presentation** | 사용자 입력 접수, 폼 렌더링, 라우팅, UI 상태(토글, 탭), 에러/로딩 표시 | 추천 점수 계산, Hard Filter 로직 구현, 날씨 패널티 부여 |
| **Application** | 사용자 액션(생성, 수정, 삭제)을 받아 도메인 파이프라인 조율, DTO 변환 | 직접 데이터베이스 접근, 특정 장소 알고리즘 로직 소유 |
| **Domain** | 순수 함수/엔티티 기반의 추천, 채점, 시간 계산, 버퍼 산정, 과밀 경고 | 외부 API(HTTP fetch) 직접 호출, UI 라이브러리(React) 의존 |
| **Infrastructure** | 인터페이스(PlaceRepository, TravelTimeAdapter 등)의 구체적 구현체 제공 | 도메인 검증 없이 외부 데이터를 신뢰하여 덮어쓰는 행위 |
| **Adapters** | 외부 시스템(지도, 날씨, LLM)의 응답을 도메인 모델로 번역 | 도메인 코어 규칙을 우회하여 추천 결정을 내리는 행위 |

---

# 6. 프로젝트 디렉토리 구조 (Suggested Project Structure)

```text
src/
├─ app/                                    # Next.js App Router
│  ├─ layout.tsx                           # Global Root Layout (Font, Safe-Area)
│  ├─ page.tsx                             # Screen 1: Home (FR-HOME)
│  ├─ trip/
│  │  └─ page.tsx                          # Screen 2: Trip Input (FR-INPUT)
│  ├─ itinerary/
│  │  └─ page.tsx                          # Screen 3: Recommendation Result & Timeline (FR-RESULT)
│  ├─ places/
│  │  └─ [id]/
│  │     └─ page.tsx                       # Screen 4: Place Detail (FR-PLACE)
│  └─ api/                                 # API Routes (필요시 백엔드 엔드포인트)
│
├─ components/                             # Presentation Layer UI Atoms & Molecules
│  ├─ ui/                                  # Primitives (Button, Badge, Chip, Progress)
│  ├─ shared/                              # NavigationBar, Header, TrustCard
│  └─ icons/                               # Material Symbols & Custom SVG Icons
│
├─ features/                               # Slice-based Feature Modules
│  ├─ home/
│  │  └─ components/                       # HeroSection, LogisticsGrid, ShowcaseCarousel
│  ├─ trip-input/
│  │  ├─ components/                       # ChildAgeChips, StrollerToggle, ScheduleSlot
│  │  ├─ schemas/                          # trip-input.schema.ts (Zod)
│  │  └─ hooks/                            # useTripInput.ts
│  ├─ itinerary/
│  │  ├─ components/                       # TimelineSpine, DestinationCard, TransitSegment
│  │  └─ hooks/                            # useItineraryActions.ts
│  └─ place-detail/
│     ├─ components/                       # HeroBanner, FacilityCheckGrid, ParentReviewBox
│     └─ hooks/                            # usePlaceDetail.ts
│
├─ application/                            # Application Layer Use Cases
│  ├─ generate-itinerary.usecase.ts        # 코스 추천 생성 유스케이스
│  ├─ modify-itinerary.usecase.ts          # 장소 교체/삭제/순서변경
│  ├─ recalculate-itinerary.usecase.ts     # 런타임 지연 및 조건 변경 재계산
│  └─ get-place-detail.usecase.ts          # 장소 상세 및 미디어 조회
│
├─ domain/                                 # Domain Core (Zero External Dependencies)
│  ├─ models/                              # Domain Entities & Types
│  │  ├─ tri-state.ts                      # TriState ("YES" | "NO" | "UNKNOWN")
│  │  ├─ place.ts                          # Place Entity & Facility Spec
│  │  ├─ trip-input.ts                     # TripInput Entity
│  │  ├─ itinerary.ts                      # Itinerary & ItineraryBlock
│  │  └─ evidence.ts                       # EvidenceValue & Provenance
│  │
│  ├─ recommendation/                      # Recommendation Logic Core
│  │  ├─ recommendation-engine.ts          # Pipeline Orchestrator
│  │  ├─ hard-constraints.ts               # Hard Filter (휴무, Stroller NO)
│  │  ├─ place-scorer.ts                   # 100pt Scoring Algorithm
│  │  ├─ route-generator.ts                # Combination & Permutation Generator
│  │  ├─ route-scorer.ts                   # Route Score (Detour, Diversity)
│  │  └─ explanation-builder.ts            # "왜 추천했나요?", "다음으로 남겨둘게요"
│  │
│  ├─ scheduling/                          # Scheduling & Density Core
│  │  ├─ timeline-scheduler.ts             # Time Block Sequential Assignment
│  │  ├─ buffer-calculator.ts              # Toddler Buffer & Parking Buffer
│  │  └─ density-evaluator.ts              # Slack Time & Overcrowding Warning
│  │
│  └─ config/
│     └─ recommendation.config.ts          # 가중치, 임계값, 기본 소요시간 상수
│
├─ infrastructure/                         # Infrastructure & Data Layer
│  ├─ repositories/
│  │  ├─ place-repository.interface.ts     # DIP 추상화 인터페이스
│  │  └─ seed-place-repository.ts          # JSON/TS 기반 Seed 구현체
│  └─ data/
│     ├─ seed-places.data.ts               # 7개 Seed 장소 정형 데이터 + 사진 매핑
│     └─ seed-travel-matrix.data.ts        # 장소 간 이동시간 Mock Matrix
│
├─ adapters/                               # External Service Adapters
│  ├─ travel-time/
│  │  ├─ travel-time-adapter.interface.ts
│  │  └─ seed-travel-time.adapter.ts       # MVP용 Seed Matrix 기반 계산
│  ├─ weather/
│  │  ├─ weather-adapter.interface.ts
│  │  └─ mock-weather.adapter.ts           # 폭염/우천 시나리오 Mock
│  └─ llm/
│     ├─ llm-adapter.interface.ts
│     └─ optional-llm.adapter.ts           # 설명 문구 보조 (Optional)
│
├─ public/                                 # Static Assets & Symlink
│  └─ resources/
│     └─ pic/                              # /resources/pic/*.jpg (23개 현장 사진 자산)
│
└─ tests/                                  # Test Suite
   ├─ unit/                                # 도메인 채점, 버퍼, 스케줄링 테스트
   ├─ pairwise/                            # 독립 변수 영향성(Traceability) 테스트
   └─ golden/                              # 김민지 가족 17개월 골든 시나리오 회귀 테스트
```

---

# 7. 핵심 도메인 모델 및 타입 정의 (Core Domain Models)

## 7.1 Tri-State 및 출처 증거 모델
```ts
// src/domain/models/tri-state.ts
export type TriState = "YES" | "NO" | "UNKNOWN";

// src/domain/models/evidence.ts
export type DataSourceType =
  | "FIELD_VISIT"     // 직접 현장 실측
  | "OFFICIAL"        // 시설 공식 안내
  | "PUBLIC_DATA"     // 공공데이터
  | "BUSINESS_PAGE"   // 사업자 등록 정보
  | "MAP_REVIEW"      // 리뷰 기반
  | "UNKNOWN";

export interface EvidenceValue<T> {
  value: T;
  sourceType: DataSourceType;
  sourceRef?: string;
  verifiedAt?: string; // YYYY-MM-DD
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  note?: string;
}
```

## 7.2 장소 모델 및 미디어 자산 명세
```ts
// src/domain/models/place.ts
export type PlaceCategory =
  | "RESTAURANT"
  | "CAFE"
  | "NATURE"
  | "PARK"
  | "EXPERIENCE"
  | "INDOOR"
  | "OTHER";

export type IndoorOutdoorType = "INDOOR" | "OUTDOOR" | "MIXED";

export type VerificationStatus =
  | "FIELD_VERIFIED"
  | "OFFICIAL"
  | "WEB_VERIFIED"
  | "USER_REPORTED"
  | "UNVERIFIED";

export interface Place {
  id: string;                         // "1", "2", "3", "4", "5", "6", "7"
  name: string;                       // "미솥지음", "모가의 숲", "이천농업생태공원" 등
  category: PlaceCategory;
  address: string;
  roadAddress?: string;
  lat: number;
  lng: number;

  // 시간 및 운영
  recommendedDurationMin: number;
  recommendedDurationMax?: number;
  openingHours: {
    open: string;                     // "09:30"
    close: string;                    // "18:30"
    closedDays: number[];             // [1] = 월요일 휴무
  };

  // 8대 영유아 필수 시설 (Tri-State)
  parking: EvidenceValue<TriState>;
  strollerAccessible: EvidenceValue<TriState>;
  nursingRoom: EvidenceValue<TriState>;
  diaperChangingStation: EvidenceValue<TriState>;
  babyChair: EvidenceValue<TriState>;
  toilet: EvidenceValue<TriState>;
  shade: EvidenceValue<TriState>;
  strollerRental: EvidenceValue<TriState>;

  // 연령 및 기상 특성
  indoorOutdoor: IndoorOutdoorType;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  weatherTags: Array<"HOT_OK" | "HOT_AVOID" | "RAIN_OK" | "RAIN_AVOID">;

  // 미디어 자산 연동 (/resources/pic)
  imageFiles: string[];               // ["/resources/pic/1-1.jpg", "/resources/pic/1-2.jpg", ...]
  thumbnailImage: string;             // "/resources/pic/1-1.jpg"

  // 검증 메타데이터
  verificationStatus: VerificationStatus;
  verifiedDate: string;
  editorialReview?: string;           // 부모를 위한 현장 실측 리뷰
  recommendationReason?: string;      // 기본 추천 사유 템플릿
}
```

## 7.3 여행 입력 및 컨텍스트 모델
```ts
// src/domain/models/trip-input.ts
export type TransportMode = "CAR" | "PUBLIC_TRANSPORT";

export type TravelStyle =
  | "NATURE"
  | "PARENT_REST"
  | "LOCAL_FOOD"
  | "EXPERIENCE"
  | "INDOOR"
  | "PHOTO";

export interface TripInput {
  originText: string;
  childAgeMonths: number;             // 개월 수 (내부 계산용: 17)
  displayAge: string;                 // UI 표시용 ("2세")
  strollerRequired: boolean;          // true / false
  tripDate: string;                   // "2025-09-05"
  departureTime: string;              // "10:00"
  arrivalInIcheon: string;            // "12:00"
  desiredDepartureFromIcheon: string; // "17:30"
  transport: TransportMode;           // "CAR"
  styles: TravelStyle[];              // 1~3개 선택

  // 선택 옵션
  napTimeStart?: string;              // "13:30"
  napTimeEnd?: string;                // "15:00"
  includeLunch: boolean;              // 기본값 true
  parentRestPriority: "LOW" | "MEDIUM" | "HIGH"; // 기본값 "HIGH"
  preferIndoor?: boolean;
}

export interface RecommendationContext {
  trip: TripInput;
  tripWindowMin: number;              // (17:30 - 12:00) = 330분
  weather: {
    condition: "NORMAL" | "HOT" | "RAIN" | "COLD";
    temperatureC: number;
  };
  maxBlocks: number;                  // 2세 기준 3~4개
}
```

---

# 8. 미디어 자산 파이프라인 명세 (Media & Photo Pipeline)

`/resources/pic` 폴더에 위치한 23개의 사진을 Next.js 정적 서빙 및 컴포넌트에서 로드하는 기술 규격을 정의한다.

### 8.1 심볼릭 링크 및 정적 파일 디렉토리
Next.js의 기본 정적 파일 서빙 위치인 `public/` 디렉토리에 `/resources/pic`을 심볼릭 링크 또는 빌드 복사하여 웹 브라우저에서 `/resources/pic/{filename}` 경로로 즉시 접근할 수 있도록 구성한다:
```text
public/resources/pic/
  ├─ 1-1.jpg ~ 1-5.jpg   (미솥지음)
  ├─ 2-1.jpg ~ 2-5.jpg   (모가의 숲)
  ├─ 3-1.jpg ~ 3-4.jpg   (이천농업생태공원)
  ├─ 4-1.jpg ~ 4-5.jpg   (이천시환경학습관)
  └─ 5-1.jpg ~ 5-4.jpg   (카페 을를)
```

### 8.2 이미지 컴포넌트 최적화 규격
Next.js `next/image`를 활용하여 모바일 네트워크 환경에 최적화:
```tsx
// src/components/ui/place-image.tsx
import Image from 'next/image';

interface PlaceImageProps {
  src: string;
  alt: string;
  aspectRatio?: '16/9' | '16/10' | '1/1';
  priority?: boolean;
}

export const PlaceImage = ({ src, alt, aspectRatio = '16/9', priority = false }: PlaceImageProps) => (
  <div className={`relative w-full overflow-hidden rounded-xl bg-surface-container aspect-[${aspectRatio}]`}>
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 480px) 100vw, 480px"
      priority={priority}
      className="object-cover transition-transform duration-300 hover:scale-105"
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,..."
    />
  </div>
);
```

---

# 9. 추천 엔진 상세 알고리즘 (Recommendation Engine Specification)

## 9.1 파이프라인 실행 흐름 (15-Step Pipeline)
```text
 1. Input Normalization & Trip Window 계산 (330분 산출)
 2. PlaceRepository.listCandidates() 후보 장소 조회
 3. Hard Constraints 필터링 (휴무, 운영시간, 유모차 NO 탈락)
 4. Soft Scoring (100점 만점 평가 산출)
 5. Route Candidate Generator (식사 1곳 + 관광 2곳 + 카페 1곳 조합 생성)
 6. TravelTimeAdapter를 통한 구간별 이동시간 매트릭스 결합
 7. Sequential Time Scheduling (블록별 시작/종료시간 배치)
 8. Toddler Buffer & Parking Buffer 계산 및 삽입
 9. 낮잠 시간대(13:30~15:00) 이동 구간 매칭 및 낮잠 칩 태깅
10. Trip Window 초과 후보 즉시 기각 (Reject impossible routes)
11. Route Score 계산 (장소점수 합 - 우회 감점 - 과밀 감점 + 다양성 보너스)
12. 최고 득점 최적 경로(Best Route) 1건 선정
13. Slack Time(여유시간) 산출 및 밀도 상태(RELAXED / TIGHT) 판정
14. Explanation Builder: 의사결정 사유 칩 및 제외 장소 브리핑 생성
15. Final Itinerary DTO 반환
```

## 9.2 Hard Constraint 평가 로직
```ts
// src/domain/recommendation/hard-constraints.ts
export function evaluateHardConstraints(place: Place, context: RecommendationContext): { eligible: boolean; reason?: string } {
  const tripDayOfWeek = new Date(context.trip.tripDate).getDay();

  // 1. 휴무일 검사
  if (place.openingHours.closedDays.includes(tripDayOfWeek)) {
    return { eligible: false, reason: "CLOSED_ON_DATE" };
  }

  // 2. 유모차 필수 조건 검사 (NO인 경우만 배제, UNKNOWN은 통과)
  if (context.trip.strollerRequired && place.strollerAccessible.value === "NO") {
    return { eligible: false, reason: "STROLLER_NOT_ACCESSIBLE" };
  }

  // 3. 기상 극단 부적합 검사 (무더위 시 야외 전용 장소 배제)
  if (context.weather.condition === "HOT" && place.indoorOutdoor === "OUTDOOR" && place.weatherTags.includes("HOT_AVOID")) {
    return { eligible: false, reason: "WEATHER_HOT_AVOID" };
  }

  return { eligible: true };
}
```

## 9.3 Soft Scoring 100점 가중치 체계
`src/domain/config/recommendation.config.ts` 파일에 상수를 중앙화하여 Magic Number를 제거한다:
```ts
// src/domain/config/recommendation.config.ts
export const RECOMMENDATION_CONFIG = {
  weights: {
    AGE_FIT: 25,
    FAMILY_FACILITY: 25,
    ROUTE_EFFICIENCY: 20,
    WEATHER_FIT: 15,
    LOCAL_IDENTITY: 10,
    PARENT_REST: 5,
  },
  facilityWeights: {
    strollerYes: 6,
    strollerUnknownPenalty: -5,
    nursingRoomYes: 6,
    diaperChangingYes: 5,
    babyChairYes: 4,
    parkingYes: 4,
  },
  durations: {
    mealDefaultMin: 60,
    cafeDefaultMin: 45,
    parkingBufferMin: 10,
    toddlerBuffer: {
      activityWindowMin: 90,
      extraBufferMin: 15,
      maxContinuousOutdoorMin: 90,
    },
  },
  stopLimits: {
    age0to2: { min: 3, max: 4 },
    age3to5: { min: 4, max: 4 },
    age6plus: { min: 4, max: 5 },
  },
  slackTime: {
    relaxedThresholdMin: 40,
    tightThresholdMin: 20,
  }
} as const;
```

장소별 점수 산정 함수:
```ts
// src/domain/recommendation/place-scorer.ts
export function calculatePlaceScore(place: Place, context: RecommendationContext): PlaceScore {
  let ageFit = 0;
  let familyFacility = 0;
  let weatherFit = 10;
  let localIdentity = 10;
  let parentRest = 0;

  // 연령 적합도 (25점)
  if (place.ageMinMonths !== undefined && place.ageMaxMonths !== undefined) {
    if (context.trip.childAgeMonths >= place.ageMinMonths && context.trip.childAgeMonths <= place.ageMaxMonths) {
      ageFit = RECOMMENDATION_CONFIG.weights.AGE_FIT;
    } else {
      ageFit = 10; // 부분 매칭
    }
  }

  // 편의시설 점수 (25점)
  if (place.strollerAccessible.value === "YES") familyFacility += RECOMMENDATION_CONFIG.facilityWeights.strollerYes;
  if (context.trip.strollerRequired && place.strollerAccessible.value === "UNKNOWN") {
    familyFacility += RECOMMENDATION_CONFIG.facilityWeights.strollerUnknownPenalty; // UNKNOWN 패널티
  }
  if (place.nursingRoom.value === "YES") familyFacility += RECOMMENDATION_CONFIG.facilityWeights.nursingRoomYes;
  if (place.diaperChangingStation.value === "YES") familyFacility += RECOMMENDATION_CONFIG.facilityWeights.diaperChangingYes;
  if (place.babyChair.value === "YES") familyFacility += RECOMMENDATION_CONFIG.facilityWeights.babyChairYes;
  if (place.parking.value === "YES") familyFacility += RECOMMENDATION_CONFIG.facilityWeights.parkingYes;

  // 날씨 점수 (15점)
  if (context.weather.condition === "HOT") {
    if (place.indoorOutdoor === "INDOOR") weatherFit = RECOMMENDATION_CONFIG.weights.WEATHER_FIT;
    else if (place.indoorOutdoor === "MIXED") weatherFit = 10;
  }

  // 부모 휴식 (5점)
  if (context.trip.parentRestPriority === "HIGH" && (place.category === "CAFE" || place.category === "PARK")) {
    parentRest = RECOMMENDATION_CONFIG.weights.PARENT_REST;
  }

  const total = Math.max(0, Math.min(100, ageFit + familyFacility + weatherFit + localIdentity + parentRest));

  return {
    total,
    breakdown: { ageFit, familyFacility, routeEfficiency: 20, weatherFit, localIdentity, parentRest },
  };
}
```

## 9.4 연속 야외 활동 제약 및 버퍼 계산 (Scheduling Core)
```ts
// src/domain/scheduling/buffer-calculator.ts
export function calculateBuffersAndConstraints(blocks: ItineraryBlock[], context: RecommendationContext) {
  let continuousOutdoorMin = 0;
  let totalActivityMin = 0;
  let toddlerBufferTotal = 0;
  let parkingBufferTotal = 0;

  for (const block of blocks) {
    if (block.type === "PLACE" && block.place) {
      parkingBufferTotal += RECOMMENDATION_CONFIG.durations.parkingBufferMin;
      totalActivityMin += block.durationMin;

      if (block.place.indoorOutdoor === "OUTDOOR") {
        continuousOutdoorMin += block.durationMin;
        // 2세 이하 야외 90분 초과 시 경고 플래그
        if (context.trip.childAgeMonths <= 35 && continuousOutdoorMin > RECOMMENDATION_CONFIG.durations.toddlerBuffer.maxContinuousOutdoorMin) {
          block.badges = [...(block.badges || []), "야외시간 주의"];
        }
      } else {
        continuousOutdoorMin = 0; // 실내 진입 시 야외 누적 리셋
      }
    }
  }

  // 90분 활동마다 15분 영유아 버퍼 가산
  if (context.trip.childAgeMonths <= 35) {
    toddlerBufferTotal = Math.floor(totalActivityMin / RECOMMENDATION_CONFIG.durations.toddlerBuffer.activityWindowMin) *
      RECOMMENDATION_CONFIG.durations.toddlerBuffer.extraBufferMin;
  }

  return { toddlerBufferTotal, parkingBufferTotal };
}
```

---

# 10. Repository 및 어댑터 명세 (Repository & Adapters)

## 10.1 PlaceRepository 인터페이스 및 구현
```ts
// src/infrastructure/repositories/place-repository.interface.ts
export interface PlaceRepository {
  listCandidates(filter?: { activeOnly?: boolean }): Promise<Place[]>;
  getById(id: string): Promise<Place | null>;
}

// src/infrastructure/repositories/seed-place-repository.ts
import { SEED_PLACES } from '../data/seed-places.data';

export class SeedPlaceRepository implements PlaceRepository {
  async listCandidates(): Promise<Place[]> {
    return [...SEED_PLACES];
  }

  async getById(id: string): Promise<Place | null> {
    const found = SEED_PLACES.find(p => p.id === id);
    return found ? { ...found } : null;
  }
}
```

## 10.2 TravelTimeAdapter 인터페이스 및 Seed Matrix
```ts
// src/adapters/travel-time/travel-time-adapter.interface.ts
export interface TravelTimeAdapter {
  getTravelTime(fromId: string, toId: string): Promise<{ durationMin: number; estimated: boolean }>;
}

// src/adapters/travel-time/seed-travel-time.adapter.ts
export class SeedMatrixTravelTimeAdapter implements TravelTimeAdapter {
  private matrix: Record<string, number> = {
    "1__3": 20, // 미솥지음 -> 이천농업생태공원
    "3__4": 30, // 이천농업생태공원 -> 이천시환경학습관 (낮잠 추천 구간)
    "4__5": 15, // 이천시환경학습관 -> 카페 을를
    "1__2": 25, // 미솥지음 -> 모가의 숲
    "2__3": 10, // 모가의 숲 -> 이천농업생태공원
  };

  async getTravelTime(fromId: string, toId: string): Promise<{ durationMin: number; estimated: boolean }> {
    const key = `${fromId}__${toId}`;
    const reverseKey = `${toId}__${fromId}`;
    const duration = this.matrix[key] || this.matrix[reverseKey] || 20; // default 20min
    return { durationMin: duration, estimated: true };
  }
}
```

## 10.3 WeatherAdapter 인터페이스 및 Mock 구현
```ts
// src/adapters/weather/weather-adapter.interface.ts
export interface WeatherAdapter {
  getWeather(date: string): Promise<{ condition: "NORMAL" | "HOT" | "RAIN" | "COLD"; temperatureC: number }>;
}

// src/adapters/weather/mock-weather.adapter.ts
export class MockWeatherAdapter implements WeatherAdapter {
  async getWeather(date: string) {
    // 골든 시나리오: 무더운 날씨 (31℃)
    return { condition: "HOT" as const, temperatureC: 31 };
  }
}
```

---

# 11. 상태 관리 및 일정 수정 아키텍처 (State Management & Editing)

### 11.1 URL 및 클라이언트 상태 설계
사용자가 생성한 일정은 URL Query Parameter로 직렬화하여 링크 복사 및 브라우저 새로고침 시에도 동일 일정이 유지되도록 지원한다:
* URL 파라미터 구조: `/itinerary?origin=신도림&age=17&stroller=1&lunch=1&date=2025-09-05`
* 수정 상태: React Context 또는 lightweight Store(Zustand)를 사용하여 현재 활성 `Itinerary` 객체를 관리.

### 11.2 수정 액션 유스케이스 구현 규격
1. **`replacePlace(currentItinerary, blockId, newPlaceId)`**:
   * 대상 블록의 `placeId`를 교체하고, 인접 블록 간 이동시간을 `TravelTimeAdapter`로 재조회.
   * 타임라인 시작/종료시간 및 버퍼를 재계산하여 새 `Itinerary` 상태 반환.
2. **`removePlace(currentItinerary, blockId)`**:
   * 블록 삭제 후 뒤따르는 블록들의 시작 시간을 앞당기거나 Slack Time을 확보.
   * Feasibility 재평가(과밀 상태 해제).
3. **`reduceOneStop(currentItinerary)`**:
   * 점수가 가장 낮거나 이동 거리가 먼 스팟 1곳을 자동 선택하여 제거하고 여유시간 45분 즉시 확보.

---

# 12. 테스트 아키텍처 및 골든 시나리오 (Test Architecture)

## 12.1 테스트 스위트 구조
```text
tests/
├─ unit/
│  ├─ hard-constraints.test.ts      # 휴무일, stroller NO 배제 검증
│  ├─ place-scorer.test.ts          # 100점 가중치 및 UNKNOWN 감점 검증
│  ├─ buffer-calculator.test.ts     # 90분당 15분 영유아 버퍼 가산 검증
│  └─ density-evaluator.test.ts     # Slack Time 40분/20분 상태 판정
│
├─ pairwise/
│  └─ input-traceability.test.ts    # 입력값 변경 시 실제 결과 차이 검증
│
└─ golden/
   └─ kim-minji-scenario.test.ts    # 김민지 가족 17개월 실측 골든 테스트
```

## 12.2 김민지 가족 골든 시나리오 자동화 테스트 코드
```ts
// tests/golden/kim-minji-scenario.test.ts
import { describe, it, expect } from 'vitest';
import { RuleBasedRecommendationEngine } from '../../src/domain/recommendation/recommendation-engine';
import { SeedPlaceRepository } from '../../src/infrastructure/repositories/seed-place-repository';
import { SeedMatrixTravelTimeAdapter } from '../../src/adapters/travel-time/seed-travel-time.adapter';
import { MockWeatherAdapter } from '../../src/adapters/weather/mock-weather.adapter';

describe('Golden Scenario: 김민지 가족 (17개월, 유모차 ON, 무더위)', () => {
  const repo = new SeedPlaceRepository();
  const travelAdapter = new SeedMatrixTravelTimeAdapter();
  const weatherAdapter = new MockWeatherAdapter();
  const engine = new RuleBasedRecommendationEngine(repo, travelAdapter, weatherAdapter);

  it('식사/휴식을 포함하여 정확히 4개 블록의 안심 코스를 추천해야 한다', async () => {
    const result = await engine.generate({
      trip: {
        originText: '서울 신도림',
        childAgeMonths: 17,
        displayAge: '2세',
        strollerRequired: true,
        tripDate: '2025-09-05',
        departureTime: '10:00',
        arrivalInIcheon: '12:00',
        desiredDepartureFromIcheon: '17:30',
        transport: 'CAR',
        styles: ['NATURE', 'PARENT_REST'],
        includeLunch: true,
        parentRestPriority: 'HIGH',
      }
    });

    // 1. 블록 수 검증 (식사/체험/실내/카페 4개)
    const placeBlocks = result.blocks.filter(b => b.type !== 'TRAVEL' && b.type !== 'DEPARTURE');
    expect(placeBlocks).toHaveLength(4);

    // 2. 방문 순서 검증: 미솥지음 -> 농업생태공원 -> 환경학습관 -> 을를
    expect(placeBlocks[0].place?.name).toBe('미솥지음');
    expect(placeBlocks[1].place?.name).toBe('이천농업생태공원');
    expect(placeBlocks[2].place?.name).toBe('이천시환경학습관');
    expect(placeBlocks[3].place?.name).toBe('을를 (Cafe Eulele)');

    // 3. 미디어 자산 경로 검증
    expect(placeBlocks[0].place?.thumbnailImage).toBe('/resources/pic/1-1.jpg');
    expect(placeBlocks[1].place?.thumbnailImage).toBe('/resources/pic/3-1.jpg');
    expect(placeBlocks[2].place?.thumbnailImage).toBe('/resources/pic/4-1.jpg');
    expect(placeBlocks[3].place?.thumbnailImage).toBe('/resources/pic/5-1.jpg');

    // 4. 제외 사유 검증: 모가의 숲(폭염), 성호호수(동선)
    const excludedNames = result.excludedPlaces.map(e => e.place.name);
    expect(excludedNames).toContain('모가의 숲');
    expect(excludedNames).toContain('성호호수연꽃단지');

    // 5. Tri-State 검증 (미솥지음 기저귀대는 UNKNOWN이어야 함)
    expect(placeBlocks[0].place?.diaperChangingStation.value).toBe('UNKNOWN');

    // 6. 상태 검증: 무리 없는 안심 일정 (RELAXED)
    expect(result.status).toBe('RELAXED');
    expect(result.slackMin).toBeGreaterThanOrEqual(40);
  });
});
```

---

# 13. 비기능적 요구사항 구현 지침 (Non-Functional Technical Directives)

### 13.1 성능 및 번들 최적화
* **서버 컴포넌트(RSC) 기본 활용**: 추천 결과 페이지 및 장소 상세 페이지는 서버 사이드에서 데이터를 사전 패칭하여 렌더링하고, 클라이언트 컴포넌트는 인터랙션 요소(칩 클릭, 모달, 북마크)로 한정.
* **초기 번들 최소화**: 무거운 서드파티 라이브러리(Lodash, Moment.js 등) 금지 $\rightarrow$ Native JS 및 경량 date 유틸 사용.
* **이미지 포맷 WebP/AVIF 우선 변환**: Next.js 내장 이미지 로더를 통해 원본 JPG 대비 전송량 60% 이상 절감.

### 13.2 웹 접근성 (WCAG AA & KWCAG 2.2)
* 모든 터치 가능 버튼(`button`, `a`)은 패딩 포함 `min-h-[44px] min-w-[44px]` 확보.
* 색상 대비율: 텍스트와 배경 간 명도 대비 최소 `4.5:1` 유지.
* 스크린 리더 대응: Tri-State 배지는 시각적 기호(`✓`, `?`, `×`)와 함께 `aria-label="확인됨"`, `aria-label="확인 필요"`를 명시.

---

# 14. 구현 로드맵 (Implementation Roadmap for Antigravity)

1. **Phase 1: 도메인 모델 및 Seed Repository 구축**
   * `tri-state.ts`, `place.ts`, `evidence.ts`, `trip-input.ts` 정의.
   * `/resources/pic` 이미지를 `public/resources/pic`으로 심볼릭 링크/복사.
   * `seed-places.data.ts` 및 `SeedPlaceRepository` 구현.
2. **Phase 2: 추천 및 스케줄링 코어 구현**
   * `recommendation.config.ts` 상수 선언.
   * `hard-constraints.ts`, `place-scorer.ts`, `buffer-calculator.ts`, `timeline-scheduler.ts` 작성.
   * `kim-minji-scenario.test.ts` 골든 시나리오 단위 테스트 통과.
3. **Phase 3: 화면 컴포넌트 조립 및 미디어 연동**
   * 홈 (`design/_3`), 조건 입력 (`design/_4`), 추천 결과 타임라인 (`design/_1`), 장소 상세 (`design/_2`)를 컴포넌트화.
   * 디자인 시스템 CSS 변수 및 Tailwind 토큰 적용.
4. **Phase 4: 코스 수정 및 실시간 재계산**
   * 장소 교체, 장소 삭제, `한 곳 줄이기` 유스케이스 및 UI 연동.
5. **Phase 5: 모바일 최적화 및 회귀 검증**
   * 390px 반응형 뷰포트 점검, WCAG AA 접근성 검수, LCP 성능 측정.
