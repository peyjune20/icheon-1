# Codex 작업 진행 상태

## 현재 목표

이천베베로드의 장소·스탬프·지도·코스 준비 개선 작업을 완료하고, 최신 버전을 웹페이지와 GitHub에 반영했다.

## 완료한 작업

- 기존 장소 데이터, 추천 엔진, 사진 갤러리, 상세 위치 섹션, 내 여행 화면 구조를 점검했다.
- `resources/pic/new`의 새 사진 및 영상 11개를 웹 정적 자산으로 반영했다.
- 라이스카페에 라이스카페·팜마켓 사진 7장을 추가했다.
- 이천농업테마공원에 새 사진 1장과 현장 영상 3개를 추가하고 갤러리에서 영상 재생을 지원했다.
- 스탬프 생성 시 방문 날짜를 선택할 수 있게 하고, 스탬프 북과 저장 장소 카드에서 해제할 수 있게 했다.
- 테마별 카드 컬렉션을 귀여운 이천 마을 지도와 방문 깃발 UI로 교체했다.
- 출발 전 베베 체크를 `우리 가족 코스 만들기` 단계로 이동하고 브라우저에 체크 상태를 저장하도록 했다.
- 덕평공룡수목원을 포함한 AI 추천 13곳을 추가해 전체 장소 탐색을 20곳으로 확장했다.
- 현장 실측 7곳과 AI 추천 13곳을 장소 탐색·상세 화면에서 별도 배지로 구분했다.
- AI 추천 장소까지 코스 추천 엔진의 체험 스타일 점수 대상에 포함했다.
- 장소 상세 갤러리의 사진 비율을 16:9 원본 보존형으로 조정했다.
- 위치 및 주변 접근성을 사진 배경 대신 주요 IC·철도·랜드마크와 카카오맵·구글 지도 링크가 포함된 안내 지도로 교체했다.
- 정적 내보내기에서 이미지를 안전하게 표시하도록 Next 이미지 설정을 조정했다.
- Sites 버전 8을 운영 웹페이지에 성공적으로 배포했다.
- GitHub `main` 브랜치에 기능 커밋 `2e1c660`을 푸시했다.

## 수정한 파일

- `public/assets/icheon-village-map.png`
  - 방문 테마를 지도 위 깃발로 표현하는 이천 마을 지도 배경
- `public/resources/pic/new/*`
  - 라이스카페·팜마켓 사진과 이천농업테마공원 새 사진·영상의 웹 배포용 사본
- `src/infrastructure/data/seed-places.data.ts`
  - 새 현장 미디어, AI 추천 13곳, 추천 출처 데이터 추가
- `src/domain/models/place.ts`
  - AI 추천 출처와 영상 미디어 모델 추가
- `src/components/shared/PhotoGallery.tsx`
  - 사진·영상 통합 갤러리 및 원본 비율 표시
- `src/features/tour-stamps/tour-stamps.storage.ts`
  - 방문일 지정 스탬프 저장 지원
- `src/features/tour-stamps/TourStamp.tsx`
  - 스탬프 해제 버튼 추가
- `src/app/my-trip/page.tsx`
  - 이천 마을 깃발 지도, 방문일 입력/표시, 해제 UI 적용
- `src/app/trip/page.tsx`
  - 출발 전 베베 체크를 코스 준비 화면으로 이동
- `src/app/places/page.tsx`, `src/features/place-detail/components/TrustCard.tsx`, `src/features/place-detail/components/HeroBanner.tsx`
  - 현장 실측/AI 추천 구분 배지와 안내 문구 적용
- `src/features/place-detail/components/LocationPreview.tsx`
  - 사진 없는 주변 접근성 안내 지도와 지도 앱 링크 적용
- `src/domain/recommendation/place-scorer.ts`, `src/features/itinerary/components/NavigationModal.tsx`, `src/app/page.tsx`, `next.config.mjs`
  - AI 체험 추천, AI 장소 길찾기 검색, 메인 통계, 정적 이미지 표시 설정 보완
- `CODEX_PROGRESS.md`
  - 작업 재개를 위한 현재 상태 기록

## 현재 구현 상태

- 7개 현장 실측 장소와 13개 AI 추천 장소가 하나의 추천 후보 목록에서 코스 조합 대상으로 동작한다.
- AI 추천 장소는 실제 현장 실측 배지가 아닌 `AI 추천`·`공개 관광 정보 탐색` 배지로 표시된다.
- 농업테마공원은 새 영상 3개를 갤러리에서 재생할 수 있고, 라이스카페는 새 사진 7장을 포함한다.
- 내 여행은 방문일을 지정해 스탬프를 찍고 잘못 찍은 스탬프를 해제할 수 있다.
- 이천 마을 지도는 방문한 테마 수에 따라 깃발과 카운트가 바뀐다.

## 확인 완료

- `npx tsc --noEmit` 통과
- `npm run build` 통과: 28개 정적 페이지 생성 확인
- 브라우저에서 장소 탐색 20개 카드, AI 추천 배지 13개, 코스 준비 체크 위치를 확인했다.
- 브라우저에서 이천농업테마공원 갤러리의 새 영상 재생 컨트롤과 사진 없는 주변 접근성 지도·지도 앱 링크를 확인했다.
- 운영 웹페이지 배포 성공: `https://icheon-bebe-road.grayngell.chatgpt.site`

## 발견된 문제

- AI 추천 장소의 운영시간·영유아 편의시설은 현장 실측 값으로 추정하지 않고, 공식 안내 재확인을 요구하도록 표시했다.
- 로컬 화면 확인 중 정적 내보내기와 이미지 최적화 충돌을 발견했고 `images.unoptimized` 설정으로 해결했다.

## 미완료 작업

- 없음

## 다음 작업

1. 새 요청이 들어오면 이 문서와 현재 Git 상태를 비교한다.
2. 장소 운영 정보처럼 시간이 지날 수 있는 데이터는 공식 채널에서 재확인한 뒤 갱신한다.

## 다음 세션 시작 위치

새 세션은 이 문서를 먼저 읽은 뒤, `2e1c660` 이후의 Git 변경사항부터 확인한다. 현재 제품 기능 작업은 완료되어 있다.

## 주의사항

- `public/resources/pic`의 기존 현장 실측 사진은 유지한다.
- AI 추천 장소는 `FIELD_VERIFIED`로 표시하지 않으며 운영 정보도 공식 안내 재확인 대상으로 남긴다.
- `.site-deploy/`와 `resources/pic/new/`는 기존·사용자 제공 원본이므로 커밋에 포함하지 않는다. 웹 배포에는 `public/resources/pic/new/`를 사용한다.
