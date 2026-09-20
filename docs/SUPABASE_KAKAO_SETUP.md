# Kakao · Supabase 연결 및 배포 안내

## 구현 상태와 오류 원인

이 프로젝트는 **Next.js 14 정적 export**입니다. Vite가 아니므로 NEXT_PUBLIC_ 환경변수를 사용합니다.
기존 사진/장소/코스 API는 Sites 전용 Cloudflare Worker(src/server/worker.ts), D1, R2에 구현되어 있었습니다. Vercel에는 그 Worker가 배포되지 않습니다.

2026-09-21 실제 Vercel URL에서 읽기 요청을 확인한 결과:

| 요청 | 응답 |
| --- | --- |
| /api/config | 404 · text/html · <!DOCTYPE html> |
| /api/search?q=test | 404 · text/html · <!DOCTYPE html> |
| /api/photos?placeId=1 | 404 · text/html · <!DOCTYPE html> |

기존 화면이 이 응답에 바로 response.json()을 실행해 Unexpected token '<' 오류가 났습니다.
이번 확인에서 **200 index.html fallback이 아니라 404 HTML**이었습니다. 새 화면은 위 API를 호출하지 않습니다.
직접 fetch가 남은 날씨/지도 코드도 상태와 Content-Type을 확인합니다. 한국어 오류 안내와 개발용 로그를 분리했습니다.

사용자 Vercel 재배포 후 운영 사이트에서 Kakao 장소 검색, 선택 시 주소/좌표 자동 입력, 미솥지음 상세의 실제 지도 핀을 확인했습니다. Kakao 키 값은 읽거나 출력하지 않았습니다.
도메인 3개 등록 완료도 사용자 확인 사항입니다. Vercel 설정은 로컬 .env.local이나 Sites에 자동으로 동기화되지 않습니다.
반면 운영 /account 및 방문 사진 영역은 **Supabase 설정 미완료** 안내가 나옵니다. NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 배포본에 반영되지 않은 상태입니다. SQL 적용·실서비스 업로드/RLS 검증은 아직 실행하지 않았습니다.

## 1. Supabase 프로젝트 만들기

1. 본인 Supabase 계정에서 새 프로젝트를 만듭니다. 프로젝트 이름 예: icheon-bebe-road. 서비스 사용자와 가까운 지역을 선택합니다.
2. 프로젝트 DB 비밀번호는 안전하게 따로 보관합니다. 프론트엔드 환경변수에는 사용하지 않습니다.
3. SQL Editor에서 **supabase/migrations/202609210001_private_family_records.sql 전체를 한 번 실행**합니다.
4. 아래 세 테이블과 비공개 버킷이 생성되었는지 확인합니다. 버킷을 수동으로 먼저 만들 필요는 없습니다.

| 항목 | 이름 | 역할 |
| --- | --- | --- |
| Database | custom_places | 사용자가 추가한 장소 JSON + 소유자 |
| Database | saved_plans | 사용자별 저장 코스 |
| Database | visit_photos | id, user_id, title, image_url, created_at, place_id, object_path, original_filename |
| Storage | visit-photos | 비공개 · 10MB · image/jpeg |

SQL은 신규 프로젝트용 1회 마이그레이션입니다. 같은 이름의 테이블/버킷이 이미 있다면 삭제해서 맞추지 말고 현재 스키마와 비교해야 합니다.
SQL 트랜잭션이 실패하면 원인을 해결한 후 전체를 다시 실행하세요.
기존 프로젝트에 다른 광범위한 허용 정책이 있으면 RLS 정책들이 OR로 합쳐질 수 있으므로 함께 점검하세요.

## 2. 이메일 로그인 설정

이 앱은 Supabase Auth의 이메일 Magic Link를 사용합니다. Sites의 ChatGPT 로그인과는 별개의 계정입니다.
Authentication의 Email provider를 활성화하고, 로그인 이메일 템플릿은 기본 ConfirmationURL 링크를 유지합니다.
일반 사용자에게 안정적으로 메일을 보내려면 SMTP 제공자를 연결하고 발송 제한도 확인하세요.

Authentication → URL Configuration:

- Site URL: https://icheon-1.vercel.app
- 추가 Redirect URLs:
  - https://icheon-1.vercel.app/account**
  - https://icheon-bebe-road.grayngell.chatgpt.site/account**
  - http://localhost:3000/account**

/account?returnTo=... 쿼리를 허용하기 위한 끝의 ** 패턴입니다. Preview 환경을 사용할 때는 실제 본인 배포 주소만 추가하세요.
Sites와 Vercel은 같은 Supabase 프로젝트를 가리키면 같은 계정 기록을 조회합니다. 도메인 간 로그인 세션 자체는 별도이므로 각각 로그인해야 합니다.
Sites 접근 제한이 있는 경우 Sites 접근 로그인과 앱 안의 Supabase 로그인이 모두 필요할 수 있습니다.

공식 참고: [이메일 로그인](https://supabase.com/docs/guides/auth/auth-email-passwordless), [리디렉션 URL](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. 공개 환경변수 입력

프로젝트 루트 .env.local의 아래 세 항목에 값을 넣습니다. 실제 값은 GitHub나 채팅에 올리지 않습니다.

```dotenv
NEXT_PUBLIC_KAKAO_MAP_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

| 변수 | 넣을 값 |
| --- | --- |
| NEXT_PUBLIC_KAKAO_MAP_KEY | Kakao Developers 앱의 JavaScript 키 |
| NEXT_PUBLIC_SUPABASE_URL | Supabase 프로젝트 URL, https://프로젝트참조.supabase.co |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase publishable key. 기존 프로젝트의 legacy anon key도 이 변수에 사용 가능 |

Supabase secret key / service_role key / DB 비밀번호 / Kakao REST 키는 위 변수에 넣지 않습니다.
NEXT_PUBLIC_ 값은 브라우저 번들에 공개됩니다. 사용자 사진 보호는 키를 숨기는 방식이 아니라 Auth JWT + RLS로 보장합니다.
.env.local은 Git에서 제외되어 있고 .env.example은 변수명만 포함합니다.

## 4. Kakao SDK 허용 도메인

아래 주소는 사용자가 Kakao Developers → 이천베베로드 앱 → JavaScript SDK 도메인에 등록 완료했다고 확인했습니다. 동일 주소를 다시 등록할 필요는 없습니다.

- https://icheon-1.vercel.app
- https://icheon-bebe-road.grayngell.chatgpt.site
- http://localhost:3000

이번 로컬 검증 서버는 실제 **3000 포트**입니다. 3001은 기존 Wrangler preview 명령의 별도 포트이며 그 preview를 사용할 때만 추가하세요.
등록 완료는 사용자 확인에 근거합니다. 이후 Vercel에서 SDK 검색 성공과 대표 장소 지도 핀까지 확인했습니다. 로컬/Sites 설정은 별도로 확인해야 합니다.

## 5. Vercel 및 Sites 적용

1. Vercel Project Settings → Environment Variables에 위의 동일한 세 변수와 값을 추가합니다.
2. Production에 적용하고, 사용하는 Preview/Development 환경에도 필요에 맞게 추가합니다.
3. 새 배포를 실행합니다. NEXT_PUBLIC_ 변수는 **빌드 시점**에 정적 JS에 삽입되므로 값만 바꾸고 기존 배포를 열면 적용되지 않습니다.
4. 프레임워크는 Next.js, 빌드 명령은 npm run build입니다. Next 설정은 output: export입니다. 정적 배포는 next start가 아닌 Vercel 정적 출력으로 실행합니다.
5. Vercel에서는 src/server/worker.ts, D1, R2를 연결하지 않습니다. 새 화면은 Supabase SDK를 직접 사용합니다.
6. Sites도 같은 세 공개 값을 빌드 환경에 넣어 재빌드한 정적 산출물을 배포하면 같은 Supabase를 사용합니다. Worker의 런타임 환경변수만 바꿔서는 이미 만들어진 NEXT_PUBLIC_ 번들이 바뀌지 않습니다.

기존 Sites의 D1/R2 데이터와 Worker 코드는 호환/보관 목적으로 남겨두었습니다. 새 UI의 기본 저장소는 두 호스팅 모두 Supabase입니다.
이전 계정 ID와 Supabase 계정 ID는 다르므로 기존 데이터가 자동으로 이동하거나 합쳐지지 않습니다. 데이터 이관에는 소유자 매핑과 별도 승인/검증이 필요합니다.
이번 작업은 GitHub 반영을 대상으로 하며, 키 없는 새 버전을 기존 Sites 저장소에 덮어 배포하지 않습니다.

## 장소 검색과 저장 흐름

검색어 → 공유 Kakao SDK 로더(services, autoload=false, Promise 중복 방지) → Places.keywordSearch →
결과 목록(장소명·도로명·보조 지번) → 선택 → 장소명/주소/y 위도/x 경도 채움 → 기존 테마 유지 →
Supabase 인증 확인 → custom_places 저장.

검색은 이천 중심 좌표를 전달하고 반환된 결과 안에서 이천을 우선 정렬합니다. 반경 필터를 걸지 않아 다른 지역도 검색할 수 있습니다.
상위 최대 15개 결과를 보여 주므로 원하는 지점이 없으면 지역/지점명을 더 구체적으로 입력하세요.
SDK 로드 실패·키 미설정·검색 실패·결과 없음은 각각 한국어로 안내합니다.
기존 Nominatim(OpenStreetMap) 서버 검색 코드는 legacy Worker에 남아 있지만 새 검색 UI에서는 호출하지 않습니다. 검색 출처를 섞는 자동 fallback은 사용하지 않습니다.
지도 바탕만 SDK 로드 불가 시 확인된 좌표에 한해 OpenStreetMap으로 대체하고 출처를 표시합니다.

## 사진 업로드와 보안 흐름

로그인 확인(getUser) → 형식/10MB 검사 → createImageBitmap(from-image) → canvas에 픽셀 재출력 →
JPEG(품질 .92, 긴 변 최대 2560px) → 비공개 visit-photos/사용자UUID/사진UUID.jpg 업로드 → visit_photos 메타데이터 삽입.

- 원본의 GPS/EXIF 메타데이터는 새 canvas 출력에 복사하지 않습니다. EXIF 방향을 적용한 픽셀을 그립니다. 투명 이미지는 흰 배경 JPEG가 됩니다.
- 원본 파일과 base64 데이터는 DB에 저장하지 않습니다. DB에는 인증 다운로드 경로와 메타데이터만 저장합니다.
- DB user_id는 auth.uid() 기본값이며 사용자 입력란에서 받지 않습니다.
- 테이블 RLS는 auth.uid() 본인만 조회/삽입/삭제하도록 제한합니다.
- Storage RLS는 사용자 폴더와 owner_id를 검사합니다. public URL이나 공유 가능한 signed URL을 만들지 않습니다.
- 사진은 로그인 토큰으로 다운로드하고 화면에서는 임시 blob URL로 보여 줍니다. 계정 전환/화면 종료 때 URL과 목록을 정리합니다.
- 성공하면 제목/파일 선택을 비우고 최신순 목록을 다시 읽습니다.
- DB 삽입 실패 시 업로드한 파일 삭제를 시도합니다. 네트워크 단절로 정리가 실패하면 로그와 Storage에서 고아 파일을 점검해야 합니다.
- 삭제는 파일 삭제 후 본인 DB 레코드를 삭제합니다. DB 삭제만 실패했을 때 재시도할 수 있도록 메타데이터/삭제 버튼을 유지합니다.
- 로그인 사용자에게도 타인 파일 조회·삭제를 허용하지 않습니다. 스토리지 관리자 권한으로 직접 공개 버킷으로 전환하지 마세요.
- 기존 찜/스탬프는 브라우저 보관 방식을 유지하며 Supabase로 자동 이관하지 않습니다.

공식 참고: [비공개 버킷](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control), [owner_id](https://supabase.com/docs/guides/storage/security/ownership).

## 지도 및 자동차 코스

Kakao Places로 장소명을 대조한 좌표를 우선 사용하고, 미확인 좌표에는 가짜 핀을 찍지 않습니다.
현재 GPS → 첫 장소 → 경유지 → 마지막 장소 순서로 Kakao 자동차 링크를 만듭니다.
GPS 거부/실패 시 출발지를 직접 선택하도록 안내합니다. 5개 경유지 제한을 넘으면 앞 구간 끝을 다음 구간 시작으로 이어 나눕니다.
산 정상(도드람산)은 주차장 POI가 확인되기 전 자동차 목적지로 사용하지 않습니다.
앱 안 도로선은 OSRM의 참고 경로이며 실시간 교통 정보가 아닙니다. 경로 실패 시 직선으로 꾸미지 않고 핀만 보여 줍니다. 최종 자동차 안내는 Kakao에서 확인합니다.
Kakao JS Maps의 장소/지도 API와 자동차 경로 계산 API는 별개이므로 카카오 교통 기반 경로를 앱 안에 직접 그리는 추가 유료/서버 API를 임의 도입하지 않았습니다.

공식 링크 형식: [Kakao 지도 Web 가이드](https://apis.map.kakao.com/web/guide/).

## 로컬 테스트

```powershell
npm install
npm run dev -- --port 3000
```

http://localhost:3000 에서 확인합니다. 환경변수를 변경했으면 개발 서버를 재시작합니다.

자동 검증:

```powershell
npm run build
node scripts/verify.mjs
```

Next build가 타입을 검사합니다. 별도 lint 설정이 없는 프로젝트이므로 새로운 lint 구성을 추가하지 않았습니다.
기존 Next 14.2.15 의존성 보안 경고는 별도 업그레이드 검토 대상이며 강제 버전 변경은 하지 않았습니다.

설정 후 반드시 할 실연결 테스트:

1. 검색창에서 이천 미솥지음, 베이커리 을를, 서울의 특정 장소 검색. 결과 선택 후 y/x와 테마 유지 확인.
2. 계정 A 이메일 로그인 → 내 장소 저장 → JPG/PNG/WEBP 사진과 제목 저장 → 목록 최신순, 제목/파일 초기화 확인.
3. EXIF 방향·GPS가 있는 **테스트 사진**을 업로드하고 다운로드한 JPEG에 GPS가 없는지, 세로/가로 방향이 정상인지 확인. 10MB 초과/GIF는 거부되어야 합니다.
4. 다른 브라우저 프로필에서 계정 B 로그인. A의 레코드 ID/object_path를 알고 있더라도 DB 조회는 0건, Storage 다운로드/삭제는 거부되어야 합니다. B의 토큰으로 A의 user_id를 지정해 INSERT해도 거부되어야 합니다. 단순히 화면 목록이 비어 있는 것만으로 권한 검증을 끝내지 마세요.
5. A로 테스트 사진 삭제 → DB와 Storage 모두 제거 확인. 로그아웃 후 /account와 사진 UI에 이전 이미지가 남지 않는지 확인.
6. 실제 기기 GPS 허용 후 미솥지음 첫 목적지, 3곳 전체 코스, 8곳 이상의 분할 경유 코스 각각 Kakao에서 출발지·방문 순서 확인.
7. Vercel 새 배포와 Sites 재배포 후 같은 계정으로 각각 로그인하여 동일한 기록을 확인.

현재 자동 검증은 SDK 모의 응답, HTML/JSON 방어, 파일 제한, 좌표/30슬롯 무결성, 경유 링크 순서를 포함합니다.
Vercel 실제 확인: 미솥지음/을를/모가의숲/환경학습관 검색, 도로명/지번, 미솥지음 좌표 자동 입력과 테마 유지, 서울 지역 검색, 결과 없음 안내, 미솥지음 상세 지도 핀.
**실제 Supabase SQL 실행/RLS HTTP 검증, 실파일 EXIF 검수, 나머지 장소 핀 전수 확인·현재 기기 GPS 길찾기는 아직 미실행**입니다.

## 변경 파일 안내

수정: .env.example, package.json/lock, scripts/verify.mjs 및 verify-itinerary.ts, 장소 목록/코스/나의 투어,
CustomPlaceManager/use-places, VisitorPhotos/BottomActionBar/LocationPreview, NavigationModal/PlaceMap,
VillageCollection, 장소 모델/자료, 날씨 응답 검사, legacy Worker 응답 검사, CODEX_PROGRESS.md.

신규:
- src/lib/{supabase,kakao-maps,map-points,client-errors}.ts
- src/app/account/page.tsx
- src/features/custom-places/account-repository.ts
- src/features/place-detail/photo-repository.ts
- src/infrastructure/data/place-addresses.data.ts
- src/features/tour-stamps/village-layout.ts
- public/assets/village-connected.png
- supabase/migrations/202609210001_private_family_records.sql
- scripts/verify-integrations.ts
- 본 문서, docs/ADDRESS_AUDIT.md, design/VILLAGE_COLLECTION.md
- .env.local: 로컬 전용 빈 설정 파일, Git 미포함
