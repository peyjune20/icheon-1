# Codex 작업 진행 상태

## 현재 목표

2026-09-21 요청: 선택 옵션과 추천 일치, 실제 지도, 장소별 색칠 마을, 접이식 스탬프, 코스 추가/삭제, 공식 정보 보강, 사용자 장소/사진 저장. 검증한 변경을 기존 GitHub와 Sites에 반영.

## 완료한 작업

- 실제 월령·선택값·생성 코스로 추천 태그 계산. 5세 선택에 2세 문구가 나오던 문제 수정.
- 연령/날씨별 장소 수, 휴식 시간 반영. 서울·17:30 고정 귀가 제거. 이천 내 체류+장소 간 이동 합계/종료 예상 표시.
- 접이식 후보 검색/추가, 중복 방지, 마지막 1곳 유지. 상세 페이지에서 현재 조건/방문 순서를 유지해 코스에 추가. 계정 저장과 코스 링크 복사.
- 컬러 마을 배경 + 장소별 30개 조형물 그림자/색칠. 역할별 방문수/전체수. 테마별 접이식 30개 스탬프, 날짜 수정/해제.
- 목록 밖 장소 검색/직접 등록/삭제/상세 페이지. 방문 사진 업로드/캡션/삭제. 계정별 비공개 D1/R2 저장, 권한 분리.
- 공식 안내 기반 정보/시설 출처 보강. 주소·좌표 교정. 영업 중단/공식 미확인 후보는 자동 추천과 추가·교체에서 제외.
- 실제 OSM 지도 및 도로 경로, 미검증 좌표는 실제 주소 검색 지도 사용. 카카오 SDK 연결 대응. 전체 길찾기는 첫 장소→경유지→마지막 장소로 분리.
- AI 배지 크기 통일. 근거 없는 만족도·냉방·시설·요금 단정 제거.

## 수정한 파일

- src/domain, src/application, src/adapters/travel-time: 추천/입력/일정 계산.
- src/infrastructure/data/place-research.data.ts: 공식 자료 사실/좌표/출처.
- src/components/shared/PlaceMap.tsx, src/features/place-detail: 지도/방문정보/시설/사진/코스 담기.
- src/features/custom-places, src/app/my-place, src/app/places: 사용자 장소 관리.
- src/features/itinerary/active-course.ts: 화면 이동 중 임시 편집 초안. 영구 코스 저장은 D1.
- src/features/tour-stamps, src/app/my-trip: 조형물 마을/스탬프/저장 코스.
- src/server/worker.ts, db/schema.ts, drizzle, wrangler.json, scripts/build-worker.mjs, .openai/hosting.json: Worker + D1/R2.
- scripts/verify-itinerary.ts, verify.mjs, verify-local-api.mjs: 회귀 검증.
- public/assets/village-background.png, village-sprites.png: AI 생성 장식 배경/투명 조형물.
- package.json, package-lock.json, .gitignore, docs/IMAGE_CREDITS.md: 의존성/비밀값 제외/출처 보충.

## 현재 구현 상태

- 코드 구현 및 로컬 빌드/검증 완료. GitHub main과 Sites 소스 저장소에 동일 커밋 push 완료.
- 배포 성공: https://icheon-bebe-road.grayngell.chatgpt.site (버전 10).
- 배포 소스: 3c6c862ecb570fead2bcba45c059c371d4b086f7.
- Sites 배포 ID: appgdep_6ab0291c12348191984cb81323044786. succeeded, 2026-09-20T18:42:58Z.
- 저장 버전 ID: appgprj_6aa9fce8b9288191b87e53bf36e0521c~appgver_c1ac0a8b04148191bcca76b9a4d1ea20.
- localhost:3001은 Wrangler 세션 5866. dist/client + dist/server/index.js.
- 로컬 D1 마이그레이션 0000, 0001 적용 완료. 생산 배포도 성공(마이그레이션 포함).
- hosting.json 논리 바인딩은 문자열 d1=DB, r2=BUCKET (Sites 계약 테스트로 확인).
- 인증은 Sites 신뢰 헤더 oai-authenticated-user-id. 익명 기본 탐색/추천 가능, 새 장소/사진/영구 코스 저장은 로그인 필요.
- 기존 찜/스탬프는 기존 브라우저 저장 방식 보존 및 화면 고지. 새 장소/사진/코스는 계정 저장.

## 확인 완료

- npm run build: 39 페이지 생성, 타입/빌드 성공. Worker 번들 생성 성공.
- node scripts/verify.mjs: 30곳, 실제 5세 태그, 연령/날씨별 개수, 점심 제외, 추가/제거/중복 방지, 운영미확인 제외, 합계, 경유 순서, 스탬프 날짜 수정/해제 통과.
- node scripts/verify-local-api.mjs: 비로그인 401, Origin 403, 입력 400, 내 장소 CRUD, 다른 계정 접근 차단, R2 업로드/조회, 잘못된 이미지 차단, 코스 저장, 요청 크기 제한 통과. localhost 합성 데이터만 사용/정리.
- 브라우저: 5세/점심 제외/낮잠 없음/휴식 20분 반영. 후보 추가 후 개수와 종료 시각 재계산.
- 브라우저: 컬러 배경/30개 그림자, 모바일 테마별 스탬프 펼침과 날짜 입력.
- 브라우저: 에덴파라다이스 주소 지도, 설봉공원 실제 위치, 농업공원→라이스카페→성호호수 실제 도로 경로 렌더링.
- 브라우저 오류 로그 없음. git diff --check 통과.
- 최신 빌드 재탐색 후 상세에서 장소 추가 시 age=60 등 모든 조건과 기존 3곳이 유지되어 4곳으로 연결됨.
- 배포 패키지의 Worker/정적 출력/바인딩/마이그레이션 검증 완료. 플랫폼 배포 성공 응답 확인.

## 발견된 문제

- 카카오 JavaScript/REST 키 없음. 현재 OSM/Google 주소 지도와 카카오 외부 링크 사용. 카카오 SDK 실서비스 검증은 키 제공 후 가능.
- 일부 기존 좌표는 근거 없는 값. 확인된 공식 좌표만 정밀 핀, 나머지는 주소 검색 지도. Google 한국 자동차 경로/주소 정확도 한계는 화면 고지.
- 농업테마공원과 라이스카페는 같은 공원 대표 좌표라 마커가 겹칠 수 있음. 실제 카페 입구 좌표는 확인 필요.
- 별빛정원우주: 한국관광공사 영업 중단 안내. 이천치유의숲: 공식 장소 특정 못함. 목록 이력 유지하되 추천 제외.
- 운영/유아시설 미확인 정보는 추측하지 않고 미확인 표시와 공식 확인 링크 유지.
- Sites build helper의 Windows npm 경로 오류로 npm run build 직접 실행.
- package helper의 bash PATH/Windows tar 경로 문제: Git Bash로 공식 package-site.sh 실행, archive는 /c/... 형식 사용.
- 기존 Next 14.2.15 보안 경고 존재. 현재 배포는 정적 Next 출력+별도 Worker이며 Next 서버 런타임은 배포하지 않음. 범위 외 대규모 업그레이드 미실시.

## 미완료 작업

- 카카오 키 설정/등록 도메인 확인 후 SDK 지도 검증 (사용자 설정 필요).
- 실서비스 로그인 계정의 실제 사진/장소 업로드는 사용자 자료를 임의 생성하지 않아 미실행. 로컬 계정 격리 API 테스트는 통과.

## 다음 작업

1. 카카오 키가 제공되면 사이트 런타임 KAKAO_MAP_KEY / KAKAO_REST_API_KEY 설정. JS 키에 사이트 도메인 등록 확인.
2. 모든 장소의 Kakao 주소 검색 및 전체 코스 SDK 렌더링 검증. 현재는 실제 주소/OSM 대체 지도 사용.
3. 필요 시 로그인 사용자 본인의 장소/사진 저장 실서비스 테스트. 기존 기록을 삭제하거나 테스트 사진을 임의 업로드하지 말 것.
4. 농업공원 내 라이스카페 정확한 입구 좌표 확보 시 공원 대표 좌표를 교정.

## 다음 세션 시작 위치

- CODEX_PROGRESS.md와 git status 비교.
- PlaceMap.tsx: 실제 좌표/주소 fallback. 키는 KAKAO_MAP_KEY 또는 NEXT_PUBLIC_KAKAO_MAP_KEY; 검색 서버는 KAKAO_REST_API_KEY.
- worker.ts: /api/config, /api/places, /api/search, /api/photos, /api/plan.
- Sites project appgprj_6aa9fce8b9288191b87e53bf36e0521c, 기존 custom 접근 권한 보존.
- GitHub origin https://github.com/peyjune20/icheon-1.git, main.
- CUA 로컬 tab 6, browser 1. 임시 viewport는 reset 완료.

## 주의사항

- 사용자 원본 .site-deploy/와 resources/pic/new/ 보존. public/resources/pic/new 기존 사본 유지.
- force push/히스토리 수정/광범위 삭제 금지.
- 키/토큰 로그·파일·Git 설정에 저장 금지. Sites source credential은 메모리와 일회성 인증 헤더만 사용.
- 공식 정보 조사와 현장 실측 인증은 구분. AI 라벨 및 방문 전 확인 안내 유지.
