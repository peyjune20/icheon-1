# 기능 요구사항 정의서 (FRD) — 이천베베로드 (Icheon Bebe Road)

## 0. 문서 정보 (Document Information)

* **제품명**: 이천베베로드 (Icheon Bebe Road)
* **문서 유형**: 기능 요구사항 정의서 (Functional Requirements Document, FRD)
* **문서 버전**: v1.0
* **제품 단계**: MVP (Minimum Viable Product)
* **기준 소스**: 
  - 제품 요구사항 정의서: `docs/PRD_bebeload.md` (v0.2)
  - UI/UX 디자인 시스템 및 시안: `design/icheon_bebe_road/` (`DESIGN.md`, `_1`, `_2`, `_3`, `_4`, `_5`)
  - 현장 미디어 리소스: `/resources/pic` (현장 답사 사진 23종)
* **주요 플랫폼**: 모바일 퍼스트 반응형 웹 (Mobile-first responsive web, 기준폭 375~480px, 데스크톱 최대 1120~1200px)
* **서비스 대상 지역**: 경기도 이천시 전역
* **기준 페르소나**: 김민지 가족 (30대 부모 2인 + 17개월 영유아 1인, 자가용 당일치기 나들이)
* **작성자 역할**: 기능 분석가 (Business Analyst)

---

# 1. 기능적 목적 (Functional Objective)

이천베베로드는 영유아(0~36개월 중심) 동반 가족이 여행 조건(출발지, 아이 나이, 유모차 지참 여부, 출발/귀가 시간, 이동수단, 여행 스타일 등)을 입력하면, **아이의 체력·수유/낮잠 텀·유모차 진입 가능성·실제 이동 및 승하차 버퍼·기상 상황·장소별 편의시설**을 종합적으로 계산하여 **실제 실행 가능한 이천 당일치기 3~4개 블록 코스를 추천하고 관리하는 서비스**이다.

### 핵심 질문
> **“오늘 이 일정이면 아이와 부모가 지치지 않고 실제로 갈 수 있는가?”**

### 핵심 기능 처리 흐름 (11-Step Pipeline)
```text
[1. 여행 조건 입력 (Trip Input)]
        ↓
[2. 후보 장소 조회 (Place Repository Query)]
        ↓
[3. Hard Constraint 필터링 (운영시간, 휴무일, 유모차 불가 장소 배제)]
        ↓
[4. Soft Score 가중치 계산 (연령, 편의성, 동선, 날씨, 휴식 가치)]
        ↓
[5. 조합 일정 후보 생성 (Candidate Route Generation, 식사/카페/관광 안배)]
        ↓
[6. 일정 현실성 검증 (Travel Window, 영유아 버퍼, 승하차 시간)]
        ↓
[7. 최적 코스 선정 및 과밀 일정 판정 (Density Check & Slack Time)]
        ↓
[8. 추천 타임라인 및 근거 브리핑 출력 (Timeline & Explanation Display)]
        ↓
[9. 장소 상세 및 8대 편의시설 3상태 확인 (Place Detail & Tri-State Logistics)]
        ↓
[10. 장소 교체 / 삭제 / 순서 변경 인터랙션 (Edit Itinerary)]
        ↓
[11. 실시간 일정 재계산 (Runtime Recalculation)]
```

---

# 2. 기능 범위 (MVP Scope)

## 2.1 Must Have (MVP 필수 구현 범위)
* **홈 (Landing & Onboarding)**: 서비스 가치 전달(5초 룰), 5대 안심 체크 기준, 3단계 추천 안내, 검증 추천지 큐레이션 쇼케이스(미디어 연동), 날씨 안내, 원클릭 시작 CTA.
* **여행 조건 입력 (Trip Input)**: 2단계 프로그레스 바, 출발지역, 아이 나이(내부 개월수 vs UI 표시 연령 분리), 유모차 여부, 날짜, 출발/귀가 희망시간, 체류 가능시간 실시간 계산, 이동수단, 스타일 태그(최대 3개), 맞춤 상세(낮잠 시간, 점심 포함, 부모 휴식 중요도).
* **입력 유효성 검증 & 추적성 (Traceability)**: 필수값 누락 시 CTA 비활성화, 모든 입력값의 추천 엔진 반영 보장.
* **Place Repository & 미디어 자산 연동**: 추상화된 Repository 구조, `/resources/pic` 폴더의 장소별 이미지 표출 체계(1: 미솥지음, 2: 모가의 숲, 3: 이천농업생태공원, 4: 이천시환경학습관, 5: 을를).
* **규칙 기반 추천 엔진 (Rule-based Engine)**: Hard Constraint(휴무, 유모차 `NO`, 운영시간), Soft Score(100점 만점), 영유아 버퍼(90분당 15분), 승하차 버퍼(장소당 10분), 식사(60분)/카페(30~45분) 스케줄링.
* **추천 결과 및 요약 (Recommendation Result)**: 맞춤 코스 헤더, 안심 일정 판정 배지, 3개 핵심 메트릭(총 일정, 순수 이동, 여유·버퍼 시간).
* **추천 근거 & 대안 브리핑 (Explanation & Alternatives)**: "왜 이렇게 추천했나요?"(의사결정 칩 + 사유 텍스트), "오늘은 다음으로 남겨둘게요"(제외 장소와 구체적 제외 사유).
* **버티컬 타임라인 (Itinerary Timeline)**: 번호 노드, 장소 카드(사진, 태그, 시간, 편의시설 칩, 추천 사유), 이동 세그먼트(이동시간 + 버퍼 + 아기 낮잠 타이밍 안내), 안전 귀가 블록.
* **장소 상세 (Place Detail)**: 상단 히어로 사진, 검증 신뢰 카드(에디터 현장 검증 정보), **"아이와 가기 체크" 8대 필수 시설 매트릭스**, 부모 솔직 평, 방문 전 필수 정보 4종(체류시간, 운영시간, 비용, 추천날씨), 위치/IC 접근성, 찜/코스 담기 CTA.
* **3상태(Tri-State) 편의시설 모델**: `YES (확인됨)` / `UNKNOWN (확인 필요)` / `NO (지원 안 됨)`의 엄격한 분리 및 UI 차별화 (UNKNOWN을 YES로 추정 절대 금지).
* **과밀 일정 경고 & 코스 수정**: 여유시간(Slack Time) 부족 시 과밀 경고, 1개 장소 줄이기(-45분), 장소 삭제, 장소 교체(대체 후보 추천), 실시간 재계산.
* **모바일 반응형 UI**: 375~480px 중심 최적화, 데스크톱 뷰 분할 레이아웃 대응.

## 2.2 Out of Scope (MVP 제외 대상)
* 사용자 로그인, 회원가입, 소셜 계정 연동 (비회원 익명 세션 유지)
* 결제, 식당 예약, 티켓 발권 연동
* 전국 타 지역 데이터 확장
* 실시간 GPS 기반 실시간 길안내 내비게이션 (내비 앱 외부 딥링크 연결로 대체)
* 커뮤니티, 오픈 게시판, 사용자 댓글/사진 업로드
* 복잡한 대화형 AI 챗봇 (추천 코어는 100% 로지컬 룰 엔진으로 동작)

---

# 3. 기능 아키텍처 (Functional Architecture)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              User Interface                            │
│  [Home]  ──>  [Trip Input]  ──>  [Itinerary Result]  ──>  [Place Detail]│
│                                           │ (Edit / Recalc)            │
│                                           └────────────────────────────┘
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ User Inputs (TripConditions)
┌────────────────────────────────────▼───────────────────────────────────┐
│                          Application Layer                             │
│  - Input Validation & Normalization                                    │
│  - State Management (Session, History, Active Route)                  │
│  - Presentation Formatting (Badges, Display Age, Friendly Labels)       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                    Rule-based Recommendation Engine                    │
│  ├─ Trip Window Calculation (도착시간 ~ 귀가 희망시간)                  │
│  ├─ Hard Constraint Filter (운영시간, 휴무일, Stroller NO 배제)        │
│  ├─ Soft Scoring Engine (연령, 편의성, 동선, 날씨, 휴식 가중치)         │
│  ├─ Route Candidate Generator & Scheduler (Stops, Meal, Nap)           │
│  ├─ Buffer & Density Checker (Toddler buffer, Parking, Slack Time)     │
│  └─ Explanation & Alternative Generator (포함/제외 사유 명시)           │
└──────────────┬─────────────────────────┬───────────────────────┬───────┘
               │ Query                   │ Travel Time Matrix    │ Weather Tags
┌──────────────▼──────────┐   ┌──────────▼──────────┐   ┌────────▼───────┐
│     Place Repository    │   │ TravelTime Adapter  │   │ Weather Adapter│
│  - Seed Places (7 spots)│   │  (Mock / Seed Data) │   │ (Preset/Status)│
│  - Image Assets Loader  │   └─────────────────────┘   └────────────────┘
│    (/resources/pic)     │
│  - Provenance & Evidence│
└─────────────────────────┘
```

> **규칙 원칙**:
> 1. AI/LLM 계층은 추천 필수 파이프라인에서 완전히 분리되며, LLM 장애나 API 비활성화 상태에서도 전체 코스 추천 및 재계산은 100% 정상 작동해야 한다.
> 2. `PlaceRepository`는 인터페이스로 격리되어 향후 DB, CSV, 공공데이터 API로 무중단 교체 가능해야 한다.

---

# 4. 화면별 상세 기능 요구사항 (Screen Functional Requirements)

## 4.1 화면 1: 홈 (Home & Onboarding) — [design/_3]

### [FR-HOME-001] 서비스 가치 전달 및 헤더
* **목적**: 방문자가 5초 이내에 "영유아 동반 맞춤 이천 당일치기 코스 제공 서비스"임을 인지하도록 한다.
* **표시 요소**:
  * 상단 GNB: 서비스 브랜드명("이천베베로드"), 지역 인디케이터("이천시"), 알림/안심팁 아이콘, 프로필 아바타.
  * 상단 태그 뱃지: `영유아 동반 이천 당일치기 큐레이션`
  * 메인 카피: **"아이와 함께, 무리 없는 이천 하루."**
  * 서브 카피: "아이 개월수와 출발 시간만 알려주세요. 수유 텀, 기저귀 갈이대, 유모차 길까지 챙긴 진짜 소화 가능한 일정을 선물할게요."
  * 감성 에디토리얼 카드: 모가의 숲/도자예술마을 완경사길 사진 + `이천 현장 전수 답사 완료` + `유모차 PASS` 뱃지.
  * 퀵 스캔 바: `0~36개월 맞춤 동선` | `전 코스 아기의자 보장`.

### [FR-HOME-002] 부모 안심 메시지 섹션
* **표시 내용**:
  * 인용구: “많이 보는 여행보다, 아이와 부모가 지치지 않는 하루를 만듭니다.”
  * 설명: “유명한 핫플레이스보다, 갑자기 기저귀를 갈 수 있고 주차장에서 유모차를 안전하게 펼칠 수 있는 쉼표를 먼저 고려했습니다.”

### [FR-HOME-003] 이천베베로드 안심 체크 5대 기준
모든 추천 장소가 통과해야 하는 5가지 물류/편의 기준을 시각화 그리드로 노출한다.
1. **유모차 주행성**: 턱 없는 완경사로 & 엘리베이터 (전면 체크)
2. **수유실·기저귀대**: 온수 제공 여부와 청결도 (10분 내 인접)
3. **아기의자·이유식 데우기**: 전자레인지 보유 식음 공간 (웰컴 베이비존)
4. **출입구 초근접 주차**: 차문 활짝 열리는 쾌적 주차장 (도보 2분 컷)
5. **날씨·쾌적 지수**: 실내외 안배 및 그늘 쉼터 확보

### [FR-HOME-004] 3단계 컨시어지 프로세스 안내
1. **1단계 (우리 가족 컨디션 선택)**: 아이 개월수, 유모차 지참 여부, 출발 시간 30초 탭 입력.
2. **2단계 (현실적인 하루 코스 조합)**: 아이 낮잠 시간(차량 이동 15~20분 버퍼)과 기저귀 교체 타이밍이 반영된 3~4개 스팟 추천.
3. **3단계 (날씨·칭얼거림 긴급 교체)**: 갑작스러운 비나 무더위, 아기 컨디션 난조 시 원터치 실내 대체 장소 전환.

### [FR-HOME-005] 검증 추천지 큐레이션 쇼케이스 (미디어 연동)
* **목적**: 직접 검증된 대표 장소의 카드 프리뷰를 제공하여 데이터 신뢰도 증대.
* **데이터 및 사진 연동**:
  * **미솥지음**: 썸네일(`/resources/pic/1-1.jpg`), 태그(`솥밥·안심식당`, `12~36개월 추천`), 위치(`신둔면·주차 광폭`), 편의시설 배지(`아기의자 8개`, `전자레인지 완비`, `단차 없는 진입로`).
  * **이천농업생태공원**: 썸네일(`/resources/pic/3-1.jpg`), 태그(`야외 산책·숲 쉼터`, `전 연령 추천`), 위치(`모가면·수유실 완비`), 편의시설 배지(`독립 수유실`, `기저귀 교환대`, `완경사 램프`).
* **동작**: 카드 터치 시 해당 장소의 상세 화면([FR-PLACE])으로 이동.

### [FR-HOME-006] 실시간 날씨 및 안심 지수 배너
* **표시 내용**: "오늘의 이천 나들이 지수: 매우 쾌적" (미세먼지 좋음, 야외 그늘 산책하기 딱 좋은 날씨).
* **연계**: 기상 상태에 따라 추천 엔진의 날씨 가중치(실내 선호 등)와 동기화.

### [FR-HOME-007] 플로팅 CTA & 바텀 내비게이션
* **하단 플로팅 CTA**: `우리 아이 맞춤 코스 시작하기 (30초)` (터치 시 여행 조건 입력 화면으로 즉시 이동).
* **바텀 탭 바(Bottom Navigation)**: 4개 탭 제공 (`홈`, `코스 추천`, `장소 탐색`, `내 일정`).

---

## 4.2 화면 2: 여행 조건 입력 (Trip Input) — [design/_4]

### [FR-INPUT-001] 프로그레스 바 & 화면 인디케이터
* **표시**: `1/2 기본 조건 설정` (진행률 50% 프로그레스 바), 소요시간 안내(`약 1분 소요`).
* **타이틀**: "우리 가족 여행을 알려주세요", "아이와 무리 없이 움직일 수 있는 안심 코스를 만들어드릴게요."

### [FR-INPUT-002] Section A: 아이 정보 (Child Info)
* **나이대 선택 칩 (Age Selection)**:
  * 칩 목록: `12개월 미만`, `1세`, `2세 (13~24개월)`, `3~4세`, `5세 이상` (단일 선택).
  * **데이터 매핑 정책**: UI 표시값과 내부 계산 개월수를 분리 저장.
    ```json
    { "selectedChip": "2세", "ageMonths": 17, "displayAge": "2세" }
    ```
  * **안심 가이드 문구**: "17개월 아기는 2세 기준으로 넉넉한 기저귀 교환 및 보행 버퍼를 자동 계산해요."
* **유모차 동행 여부 (Stroller Usage)**:
  * 세그먼트 컨트롤: `사용해요 (권장)` [YES] vs `사용하지 않아요` [NO].
  * 가이드 문구: "계단이 없거나 경사로 및 엘리베이터가 확보된 장소를 최우선 추천해요."
  * 로직 영향: `YES` 선택 시 `stroller_accessible = NO` 장소 하드 필터링 배제.

### [FR-INPUT-003] Section B: 여행 일정 (Schedule)
* **출발 지역 (Departure Location)**:
  * 입력 방식: 시/구 단위 셀렉터 또는 텍스트 입력 (Default: `서울 구로구 신도림`).
  * 역할: 이천 도착 소요시간 산출 및 귀가 교통 정체 시간 계산.
* **여행 날짜 (Travel Date)**:
  * 캘린더 피커 (Default: `2025년 9월 5일 (토)`).
  * 역할: 장소별 정기 휴무일(월요일 등) 및 특정 요일 운영시간 필터링.
* **시간 설정 (Time Slots)**:
  * 출발 시간 (Departure from Origin): Default `10:00 AM` (이천 도착 `12:00 PM` 자동 산정).
  * 귀가 출발 희망시간 (Departure from Icheon): Default `05:30 PM` (저녁 정체 전 복귀).
* **체류 가능 시간 자동 계산 (Trip Window Calculation)**:
  * 수식: `Trip Window = 귀가 출발 희망시간 - 이천 도착시간`
  * UI 피드백: "이천 체류 가능 시간: 약 5시간 30분" 실시간 뱃지 노출.

### [FR-INPUT-004] Section C: 이동수단 (Transportation)
* **선택지**:
  1. `자가용 (권장)`: 주차 및 카시트 승하차 버퍼 장소당 10분 자동 포함.
  2. `경강선·대중교통`: 역사 엘리베이터 및 도보 완경사 중심 동선 설계.
* **기본값**: 자가용 (Primary persona 지원).

### [FR-INPUT-005] Section D: 여행 스타일 (Travel Style)
* **선택 규칙**: 다중 선택 (최소 1개, 최대 3개). 3개 초과 선택 시 토스트 안내 및 선택 제한.
* **스타일 옵션**:
  1. `🌿 자연 속 산책` (NATURE)
  2. `☕ 부모도 쉬고 싶어요` (PARENT_REST)
  3. `🍚 이천다운 쌀밥 맛집` (LOCAL_FOOD)
  4. `🧸 유아 친화 체험` (EXPERIENCE)
  5. `🏠 쾌적한 실내 위주` (INDOOR)
  6. `📷 가족 감성 사진` (PHOTO)
* **로직 영향**: 카테고리별 매칭 점수 가중치(+10~20점) 부여.

### [FR-INPUT-006] Section E: 세부 맞춤 설정 (Optional Accordion)
기본 접힘(또는 펼침) 아코디언 컴포넌트:
* **아이 낮잠 시간대 (Nap Time Window)**:
  * 기본값: `오후 1:30 ~ 3:00`
  * 로직 영향: 해당 시간대에 15~30분 거리의 차량 이동 구간(차 안 낮잠) 또는 저자극 실내 카페 자동 배치.
* **점심 식사 포함 여부 (Lunch Included)**:
  * 토글 스위치 (Default: `ON`).
  * 권장 문구: "이천 도착 직후 (12:00 경) 권장".
  * 로직 영향: 타임라인 첫 블록 또는 12시대에 60분 식사 블록 강제 배정.
* **부모 휴식 중요도 (Parent Rest Priority)**:
  * 슬라이더 또는 단계 선택: `낮음` / `보통` / `높음(카페 40분 보장)` (Default: 높음).
  * 로직 영향: 카페 및 쉼터 블록의 체류시간 확장(30분 -> 45분) 및 우선순위 부여.

### [FR-INPUT-007] 입력 유효성 검증 및 실행 CTA
* **검증 규칙**: 아이 나이, 유모차 여부, 날짜, 출발/귀가 시간, 이동수단, 여행 스타일(1개 이상) 미완료 시 하단 CTA 비활성화.
* **하단 Sticky CTA**: `우리 가족 코스 추천받기 (4개 코스 예상)`
* **안심 캡션**: "아이의 체력을 고려해 무리한 다중 장소는 자동으로 필터링됩니다."

---

## 4.3 화면 3: 추천 코스 결과 및 타임라인 (Recommendation Result) — [design/_1]

### [FR-RESULT-001] 맞춤 헤더 및 현실성 판정 (Feasibility Status)
* **개인화 타이틀**: `{사용자명/가족명} 맞춤 코스` (예: "김민지 가족 맞춤 코스")
* **추천 요약 헤드라인**: **"오늘은 4개 블록이 적당해요"** (과밀 일정 방지 철학 반영)
* **컨디션 요약**: "2세 아이와 무더운 날씨, 유모차 사용을 고려해 무리 없는 동선으로 구성했어요."
* **안심 판정 배지 (Feasibility Banner)**: 
  * 문구: `✓ 무리 없는 일정이에요 (2세 아이 기준 안심)`
  * 스타일: Sage Green 테마, 체크 서클 아이콘.

### [FR-RESULT-002] 3-Column 핵심 일정 메트릭 (Metrics Grid)
* **총 일정**: `5시간 30분` (전체 소요시간)
* **순수 이동**: `1시간 10분` (차량 주행 시간)
* **여유·버퍼**: `40분 확보` (녹색 강조 숫자, 기저귀/수유/돌발상황 대비 여유시간)
* **보증 캡션**: "장소 간 이동시간 15~20분 내외로 아이가 차 안에서 보채지 않는 거리입니다."

### [FR-TIMELINE-001] 버티컬 타임라인 (Timeline Spine)
시간순 수직 커넥터 라인(`2px solid`)과 32px 원형 순번 노드(1, 2, 3, 4, 🏁 귀가)로 연결.
우측 상단 `간단히 보기 / 상세히 보기` 토글 버튼 제공 (이미지 영역 접기/펼치기).

### [FR-TIMELINE-002] 타임라인 장소 카드 (Destination Blocks) — 미디어 연동
각 장소 블록은 아래 정보를 정확히 포함:
1. **블록 1: 점심 식사 (12:00 — 13:00, 60분)**
   * 장소: **미솥지음** (쌀밥 한정식)
   * 사진: `/resources/pic/1-1.jpg` (또는 1-2.jpg)
   * 태그: `점심 식사`, `실내 에어컨`, `유아 동반 94% 만족`
   * 편의시설 칩: `✓ 주차 편리`, `✓ 아기의자 8개 보유`, `? 기저귀대 확인필요`
   * 추천 이유: "이천 도착 직후 바로 식사하며 아이 컨디션과 허기를 달래기 좋아요. 테이블 간격이 넓어 유모차 거치가 편합니다."
2. **블록 2: 메인 체험 & 쉼 (13:20 — 14:50, 90분)**
   * 장소: **이천농업생태공원 + 라이스카페**
   * 사진: `/resources/pic/3-1.jpg` (또는 3-2.jpg)
   * 태그: `메인 체험 & 쉼`, `실내 + 그늘`, `유모차 친화 1등급`
   * 편의시설 칩: `✓ 유모차 완경사`, `✓ 전용 주차장`, `✓ 독립 수유실`, `✓ 기저귀 갈이대`
   * 추천 이유: "완만한 덱길로 유모차 주행이 쾌적하며, 더울 땐 공원 내 라이스카페 실내에서 시원한 휴식이 가능해요."
3. **블록 3: 실내 관람 (15:20 — 16:00, 40분)**
   * 장소: **이천시환경학습관**
   * 사진: `/resources/pic/4-1.jpg` (또는 4-2.jpg)
   * 태그: `실내 관람`, `완전 실내`, `쾌적지수 98점`
   * 편의시설 칩: `✓ 엘리베이터`, `✓ 유모차 관람`, `✓ 화장실 완비`, `? 아기의자 확인필요`
   * 추천 이유: "무더운 오후 시간대 실내에서 시원하게 물고기와 식물을 관찰할 수 있는 쾌적한 쉼표 장소입니다."
4. **블록 4: 부모 휴식 (16:15 — 17:00, 45분)**
   * 장소: **카페 을를**
   * 사진: `/resources/pic/5-1.jpg` (또는 5-2.jpg)
   * 태그: `부모 휴식`, `실내/잔디마당`, `잔디마당 완비`
   * 편의시설 칩: `✓ 전용 주차`, `✓ 아기의자`, `✓ 야외 테라스`
   * 추천 이유: "집으로 출발하기 전 부모가 커피 한 잔과 함께 한숨 돌리는 마지막 충전 시간입니다."
5. **블록 5: 안전 귀가 안내 (17:30)**
   * 표시: `🏁 17:30 이천 출발 → 서울 저녁 정체 전 안전 귀가`

### [FR-TIMELINE-003] 이동 세그먼트 (Transit Segment Chips)
장소 카드 사이에 이동 소요시간 및 버퍼 정보를 독립 칩으로 노출:
* 일반 이동 칩: `🚗 이동 20분 · 주차 및 승하차 버퍼 10분 포함`
* 낮잠 특화 이동 칩: `🚗 이동 30분 (아기 낮잠 타이밍으로 추천 😴)` (오후 2시경 배치)

### [FR-RESULT-003] 추천 사유 브리핑 ("왜 이렇게 추천했나요?")
* **의사결정 태그 칩**:
  - `👶 2세 아이 발걸음`
  - `🦽 유모차 완경사로 보장`
  - `☀️ 무더위 실내 60% 안배`
  - `☕ 부모 휴식 45분 보장`
* **설명 텍스트**: "오늘 최고 기온이 31℃로 예보되어 오후 햇볕이 가장 강한 15시대에 실내 온실 및 수족관 코스를 배치했습니다. 2세 아이의 수면 리듬을 고려하여 14:50 공원 출발 직후 카시트에서 숙면을 취할 수 있도록 30분 거리 구간으로 최적화했습니다."

### [FR-RESULT-004] 제외/대체 후보 안내 ("오늘은 다음으로 남겨둘게요")
추천에서 탈락한 유의미한 후보와 명확한 제외 사유를 노출하여 신뢰성 형성:
* **모가의 숲** [폭염 주의]: "야외 위주 공간으로 오늘 같은 폭염에는 아이가 쉽게 지칠 수 있어 제외했어요." (참조 사진: `/resources/pic/2-1.jpg`)
* **성호호수연꽃단지** [동선 초과]: "동선상 40분이 더 소요되어 저녁 귀가 정체 시간을 넘기게 됩니다."

### [FR-RESULT-005] 코스 제어 액션 & 출발 CTA
* **서브 액션**:
  * `장소 순서 바꾸기`: 순서 재배치 화면 호출.
  * `한 곳 줄이기 (-45분)`: 일정 밀도가 빡빡할 때 최하위 점수 스팟을 즉시 제거하고 여유시간 45분 확보.
* **메인 Sticky CTA**: `이 코스로 하루 시작하기` (터치 시 1번째 장소 내비게이션 연동 및 안내 모드로 전환).

---

## 4.4 화면 4: 장소 상세 (Place Detail) — [design/_2]

### [FR-PLACE-001] 상단 비주얼 & 기본 메타
* **히어로 미디어 배너**:
  * 높이 256px 고해상도 이미지 (장소별 `/resources/pic` 매핑 사진).
  * 사진 위 플로팅 뱃지: 카테고리(`체험·휴식`), 추천연령(`0~4세 최적`), 공간유형(`실내 + 실외`).
  * 장소명 및 주소: 예) **이천농업생태공원 & 라이스카페**, "경기 이천시 모가면 공원로 48".
* **탑바 액션**: 뒤로가기 버튼, 장소 공유하기 버튼.

### [FR-PLACE-002] 현장 실측 검증 카드 (Verification Trust Card)
* **표시 상태**: `현장 실측 검증 완료 (FIELD_VERIFIED)`
* **검증 메타**: 검증일자(`2025.09 에디터 검증`), 신뢰 배지(보증 서클 아이콘).
* **검증 내용 요약**: "주차장 휠체어·유모차 램프 직접 실측, 기저귀 갈이대 온수 수압 및 수유실 정수기·소파 청결 상태를 확인했습니다."

### [FR-PLACE-003] "아이와 가기 체크" 8대 필수 시설 매트릭스
관광 정보보다 최우선 배치되는 영유아 물류 편의 매트릭스 (Tri-State 상태와 구체적 설명 노출):

| 번호 | 시설 항목 | 상태 (State) | 상태 레이블 | 현장 실측 상세 내용 |
|---|---|---|---|---|
| 1 | **유모차 주행** | `YES` | 확인됨 (녹색) | 턱 없는 완경사 램프 시공 및 평지 포장도로 (디럭스/절충형 모두 매우 편안) |
| 2 | **기저귀 갈이대** | `YES` | 확인됨 (녹색) | 쌀문화전시관 1층 독립형 갈이대 구비, 온수 세면대 및 위생 비닐 배치 |
| 3 | **주차 편리성** | `YES` | 확인됨 (녹색) | 150대 무료 전용 주차장, 메인 잔디마당 입구까지 완만하게 도보 2분 |
| 4 | **수유실** | `YES` | 확인됨 (녹색) | 독립 1인 수유 부스 및 안락소파, 이유식 데우기용 전자레인지 비치 |
| 5 | **가족 화장실** | `YES` | 확인됨 (녹색) | 공원 내 가족 전용 다목적 화장실 3개소 (유모차 동반 입장 가능) |
| 6 | **그늘 쉼터** | `YES` | 확인됨 (녹색) | 잔디광장 둘레 대형 느티나무 그늘 벤치 및 파고라 다수 위치 |
| 7 | **아기의자** | `UNKNOWN`| 확인 필요 (황색) | 카페 내 4점 보유 중이나 주말 피크타임(13~15시) 수량 소진 가능성 높음 |
| 8 | **유모차 현장 대여**| `NO` | 지원 안 됨 (회색) | 현장 대여 서비스 미운영 (자차 트렁크에 개인 유모차를 필히 지참하세요) |

### [FR-PLACE-004] 부모 솔직 현장 평 (Parent Honest Review)
* **컨테이너**: 따뜻한 살구색 카드 배경 (`#FDECE7`).
* **내용 예시**: "이천에서 무거운 디럭스 유모차를 끌고 가장 쾌적하게 거닐 수 있는 대표적인 쉼터입니다. 탁 트인 잔디밭과 바닥분수가 시원함을 주며, 걷다가 더워질 때쯤 바로 옆 라이스카페의 시원한 통창 실내에서 쌀 아이스크림과 쌀빵을 함께 나누기 좋습니다. 2세 전후 아기 동반 시 피로도가 가장 적은 안심 코스입니다."

### [FR-PLACE-005] 방문 전 필수 정보 4대 그리드 (2x2 Grid)
1. **적정 체류시간**: `60 ~ 90분` (무리 없는 산책 + 카페 휴식)
2. **운영시간**: `09:30 ~ 18:30` (매주 월요일 정기 휴무)
3. **비용 안내**: `입장료 무료` (카페 음료 및 체험 별도)
4. **추천 날씨**: `맑음 / 다소 더움` (대형 실내 카페 대피 가능)

### [FR-PLACE-006] 위치 및 고속도로 접근성
* 지도 썸네일 프리뷰 + 지번/도로명 주소.
* IC 접근성 안내: `이천IC에서 차로 14분`.

### [FR-PLACE-007] 하단 고정 인터랙션 바 (Bottom Sticky Bar)
* **장소 찜 버튼**: 토글형 북마크 버튼 (아이콘 변경 및 애니메이션 피드백).
* **메인 액션 버튼**: `이 장소를 내 코스에 담기` / `이 장소로 교체` (터치 시 타임라인 반영 및 토스트 피드백).

---

# 5. 미디어 리소스 및 사진 매핑 기능 정의 (Media & Image Specification)

사용자 요구사항에 따라 `/resources/pic` 폴더에 위치한 23종의 고화질 현장 사진을 장소별로 엄격하게 매핑하여 표출한다.

## 5.1 장소별 이미지 파일 매핑 규칙
이미지 파일명 규칙: `{장소ID}-{순번}.jpg`

| 장소 ID | 장소명 (Place Name) | 대표 카테고리 | 연동 이미지 파일 목록 (`/resources/pic`) | 주요 노출 화면 |
|---|---|---|---|---|
| **1** | **미솥지음** | 식당 (솥밥 한정식) | `1-1.jpg`, `1-2.jpg`, `1-3.jpg`, `1-4.jpg`, `1-5.jpg` | 홈 추천지, 타임라인 블록 1, 상세 히어로 및 식음 갤러리 |
| **2** | **모가의 숲** | 자연/정원 (힐링 숲) | `2-1.jpg`, `2-2.jpg`, `2-3.jpg`, `2-4.jpg`, `2-5.jpg` | 제외/대체 장소 카드, 장소 교체 후보 모달, 상세 히어로 |
| **3** | **이천농업생태공원**<br>(이천농업테마공원 + 라이스카페) | 공원/체험/카페 | `3-1.jpg`, `3-2.jpg`, `3-3.jpg`, `3-4.jpg` | 홈 추천지, 타임라인 블록 2, 상세 히어로 및 덱길 갤러리 |
| **4** | **이천시환경학습관** | 실내 식물원/수족관 | `4-1.jpg`, `4-2.jpg`, `4-3.jpg`, `4-4.jpg`, `4-5.jpg` | 타임라인 블록 3, 우천/폭염 대체 모달, 상세 히어로 |
| **5** | **을를 (Cafe Eulele)** | 카페 (잔디마당 베이커리)| `5-1.jpg`, `5-2.jpg`, `5-3.jpg`, `5-4.jpg` | 타임라인 블록 4, 부모 휴식 추천 카드, 상세 히어로 |

## 5.2 화면별 이미지 표출 정책
1. **타임라인 카드 썸네일**:
   * 각 장소의 대표 이미지 1번(`{ID}-1.jpg`)을 기본 16:9 비율로 로딩.
   * `object-fit: cover` 및 부드러운 스켈레톤 로딩 적용.
2. **장소 상세 히어로 & 갤러리**:
   * 상단 히어로 배너: `{ID}-1.jpg` (고해상도).
   * 상세 갤러리(선택 구현): `{ID}-2.jpg` ~ `{ID}-N.jpg`를 가로 스크롤 캐러셀로 제공하여 유모차 주행로, 화장실 입구, 테이블 간격 등을 시각적으로 확인 가능하도록 지원.
3. **대체/제외 장소 카드**:
   * `{ID}-1.jpg`를 80x80px 둥근 사각형 썸네일로 표출.
4. **접근성(Alt) 텍스트 필수화**:
   * 모든 이미지 태그에는 영유아 이동 관점의 설명(예: "미솥지음의 넓은 원목 테이블과 유모차 거치 공간", "이천농업생태공원의 유모차 진입이 가능한 완경사 목재 덱길")을 필수로 지정.

---

# 6. 데이터 모델 및 스키마 (Data Models & Types)

## 6.1 기본 열거형 타입 (Core Enums)
```ts
export type TriState = "YES" | "NO" | "UNKNOWN";

export type TransportType = "CAR" | "PUBLIC_TRANSPORT";

export type IndoorOutdoorType = "INDOOR" | "OUTDOOR" | "MIXED";

export type VerificationStatus =
  | "FIELD_VERIFIED"     // 현장 직접 실측 및 검증 완료
  | "OFFICIAL"           // 지자체/시설 공식 발표 데이터
  | "WEB_VERIFIED"        // 사업자 포털 및 웹사이트 확인
  | "USER_REPORTED"       // 사용자 제보 접수
  | "UNVERIFIED";         // 미확인 (확인 필요)

export type PlaceCategory =
  | "RESTAURANT"
  | "CAFE"
  | "NATURE"
  | "PARK"
  | "EXPERIENCE"
  | "INDOOR"
  | "OTHER";

export type TravelStyle =
  | "NATURE"
  | "PARENT_REST"
  | "LOCAL_FOOD"
  | "EXPERIENCE"
  | "INDOOR"
  | "PHOTO";
```

## 6.2 데이터 출처 및 증거 모델 (Provenance & Evidence)
```ts
export interface EvidenceValue<T> {
  value: T;
  sourceType: "FIELD_VISIT" | "OFFICIAL" | "PUBLIC_DATA" | "WEB_PAGE" | "UNKNOWN";
  sourceRef?: string;        // 답사 기록 ID 또는 공식 URL
  verifiedAt?: string;       // YYYY-MM-DD
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  note?: string;             // 구체적인 현장 관찰 코멘트
}
```

## 6.3 장소 엔티티 모델 (Place Entity)
```ts
export interface Place {
  id: string;                      // "1", "2", "3", "4", "5", "6", "7"
  name: string;                    // 장소명
  category: PlaceCategory;
  address: string;
  roadAddress?: string;
  lat: number;
  lng: number;

  // 소요 및 운영 시간
  recommendedDurationMin: number;  // 기본 체류시간 (분)
  recommendedDurationMax?: number;
  openingHours: {
    open: string;                  // "09:30"
    close: string;                 // "18:30"
    closedDays: number[];          // 0(일) ~ 6(토), 예: [1] (월요일)
  };

  // 8대 영유아 필수 편의시설 (Evidence 기반 Tri-State)
  parking: EvidenceValue<TriState>;
  strollerAccessible: EvidenceValue<TriState>;
  nursingRoom: EvidenceValue<TriState>;
  diaperChangingStation: EvidenceValue<TriState>;
  babyChair: EvidenceValue<TriState>;
  toilet: EvidenceValue<TriState>;
  shade: EvidenceValue<TriState>;
  strollerRental: EvidenceValue<TriState>;

  // 공간 특성 및 권장 연령
  indoorOutdoor: IndoorOutdoorType;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  weatherTags: Array<"HOT_OK" | "HOT_AVOID" | "RAIN_OK" | "RAIN_AVOID">;

  // 미디어 자산 연동 (/resources/pic)
  imageFiles: string[];            // ["/resources/pic/1-1.jpg", "/resources/pic/1-2.jpg", ...]
  thumbnailImage: string;          // "/resources/pic/1-1.jpg"

  // 신뢰 검증 메타데이터
  verificationStatus: VerificationStatus;
  verifiedDate: string;
  editorialReview?: string;        // 부모를 위한 솔직한 현장 평
  recommendationReason?: string;   // 기본 추천 사유 템플릿
}
```

## 6.4 여행 입력 모델 (TripInput)
```ts
export interface TripInput {
  origin: string;                  // 출발지 (예: "서울 구로구 신도림")
  childAgeMonths: number;          // 17
  displayAge: string;              // "2세"
  strollerRequired: boolean;       // true
  travelDate: string;              // "2025-09-05"
  departureTime: string;           // "10:00"
  arrivalInIcheon: string;         // "12:00" (출발지 기준 산정)
  desiredDepartureFromIcheon: string; // "17:30"
  transport: TransportType;        // "CAR"
  styles: TravelStyle[];           // ["NATURE", "PARENT_REST"]

  // 선택 조건
  napTimeStart?: string;           // "13:30"
  napTimeEnd?: string;             // "15:00"
  includeLunch: boolean;           // true (default)
  parentRestPriority: "LOW" | "MEDIUM" | "HIGH"; // "HIGH"
  preferIndoor?: boolean;          // false
}
```

## 6.5 일정 및 타임라인 블록 모델 (Itinerary & Block)
```ts
export type BlockType = "PLACE" | "MEAL" | "CAFE" | "REST" | "TRAVEL" | "DEPARTURE";

export interface ItineraryBlock {
  id: string;
  type: BlockType;
  order: number;
  startTime: string;               // "12:00"
  endTime: string;                 // "13:00"
  durationMin: number;             // 60
  placeId?: string;
  place?: Place;
  title: string;
  subtitle?: string;
  badges?: string[];
  recommendationReason?: string;
  transitNote?: string;            // 이동 블록용 코멘트 (예: "아기 낮잠 타이밍 추천 😴")
}

export interface Itinerary {
  id: string;
  blocks: ItineraryBlock[];
  totalDurationMin: number;        // 전체 소요시간 (분)
  totalTravelMin: number;          // 순수 이동시간 (분)
  totalStayMin: number;            // 장소 체류시간 (분)
  bufferMin: number;               // 승하차 + 영유아 버퍼 합계
  slackMin: number;                // 잔여 여유시간
  status: "RELAXED" | "FEASIBLE" | "TIGHT"; // 일정 과밀도 상태
  reasons: string[];               // 추천 근거 리스트
  excludedPlaces: Array<{
    place: Place;
    reason: string;
    tag: string;
  }>;
}
```

---

# 7. 추천 및 스케줄링 규칙 (Recommendation & Scheduling Core Engine)

## 7.1 Hard Constraints (절대 배제 규칙)
후보 장소 중 아래 조건 중 하나라도 해당하면 1차 필터링에서 즉시 배제한다:
1. **정기 휴무일**: `Place.openingHours.closedDays`에 `TripInput.travelDate` 요일이 포함된 경우.
2. **운영시간 미충족**: 장소의 개장시간이 `Trip Window` 전체와 겹치지 않는 경우.
3. **유모차 필수 시 불가지 배제**: `TripInput.strollerRequired === true`이고 `Place.strollerAccessible.value === "NO"`인 경우. (`UNKNOWN`은 배제하지 않고 감점 및 확인필요 경고 처리).
4. **전체 시간 초과**: 필수 식사 및 장소 최소 체류시간 합계가 `Trip Window`를 물리적으로 초과하는 경우.

## 7.2 Soft Score 점수 산출 규칙 (총 100점 만점)
모든 후보 장소는 아래 6개 항목의 합산 점수를 부여받는다:
```text
Total Place Score =
    아이 연령 적합성 (Age Fit)       : 25점
  + 영유아 편의시설 (Facility Score) : 25점
  + 이동 동선 효율 (Transit Fit)     : 20점
  + 날씨 적합도 (Weather Fit)       : 15점
  + 이천 지역 특성 (Local Identity)  : 10점
  + 부모 휴식 가치 (Parent Rest)     :  5점
  -----------------------------------------
  합계                             : 100점
```
* **연령 적합성(25점)**: 장소의 권장 개월수(`ageMinMonths` ~ `ageMaxMonths`)에 `TripInput.childAgeMonths`가 포함되면 25점 만점.
* **편의시설(25점)**:
  * 수유실 `YES` (+7점), 기저귀대 `YES` (+7점), 주차 `YES` (+6점), 아기의자 `YES` (+5점).
  * 유모차 필수 조건에서 유모차가 `UNKNOWN`인 경우 -5점 감점 페널티.
* **날씨 적합도(15점)**: 무더위(30℃ 이상) 예보 시 야외 장소 -10점 감점, 실내/온실 장소 +15점 만점.
* **부모 휴식(5점)**: `parentRestPriority === 'HIGH'`일 때 카페/쉼터 장소에 가중치 부여.

## 7.3 스케줄링 시간 계산 규칙 (Scheduling Rules)
* **식사 시간(Meal)**: 기본 60분 (점심 포함 옵션 시 12:00~13:00 고정 배치).
* **카페 및 휴식(Cafe/Rest)**: 기본 30~45분.
* **일반 장소 체류시간**: 장소별 `recommendedDurationMin` 적용 (미솥지음 60분, 공원 90분, 환경학습관 40분, 을를 45분).
* **주차 및 승하차 버퍼**: 장소당 기본 10분 강제 가산.
* **영유아 버퍼**: 2세 이하 영유아의 경우 활동 시간 90분마다 +15분 추가 버퍼 자동 부여.
* **최대 연속 야외 활동 제한**: 2세 이하 기준 야외 연속 활동이 90분을 초과할 수 없음 (초과 시 실내 장소 또는 카페 블록 의무 삽입).

## 7.4 최대 방문 장소 수 제한 (Stop Limit)
* **0~2세 (영아 및 24개월 전후)**: **최대 3~4개 블록 (식사/카페 포함)**.
  * 반나절(5~6시간) 일정에서 5곳 이상 추천 절대 금지.
* **3~5세**: 최대 4개 블록.
* **6세 이상**: 최대 4~5개 블록.

## 7.5 일정 밀도 및 Slack Time 계산 (Density & Warning)
* **Slack Time 계산식**:
  $$\text{Slack Time} = \text{Trip Window} - (\sum \text{체류시간} + \sum \text{이동시간} + \text{식사시간} + \sum \text{버퍼})$$
* **상태 판정**:
  * $\text{Slack Time} \ge 40\text{분}$: `RELAXED` (무리 없는 안심 일정)
  * $20\text{분} \le \text{Slack Time} < 40\text{분}$: `FEASIBLE` (보통 일정)
  * $\text{Slack Time} < 20\text{분}$: `TIGHT` (과밀 일정 경고 발생)
* **과밀 경고 시 액션 제공**:
  * 단순 텍스트 경고에 그치지 않고, `한 곳 줄이기 (-45분)` 원클릭 액션을 제공하여 최하위 우선순위 장소를 제거하고 Slack Time을 40분 이상으로 즉시 회복시키는 기능 제공.

---

# 8. Seed 장소 데이터 및 미디어 리포지토리 정의 (Seed Place Repository)

초기 MVP 추천 엔진 구동 및 검증을 위해 아래 7개 장소의 정형 데이터와 `/resources/pic` 미디어를 연결한다.

```ts
export const SEED_PLACES: Place[] = [
  {
    id: "1",
    name: "미솥지음",
    category: "RESTAURANT",
    address: "경기 이천시 신둔면 원적로 85",
    lat: 37.3195,
    lng: 127.4112,
    recommendedDurationMin: 60,
    openingHours: { open: "11:00", close: "20:30", closedDays: [2] }, // 화 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "광폭 전용 주차장 구비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "단차 없는 진입로 및 넓은 테이블 간격" },
    nursingRoom: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "전용 수유실 미확인" },
    diaperChangingStation: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT", note: "아기의자 8개 보유 확인" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 남녀 분리 화장실" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 완비" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "INDOOR",
    ageMinMonths: 12,
    ageMaxMonths: 48,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/1-1.jpg",
      "/resources/pic/1-2.jpg",
      "/resources/pic/1-3.jpg",
      "/resources/pic/1-4.jpg",
      "/resources/pic/1-5.jpg"
    ],
    thumbnailImage: "/resources/pic/1-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "아이와 함께 먹기 좋은 부드러운 쌀밥과 자극 없는 반찬. 유모차 동반 식사에 최적화되어 있습니다.",
    recommendationReason: "이천 도착 직후 바로 식사하며 아이 컨디션과 허기를 달래기 좋아요."
  },
  {
    id: "2",
    name: "모가의 숲",
    category: "NATURE",
    address: "경기 이천시 모가면 진상미로 1163번길",
    lat: 37.1524,
    lng: 127.4681,
    recommendedDurationMin: 60,
    openingHours: { open: "10:00", close: "18:00", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "야외 주차장 구비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "자연 흙길 및 완경사 산책로" },
    nursingRoom: { value: "NO", sourceType: "FIELD_VISIT", note: "독립 수유실 부재" },
    diaperChangingStation: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    babyChair: { value: "NO", sourceType: "FIELD_VISIT", note: "야외 벤치 위주" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "공용 화장실" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "숲 그늘 다수" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "OUTDOOR",
    ageMinMonths: 24,
    ageMaxMonths: 72,
    weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    imageFiles: [
      "/resources/pic/2-1.jpg",
      "/resources/pic/2-2.jpg",
      "/resources/pic/2-3.jpg",
      "/resources/pic/2-4.jpg",
      "/resources/pic/2-5.jpg"
    ],
    thumbnailImage: "/resources/pic/2-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "자연 친화적 숲길로 날씨가 선선할 때 최고의 쉼터이지만 폭염 시에는 아이가 지칠 수 있습니다.",
    recommendationReason: "자연 속에서 아이와 여유롭게 흙과 나무를 만끽하기 좋은 장소입니다."
  },
  {
    id: "3",
    name: "이천농업생태공원", // (PRD 및 디자인상 이천농업테마공원 + 라이스카페)
    category: "PARK",
    address: "경기 이천시 모가면 공원로 48",
    lat: 37.1583,
    lng: 127.4729,
    recommendedDurationMin: 90,
    openingHours: { open: "09:30", close: "18:30", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "150대 무료 전용 주차장, 도보 2분" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "턱 없는 완경사 램프 및 덱길" },
    nursingRoom: { value: "YES", sourceType: "FIELD_VISIT", note: "독립 1인 수유부스, 소파, 전자레인지 구비" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "쌀문화전시관 1층 독립형 갈이대 및 온수" },
    babyChair: { value: "UNKNOWN", sourceType: "FIELD_VISIT", note: "라이스카페 내 4개 보유하나 혼잡 시 확인 필요" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "가족 전용 다목적 화장실 3개소" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "느티나무 그늘 및 파고라 다수" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "현장 대여 미운영" },
    indoorOutdoor: "MIXED",
    ageMinMonths: 0,
    ageMaxMonths: 48,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/3-1.jpg",
      "/resources/pic/3-2.jpg",
      "/resources/pic/3-3.jpg",
      "/resources/pic/3-4.jpg"
    ],
    thumbnailImage: "/resources/pic/3-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "디럭스 유모차를 끌고 가장 쾌적하게 거닐 수 있는 대표 쉼터. 공원 내 라이스카페가 결합되어 휴식 편의 우수.",
    recommendationReason: "완만한 덱길로 유모차 주행이 쾌적하며, 공원 내 실내 라이스카페에서 쌀아이스크림과 함께 쉴 수 있어요."
  },
  {
    id: "4",
    name: "이천시환경학습관",
    category: "INDOOR",
    address: "경기 이천시 호법면 중부대로 798번길",
    lat: 37.2341,
    lng: 127.4285,
    recommendedDurationMin: 40,
    openingHours: { open: "10:00", close: "17:00", closedDays: [1] }, // 월 휴무
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "전용 주차 공간 완비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "엘리베이터 완비 및 경사로 관람 가능" },
    nursingRoom: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT", note: "장애인/가족 화장실 내 구비" },
    babyChair: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 쾌적 화장실" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "100% 실내 냉방" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "INDOOR",
    ageMinMonths: 12,
    ageMaxMonths: 72,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/4-1.jpg",
      "/resources/pic/4-2.jpg",
      "/resources/pic/4-3.jpg",
      "/resources/pic/4-4.jpg",
      "/resources/pic/4-5.jpg"
    ],
    thumbnailImage: "/resources/pic/4-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "더운 한낮에 물고기와 아열대 식물을 시원한 실내에서 관람할 수 있어 아기에게 자극이 적고 쾌적함.",
    recommendationReason: "무더운 오후 시간대 실내에서 시원하게 물고기와 식물을 관찰할 수 있는 쾌적한 쉼표 장소입니다."
  },
  {
    id: "5",
    name: "을를 (Cafe Eulele)",
    category: "CAFE",
    address: "경기 이천시 율면 임오산로 372",
    lat: 37.1121,
    lng: 127.5218,
    recommendedDurationMin: 45,
    openingHours: { open: "11:00", close: "20:00", closedDays: [] }, // 연중무휴
    parking: { value: "YES", sourceType: "FIELD_VISIT", note: "대형 전용 주차장 구비" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT", note: "잔디마당 및 1층 진입로 평지" },
    nursingRoom: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    diaperChangingStation: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "확인 필요" },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT", note: "아기의자 다수 구비" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 화장실 청결" },
    shade: { value: "YES", sourceType: "FIELD_VISIT", note: "실내 냉방 및 야외 그늘막" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT", note: "대여 미운영" },
    indoorOutdoor: "MIXED",
    ageMinMonths: 0,
    ageMaxMonths: 84,
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: [
      "/resources/pic/5-1.jpg",
      "/resources/pic/5-2.jpg",
      "/resources/pic/5-3.jpg",
      "/resources/pic/5-4.jpg"
    ],
    thumbnailImage: "/resources/pic/5-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05",
    editorialReview: "넓은 잔디밭과 감성적인 건축이 조화로운 카페. 귀가 전 부모가 커피 한 잔으로 에너지를 충전하기 최적.",
    recommendationReason: "집으로 출발하기 전 부모가 커피 한 잔과 함께 한숨 돌리는 마지막 충전 시간입니다."
  },
  {
    id: "6",
    name: "라이스카페 (이천농업생태공원 내)",
    category: "CAFE",
    address: "경기 이천시 모가면 공원로 48",
    lat: 37.1583,
    lng: 127.4729,
    recommendedDurationMin: 30,
    openingHours: { open: "10:00", close: "18:00", closedDays: [1] },
    parking: { value: "YES", sourceType: "FIELD_VISIT" },
    strollerAccessible: { value: "YES", sourceType: "FIELD_VISIT" },
    nursingRoom: { value: "YES", sourceType: "FIELD_VISIT" },
    diaperChangingStation: { value: "YES", sourceType: "FIELD_VISIT" },
    babyChair: { value: "YES", sourceType: "FIELD_VISIT" },
    toilet: { value: "YES", sourceType: "FIELD_VISIT" },
    shade: { value: "YES", sourceType: "FIELD_VISIT" },
    strollerRental: { value: "NO", sourceType: "FIELD_VISIT" },
    indoorOutdoor: "INDOOR",
    weatherTags: ["HOT_OK", "RAIN_OK"],
    imageFiles: ["/resources/pic/3-1.jpg"],
    thumbnailImage: "/resources/pic/3-1.jpg",
    verificationStatus: "FIELD_VERIFIED",
    verifiedDate: "2025-09-05"
  },
  {
    id: "7",
    name: "성호호수연꽃단지",
    category: "NATURE",
    address: "경기 이천시 설성면 장천리",
    lat: 37.1082,
    lng: 127.5684,
    recommendedDurationMin: 45,
    openingHours: { open: "00:00", close: "24:00", closedDays: [] },
    parking: { value: "YES", sourceType: "WEB_PAGE" },
    strollerAccessible: { value: "UNKNOWN", sourceType: "UNKNOWN", note: "비포장 구간 존재 가능" },
    nursingRoom: { value: "NO", sourceType: "WEB_PAGE" },
    diaperChangingStation: { value: "NO", sourceType: "WEB_PAGE" },
    babyChair: { value: "NO", sourceType: "WEB_PAGE" },
    toilet: { value: "UNKNOWN", sourceType: "UNKNOWN" },
    shade: { value: "NO", sourceType: "WEB_PAGE", note: "땡볕 구간 다수" },
    strollerRental: { value: "NO", sourceType: "WEB_PAGE" },
    indoorOutdoor: "OUTDOOR",
    weatherTags: ["HOT_AVOID", "RAIN_AVOID"],
    imageFiles: [],
    thumbnailImage: "",
    verificationStatus: "UNVERIFIED",
    verifiedDate: "",
    recommendationReason: "동선이 멀고 그늘이 부족하여 당일치기 2세 코스에서는 배제 권장."
  }
];
```

---

# 9. 코스 수정 및 실시간 재계산 (Itinerary Editing & Recalculation)

## [FR-EDIT-001] 장소 교체 기능 (Replace Place)
1. 사용자가 타임라인 카드에서 `장소 교체` 선택.
2. 시스템은 교체 대상 장소를 제외하고 동일한 카테고리/시간대의 대체 후보 리스트를 PlaceRepository에서 조회.
3. 기존 여행 조건(유모차, 시간, 연령, 날씨)을 동일하게 적용하여 대체 장소별 예상 체류시간, 추가 이동시간, 유모차/주차 여부 노출.
4. 사용자가 새 장소 선택 시 타임라인 즉시 갱신 및 전체 소요시간 재계산.

## [FR-EDIT-002] 장소 삭제 기능 (Remove Place)
1. 사용자가 특정 장소 삭제 시 해당 블록을 즉시 제거.
2. 이후 장소들의 시작/종료시간을 앞당기거나, 비어 있는 시간(Slack Time)을 여유시간으로 자동 편입.
3. 전체 이동시간 및 Slack Time을 재평가하여 Feasibility 배지를 `RELAXED`로 갱신.

## [FR-EDIT-003] 한 곳 줄이기 기능 (Reduce One Stop)
1. `TIGHT` 과밀 상태이거나 사용자가 여유로운 일정을 원해 `한 곳 줄이기 (-45분)` 클릭 시 동작.
2. 추천 알고리즘상 점수가 가장 낮거나 이동 거리 소모가 큰 장소 1곳(예: 마지막 카페 또는 3번째 관람지)을 선제적으로 추천 및 제거.
3. 즉시 40분 이상의 Slack Time을 확보하여 안심 상태로 복구.

## [FR-EDIT-004] 순서 변경 기능 (Reorder Sequence)
1. 드래그 앤 드롭 또는 상/하 화살표로 장소 순서 변경.
2. 순서 변경 즉시 장소 간 이동시간 행렬(Travel Matrix)을 재조회하여 전체 일정이 `Trip Window` 내에 들어오는지 재검증.

---

# 10. 품질 보증 및 골든 시나리오 명세 (QA & Verification Spec)

## [FR-QA-001] 김민지 가족 필수 골든 테스트 (Golden Scenario)
* **입력 데이터**:
  ```json
  {
    "origin": "서울 신도림",
    "childAgeMonths": 17,
    "displayAge": "2세",
    "strollerRequired": true,
    "arrivalInIcheon": "12:00",
    "desiredDepartureFromIcheon": "17:30",
    "includeLunch": true,
    "weather": "무더움 (31℃)",
    "transport": "CAR"
  }
  ```
* **기대 결과 (Expected Output)**:
  1. 5개 장소 강제 추천 금지 $\rightarrow$ **3~4개 블록(미솥지음, 이천농업생태공원+라이스카페, 이천시환경학습관, 을를) 생성**.
  2. 첫 번째 블록은 12:00~13:00 미솥지음(점심 60분) 배치.
  3. 이동 버퍼(10분) 및 영유아 버퍼가 시간 계산에 포함되어 총 이동+버퍼가 1시간 10분 이상 확보됨.
  4. 오후 2시대 공원 $\rightarrow$ 학습관 이동 구간에 아기 낮잠 타이밍 안내 칩 노출.
  5. 15시대 학습관은 실내 온실로 무더위 회피 성공.
  6. 모가의 숲은 "폭염 주의" 사유로, 성호호수는 "동선 초과" 사유로 제외 목록에 명시.
  7. UNKNOWN 상태의 편의시설(미솥지음 기저귀대 등)은 `? 확인 필요`로 정확히 표기되고 YES로 둔갑하지 않음.

## [FR-QA-002] Pairwise 독립 변수 영향 검증 (Traceability Test)
* **2세 vs 7세**: 2세는 3~4개 블록 권장 및 영유아 버퍼 가산, 7세는 4~5개 블록 및 체험 가중치 부여.
* **유모차 ON vs OFF**: ON일 때 계단 위주 장소 배제, OFF일 때 산책로 선택지 확장.
* **실내 선호 ON vs OFF**: ON일 때 실내 학습관 및 대형 카페 우선 순위 상향.

## [FR-QA-003] 디버그 메타데이터 노출 (Debug Metadata)
개발/QA 모드(`?debug=true`)에서는 추천 결과 JSON에 아래 데이터를 첨부하여 추적성을 검증할 수 있어야 한다:
```json
{
  "debug": {
    "includedReason": ["AGE_FIT", "STROLLER_OK", "WEATHER_INDOOR"],
    "excludedReason": [{"id": "2", "reason": "HOT_AVOID"}, {"id": "7", "reason": "DETOUR_EXCESS"}],
    "scoreBreakdown": { "1": 92, "3": 95, "4": 88, "5": 84 },
    "timeBreakdown": { "stayMin": 235, "travelMin": 65, "bufferMin": 30, "slackMin": 40 }
  }
}
```

---

# 11. 비기능적 요구사항 (Non-Functional Requirements)

## [FR-NFR-001] 성능 (Performance)
* 초기 랜딩 페이지 LCP(Largest Contentful Paint) $\le$ 2.5초.
* 로컬 Seed Place Repository 기준 코스 추천 및 재계산 연산 완료 시간 $\le$ 300ms (최대 1초 이내).
* 이미지 자산: WebP/최적화 JPG 사용 및 뷰포트 외 이미지 Lazy Loading 적용.

## [FR-NFR-002] 모바일 사용성 및 접근성 (Mobile Usability & Accessibility)
* 모바일 터치 타깃 최소 `44px x 44px` 준수.
* 주요 CTA 버튼 높이 `52px` 및 엄지손가락 영역(화면 하단 40%) 배치.
* 아이콘 단독 표출 금지 $\rightarrow$ 반드시 텍스트 레이블 병기.
* 색상 단독 정보 전달 금지 $\rightarrow$ `✓ 확인됨`, `? 확인 필요`, `× 없음` 기호 병기.

## [FR-NFR-003] 디자인 시스템 토큰 준수 (Design System Alignment)
* Primary Color: Sage Green (`#4A7C59` / `#316342`), Canvas: Oatmeal White (`#FAF9F5` / `#FCF9F8`).
* Accent: Warm Apricot Coral (`#E77F67`), Typography: `Plus Jakarta Sans` (숫자/시간) + `Noto Sans KR` (한글).
* Korean Typography Polish: `word-break: keep-all;`, 자간 `-0.01em` 적용.

## [FR-NFR-004] 개인정보 보호 (Privacy)
* 회원가입 및 로그인 없이 전 기능 이용 가능.
* 정밀 GPS 위치 권한 강제 팝업 금지 (출발지 텍스트 선택 지원).
* 민감 개인정보(자녀 실명, 주민번호 등) 수집 금지.

---

# 12. 구현 소스 우선순위 및 개발 가이드 (Source of Truth Rules)

Antigravity 엔지니어링 에이전트는 본 FRD를 기준으로 구현을 진행하며, 상충 발생 시 다음 우선순위를 적용한다:
```text
1. PRD (docs/PRD_bebeload.md) — 제품 핵심 가치 및 정책 원칙
2. FRD (docs/FRD_bebeload.md) — 화면/로직 상세 기능 단위 및 이미지 매핑 정의 (본 문서)
3. DESIGN_SPEC (design/icheon_bebe_road/DESIGN.md & design/ HTML/CSS 시안) — 시각 및 컴포넌트 토큰
4. 기존 코드베이스 및 리소스 (/resources/pic)
```

**개발 금지 사항 (Strict Prohibitions)**:
1. 추천 알고리즘 내에 특정 장소명을 `if (name === '미솥지음')` 형태로 하드코딩 금지.
2. `UNKNOWN` 편의시설 정보를 임의로 `YES`로 가정하여 표시하는 행위 금지.
3. 2세 이하 영유아 반나절 코스에 5개 이상의 무리한 장소를 기본 추천하는 행위 금지.
4. UI에만 있고 실제 로직에 아무 영향도 미치지 않는 더미 입력 필드 방치 금지.
5. `/resources/pic` 폴더의 사진 번호 규칙(1: 미솥지음, 2: 모가의 숲, 3: 이천농업생태공원, 4: 이천시환경학습관, 5: 을를)을 위반하여 다른 장소 사진을 교차 표출하는 행위 금지.
