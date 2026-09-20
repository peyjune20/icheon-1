# Codex 작업 진행 상태

## 현재 목표

2026-09-21 후속 요청: Kakao JS Places 검색, Supabase Auth/Storage/Database 개인 기록, 주소 30곳 대조, 연결된 마을 30개 슬롯, 카카오 자동차 경유 길찾기 구현 및 GitHub push.
코드 구현과 로컬 검증 완료. 사용자 Vercel 재배포 후 Kakao 검색/자동 입력/실제 지도 핀은 운영 사이트에서 확인했습니다. Supabase 로그인/사진 연결 검증은 남아 있습니다.

### Vercel Redeploy 후 운영 확인

- 사용자 재배포 알림 후 https://icheon-1.vercel.app/places 에서 실제 Kakao 검색 성공. Vercel 배포본에는 Kakao JavaScript 키가 반영되어 있음. 키 값은 읽거나 출력하지 않음.
- 미솥지음, 베이커리 을를 이천, 모가의숲, 이천시환경학습관 검색 결과 주소가 교정 주소와 일치함.
- 미솥지음 결과 선택 후 장소명/도로명주소/위도/경도 자동 입력, 기존 자연·숲 테마 유지 확인.
- 이천 외 검색(서울 남산서울타워), 복수 결과, 결과 없음 안내 확인.
- /places/1 상세에서 Kakao Maps 출처와 실제 미솥지음 핀 렌더링을 시각 확인.
- /account에서 로그인 버튼 비활성화 및 Supabase 설정 미완료 안내 확인. /places/1 방문 사진 영역도 저장소 미설정 안내. 배포본에서 NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 없으므로 사진 기능은 아직 실연결되지 않음.
- 개인 장소/사진을 실제로 생성하거나 로그인 이메일을 발송하지 않음. 전체 30곳 핀 및 실제 GPS 자동차 길찾기까지 검증했다고 보고하지 말 것.
- 이번 확인은 Vercel 운영 사이트 기준. 로컬 .env.local과 기존 Sites 설정이 자동 동기화되었다는 뜻은 아님.

### 도메인 등록 후 재개 점검

- 사용자 확인: Kakao SDK 도메인 3개(https://icheon-1.vercel.app, https://icheon-bebe-road.grayngell.chatgpt.site, http://localhost:3000) 등록 완료.
- 재점검 결과: .env와 .env.local의 NEXT_PUBLIC_KAKAO_MAP_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 모두 비어 있음. 프로세스 환경변수에도 없음. 값은 출력하지 않고 설정 여부만 검사함.
- Sites 환경변수 조회 결과 등록 항목 없음. 접근 가능한 브라우저에는 Kakao/Supabase/Vercel 설정 탭이 없어 해당 계정에서 키를 가져오지 못함.
- 도메인 등록과 API 키 연결은 별개. 실제 키 없이 외부 API 성공을 검증하거나 완료로 보고하지 말 것.
- 이번 재개에서는 기능 코드를 불필요하게 변경하지 않고 등록 완료 상태/다음 설정 위치를 문서에 반영함. 입력 요청을 사용자에게 전달함.
- 재개 후 node scripts/verify.mjs 전체 통과, git diff --check 통과. 기능 코드가 동일해 불필요한 재빌드/키 없는 재배포는 하지 않음. 이 문서와 설정 안내만 후속 GitHub 커밋에 반영.

## 완료한 작업

- Next.js 14 정적 export와 기존 Sites 전용 D1/R2 Worker 구조 확인.
- Vercel /api/config, /api/search, /api/photos가 실제 404 text/html을 반환함을 확인. 무조건 response.json()하던 검색/사진 UI 제거.
- Kakao SDK services/autoload=false 단일 로더, Places 검색, 이천 우선 결과, 도로명/지번 및 y/x 자동 입력. 테마 유지, 한국어 실패 안내.
- Supabase 이메일 로그인 화면, 사용자 장소/코스 저장 및 방문 사진 Auth/Storage/Database 구현. 기존 레이아웃/색상 유지.
- 비공개 visit-photos 버킷, 3개 테이블, 사용자별 RLS SQL 작성.
- 사진 형식/10MB 제한, canvas JPEG 재인코딩, 원본 EXIF/GPS 미복사, 목록/삭제/오류 재시도 및 계정 전환 시 이미지 정리.
- 미솥지음을 카페 필터에서 제외하여 식당 단일 분류 유지.
- 30개 주소 대조 결과와 출처를 표시 계층에 적용. 이천치유의숲 미확인 추정 주소 제거, 자동 추천 제외 유지.
- Google 경로 대신 Kakao 자동차 링크: 현재 GPS → 첫 장소 → 경유 → 마지막 장소, 5개 경유지 제한별 연속 구간.
- 산 정상의 차량 목적지 사용 차단, 정확한 장소 검색 후 확인된 핀만 표시. 지도 도로선은 OSRM 참고 경로로 명시.
- imagegen 스킬 절차에 따라 단일 연결 마을 배경 1장 생성. 30개 조형물을 개별 좌표로 자연스럽게 분산. 테마별 섬/격자 제거.
- 디자이너용 4레이어 구조와 30개 좌표 명세, 주소 출처, Supabase/Kakao 설정·테스트 문서 작성.

## 수정한 파일

- .env.example, package.json, package-lock.json
  - 공개 환경변수 명세와 Supabase SDK 의존성.
- src/app/itinerary/page.tsx, src/app/my-trip/page.tsx, src/features/itinerary/active-course.ts
  - 개인 저장 코스를 Supabase로 전환, 계정 변경 반영.
- src/app/places/page.tsx
  - 미솥지음 카페 예외 포함 제거.
- src/features/custom-places/CustomPlaceManager.tsx, use-places.ts
  - Kakao 직접 검색, Supabase 저장/조회/삭제, 안전한 안내.
- src/features/place-detail/components/VisitorPhotos.tsx, BottomActionBar.tsx, LocationPreview.tsx
  - 개인 사진 저장 UI와 코스 담기 API 교체, 주소 근거와 지도 연결.
- src/features/itinerary/components/NavigationModal.tsx, src/components/shared/PlaceMap.tsx
  - Kakao 자동차 경유 링크, GPS, 지도와 도로선 출처 구분, 미확인 좌표 차단.
- src/features/tour-stamps/VillageCollection.tsx
  - 단일 마을 배경 위 개별 조형물 실루엣/컬러, 역할별 진행도, 모바일 가로 탐색.
- src/domain/models/place.ts, src/infrastructure/data/place-research.data.ts
  - 주소 출처 모델과 대조 데이터 적용.
- src/application/generate-itinerary.usecase.ts, src/components/shared/WeatherIndicator.tsx, src/server/worker.ts
  - 외부 응답 상태/Content-Type 검사. Worker는 legacy 보존, 새 UI에서는 사용 안 함.
- scripts/verify-itinerary.ts, scripts/verify.mjs
  - Kakao 경유 링크 및 신규 통합 검증 실행.
- docs/IMAGE_CREDITS.md, CODEX_PROGRESS.md
  - 새 자산/실제 이미지 처리 및 진행 기록.

신규 파일:

- src/lib/client-errors.ts, kakao-maps.ts, map-points.ts, supabase.ts
- src/app/account/page.tsx
- src/features/custom-places/account-repository.ts
- src/features/place-detail/photo-repository.ts
- src/features/tour-stamps/village-layout.ts
- src/infrastructure/data/place-addresses.data.ts
- supabase/migrations/202609210001_private_family_records.sql
- public/assets/village-connected.png
- scripts/verify-integrations.ts
- docs/SUPABASE_KAKAO_SETUP.md, docs/ADDRESS_AUDIT.md, design/VILLAGE_COLLECTION.md
- .env.local: 로컬 전용 빈 변수 3개, Git 제외. 실제 키 값 없음.

## 현재 구현 상태

- 프레임워크: Next.js 14.2.15, output: export. 40개 정적 페이지 빌드 성공.
- 기본 30곳 ID/사진/방문 상태 유지. 새 개인 기록은 Supabase, 기존 찜/스탬프는 브라우저 저장 유지.
- GitHub origin: https://github.com/peyjune20/icheon-1.git, main. 기능 커밋 3b759ea push 성공 확인(2026-09-21). 이후 진행 기록만 별도 문서 커밋으로 갱신.
- 기존 Sites 프로덕션은 v10(이전 커밋 3c6c862)이며 이번 후속 버전은 아직 Sites에 재배포하지 않음.
- Sites D1/R2 기록과 Worker는 삭제하지 않음. 새 Supabase 계정과 자동 병합/이관하지 않음.
- 로컬 검증 포트는 3000. 최종 빌드 충돌 방지를 위해 개발 서버 종료.

## 확인 완료

- npm run build: 최종 코드 40개 정적 페이지 생성, 타입 검사, Worker 번들 빌드 성공.
- node scripts/verify.mjs: 기존 추천/월령/옵션/추가제거/총시간 회귀 테스트 통과.
- 신규 검증: HTML 200/404/500 및 잘못된 JSON 방어, Kakao 단일 로드/검색/결과 없음/실패/이천 외 결과 보존.
- 사진 형식/10MB 제한, EXIF 방향 옵션 전달과 canvas 픽셀 출력·2560px 축소·리소스 해제의 모의 단위 테스트 통과.
- 주소 30개 및 기본 ID 유지, 슬롯 30개 ID/좌표/경계 무결성, 현재 GPS부터 자동차 경유 구간 순서/산 정상 차단 통과.
- SQL의 RLS/비공개 버킷 정책 존재 검사 통과. 이는 실제 Supabase RLS 실행 검증이 아님.
- 브라우저: 카페 필터에 미솥지음 없음, 검색창 키 미설정 한국어 안내, 상세 주소 수정, 사진 저장소 미설정 한국어 안내, 로그인 화면.
- 브라우저: 30개 조형물 DOM, 연결된 마을 데스크톱 렌더링, 390px 모바일 가로 탐색과 기본 메뉴.
- 브라우저 검수 당시 콘솔 error 없음.
- git diff --check 통과. .env.local ignore 확인.

## 발견된 문제

- 원인 확정: Vercel 정적 사이트에 기존 Worker API가 없어서 404 HTML을 JSON으로 읽었음. 새 프론트엔드 API 교체로 해당 원인 제거.
- 로컬 .env.local과 Sites는 이전 점검에서 빈 설정이었음. Vercel 재배포본의 Kakao 연결은 이후 실제 확인 완료. Supabase 설정은 운영 화면에서 미완료 안내가 나옴.
- Kakao SDK 허용 도메인 3개는 사용자가 직접 등록 완료했다고 확인함. 개발자 계정 직접 검증과 실제 키 연결은 아직 미수행.
- 이천치유의숲은 실제 공식 운영 장소 특정 못함. 미확인 명시 및 자동 추천 제외.
- 모가의 숲 산지 지번, 도드람산 정상, 단지 대표 주소 등은 자동차 입구와 다를 수 있음. Kakao Places 대조/운전자 최종 확인 필요.
- Next 14.2.15 기존 보안 경고는 별도 업그레이드 검토 필요. 강제 업그레이드 미실행.
- Storage/DB가 별개라 네트워크 단절 시 완전 원자적 삭제/롤백은 불가. 실패 재시도 UI와 고아 파일 확인 절차 문서화.

## 미완료 작업

- 사용자 Supabase 프로젝트 생성 및 SQL 실행, Auth 메일/리디렉션 URL 설정.
- Vercel의 Supabase 공개 환경변수 2개 입력/확인 및 재배포. Kakao는 Vercel 반영 확인 완료. 로컬/Sites에는 각 환경의 값이 별도로 필요함.
- 실제 Supabase 계정 A/B의 업로드/조회/삭제/RLS HTTP 격리 테스트.
- 실제 EXIF GPS·방향 테스트 파일로 업로드/다운로드 검수.
- 나머지 장소 핀 전수 검증, 현재 기기 GPS부터 자동차 경유 경로 검증. Vercel Kakao 검색과 대표 상세 핀은 확인 완료.
- Sites도 새 저장소로 전환하려면 같은 공개 값을 넣어 재빌드/배포. 기존 D1/R2 데이터 이관은 별도 작업.

## 다음 작업

1. 도메인은 사용자 등록 완료. docs/SUPABASE_KAKAO_SETUP.md의 1~3단계에 따라 Supabase 프로젝트/SQL/Auth/실제 키 설정을 마무리.
2. 로컬 .env.local에 NEXT_PUBLIC_KAKAO_MAP_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 입력한 뒤 npm run dev -- --port 3000.
3. 설정 문서의 실연결 7단계 검수. 실패 시 브라우저 응답과 Supabase RLS/Storage 로그를 확인하되 토큰/키는 출력하지 말 것.
4. npm run build 및 node scripts/verify.mjs 후 Vercel 환경변수 반영·재배포. Sites는 설정 후 별도 재배포.
5. 기존 데이터 이관이 필요하면 기존 Sites 소유자와 Supabase UUID 매핑 방법을 확인하고 승인된 데이터만 이관.

## 다음 세션 시작 위치

- 이 파일을 읽고 git status / git log -3 비교.
- 외부 설정 시작점: docs/SUPABASE_KAKAO_SETUP.md.
- Supabase: src/lib/supabase.ts → supabase/migrations/202609210001_private_family_records.sql.
- 업로드: src/features/place-detail/photo-repository.ts의 preparePhoto / uploadVisitPhoto / listVisitPhotos / deleteVisitPhoto.
- 검색: src/lib/kakao-maps.ts의 loadKakaoMaps / searchKakaoPlaces.
- 주소/자동차: src/infrastructure/data/place-addresses.data.ts, src/lib/map-points.ts의 resolveMapPoint / kakaoCarUrl.
- 마을 디자인: design/VILLAGE_COLLECTION.md → src/features/tour-stamps/village-layout.ts.

## 주의사항

- 키/서비스 role/admin secret을 프론트엔드나 .env.example에 넣지 말 것. 필요한 값은 공개 JavaScript/publishable 키뿐.
- .site-deploy/, resources/pic/new/는 작업 시작 시부터 있던 사용자 untracked 파일. 무단 stage/삭제 금지.
- 기본 장소 ID/사진/30개 스탬프 연동을 변경하지 말 것.
- Supabase visit-photos 버킷을 public으로 바꾸지 말 것.
- 공식 미확인 장소의 좌표/시설/운영을 추측해 인증하지 말 것.
- 키 없는 빌드는 안전한 안내를 보여 주지만 검색/사진 저장의 실서비스 성공 검증으로 간주하지 말 것.
