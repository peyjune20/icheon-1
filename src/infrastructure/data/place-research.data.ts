import { Place } from "@/domain/models/place";
import { EvidenceValue } from "@/domain/models/evidence";
import { TriState } from "@/domain/models/tri-state";

const city = (mid: string) => `https://www.icheon.go.kr/tour/contents.do?mid=${mid}`;
const kto = (id: string) => `https://data.visitkorea.or.kr/linkedview/${id}`;
const access = "https://access.visitkorea.or.kr/cos/detail.do?cotId=34cfe5d1-b254-46a3-b996-0c59f7e39379";
const evidence = (note: string, sourceRef: string, value: TriState = "YES"): EvidenceValue<TriState> => ({ value, note, sourceRef, sourceType: "OFFICIAL", collectedAt: "2026-09-21", confidence: "MEDIUM" });
type Research = Partial<Place> & { url: string; hours?: string; closed?: string; cost?: string; phone?: string; access?: string };
// Publicly documented facts only. Retrieval date is NOT a field-verification date.
const research: Record<string, Research> = {
  "19": { url: "https://www.simmons.co.kr/factorium/terrace", hours: "공식 테라스 방문 안내 확인", cost: "전시·식음료·이벤트별 확인" },
  "28": { url: "https://www.artic.or.kr/base/nrr/performance/read?menuLevel=&menuNo=&performanceNo=1735", address: "경기 이천시 경충대로2709번길 128", hours: "교육·공연·가족 체험 일정별 사전 확인", cost: "프로그램별 상이 · 과거 무료 행사와 현재 일정은 구분", phone: "031-633-9758" },
  "29": { url: "https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=37&mid=0302040000", lat: 37.241282, lng: 127.390192, hours: "푸드코트·편의점 24시간 (일부 품목 제외)", cost: "식음료·부대시설별 별도", access: "고속도로 휴게소예요. 일반도로 진입 가능 여부와 진행 방향은 길찾기에서 반드시 확인하세요." },
  "3": { url: "https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=78&mid=0302010000", lat: 37.177583, lng: 127.445922 },
  "6": { url: "https://www.icheon.go.kr/tour/cultureTour/manage/view.do?idx=78&mid=0302010000", lat: 37.177583, lng: 127.445922, coordinateSource: "이천시 농업테마공원 대표 좌표 · 카페 입구는 현장 안내 확인" },
  "7": { url: kto("2763831"), lat: 37.140044099, lng: 127.5265139614, address: "경기 이천시 설성면 성호로 354", hours: "상시 개방", closed: "연중 개방 · 기상·정비 시 통제 가능", cost: "공개 안내에 요금 미기재", phone: "031-644-8671", parking: evidence("주차 가능으로 안내되어 있어요. 주차면과 혼잡도는 현장에서 확인하세요.", kto("2763831")) },
  "8": { url: "https://www.dinovill.com/67", lat: 37.2323161, lng: 127.3372035, coordinateSource: "공공 관광 데이터 대표 좌표", hours: "계절별 마감시간 상이 · 공식 이용안내 확인", phone: "031-633-5029", cost: "연령·요일별 입장권 요금 확인" },
  "9": { url: kto("1624755"), lat: 37.2788706826, lng: 127.4263051848, address: "경기 이천시 경충대로2709번길 128", hours: "공원 상시 개방", closed: "연중 개방 · 부속 시설 별도", cost: "공원 산책과 부속 시설 요금 구분 필요", phone: "031-645-3849", parking: evidence("공원 주차장 이용 가능", kto("1624755")), toilet: evidence("공원 공용 화장실이 있어요. 가족 전용 시설 여부는 별도 확인하세요.", access), access: "설봉호수·시립박물관·월전미술관을 함께 살펴볼 수 있어요. 이천역·터미널에서 최종 경로는 지도 앱으로 확인하세요." },
  "10": { url: "https://www.2000yespark.or.kr/", hours: "공방·카페별 운영시간 상이", cost: "공방 체험·구매·음료별 별도", parking: evidence("마을 공용 주차 구역이 안내되어 있어요.", access), toilet: evidence("마을에 공용·장애인 화장실이 안내되어 있어요. 가족 화장실 여부는 별도 확인하세요.", access), strollerAccessible: evidence("공방별 문턱과 경사 여건이 달라요. 마을 산책과 실내 입장을 구분해 확인하세요.", access, "UNKNOWN") },
  "11": { url: kto("3023991"), lat: 37.2749461555, lng: 127.4273413137, address: "경기 이천시 경충대로2697번길 172", hours: "09:00–18:00 · 입장 마감 17:30", closed: "월요일·1월 1일·설/추석 당일", cost: "관람 무료", phone: "031-633-9734", openingHours: { open: "09:00", close: "18:00", closedDays: [1] }, parking: evidence("주차 가능", kto("3023991")), access: "설봉공원 안에 있어요. 이천역·이천종합터미널에서 차량 이동 후 공원 산책과 연결하기 좋아요." },
  "12": { url: "https://www.iwoljeon.org/intro/intro.php?sp=view", address: "경기 이천시 경충대로2709번길 185", hours: "10:00–18:00 · 입장 마감 17:30", closed: "월요일·1월 1일·설/추석 당일", cost: "일반 2,000원 · 청소년 1,000원 · 어린이 600원 · 특별전 별도", phone: "031-637-0032", openingHours: { open: "10:00", close: "18:00", closedDays: [1] }, parking: evidence("미술관 앞뒤 주차 구역이 안내되어 있어요.", access), toilet: evidence("1층 장애인 화장실 안내가 있어요. 유아 설비는 별도 확인하세요.", access) },
  "13": { url: "https://www.gmocca.org/", hours: "미술관 전시·야외 공간 운영시간 구분 확인", cost: "전시·체험 프로그램별 확인", parking: evidence("세라피아 주변 주차 구역이 안내되어 있어요.", access), strollerAccessible: evidence("미술관 엘리베이터 안내가 있어요. 야외에는 경사 구간이 있어 동선 확인이 필요해요.", access, "UNKNOWN") },
  "14": { url: "https://termeden.com/community01_etc.html", lat: 37.1948835381, lng: 127.4466557305, coordinateSource: kto("128870"), hours: "시즌·시설별 운영시간 상이", closed: "정기 클린데이 및 당일 공지 확인", cost: "풀앤스파·연령·시즌별 요금 상이", phone: "031-645-2000", parking: evidence("주차 가능", kto("128870")) },
  "15": { url: "https://www.lotteshopping.com/store/main?cstrCd=0346", lat: 37.2422772151, lng: 127.400044712, coordinateSource: kto("2041024"), address: "경기 이천시 호법면 프리미엄아울렛로 177-74", hours: "10:30 개점 · 날짜별 20:00/20:30/21:00 마감 확인", closed: "당일 영업 달력 확인", cost: "매장 구매·식음료·체험별 별도", phone: "1577-0001", parking: evidence("공식 점포 안내에 주차장 운영이 기재되어 있어요.", "https://www.lotteshopping.com/store/main?cstrCd=0346"), access: "이천역·이천터미널 방면 버스 안내가 있어요. 당일 운행 시간과 정류장은 지도 앱에서 확인하세요." },
  "16": { url: access, unavailableReason: "한국관광공사 안내에 영업 중단으로 표시되어 있어요. 재개 여부 확인 전 자동 추천에서 제외합니다.", hours: "영업 중단 안내 · 재개 여부 확인 필요", cost: "운영 재개 공지 후 확인" },
  "17": { url: "https://www.jisanresort.co.kr/", hours: "계절·시설·프로그램별 운영", cost: "시즌·이용 시설별 별도", closed: "시즌 운영 공지 확인" },
  "18": { url: "https://edenparadise.co.kr/spacePage/garden", hours: "가든·카페별 이용시간 확인", cost: "식음료·숙박·프로그램 별도", phone: "031-645-9100", shade: evidence("공식 정원 안내에 벤치와 정자가 소개되어 있어요.", "https://edenparadise.co.kr/spacePage/garden"), access: "정원은 층별로 나뉘고 돌·흙길이 있어요. 유모차 이용 시 건물 연결 동선과 입구를 미리 확인하세요." },
  "20": { url: city("0101010000"), unavailableReason: "‘이천치유의숲’의 공식 운영 장소와 정확한 주소를 확인하지 못했어요. 확인 전 자동 추천에서 제외합니다.", hours: "공식 운영 정보 미확인", cost: "확인되지 않음" },
  "21": { url: city("0101060000"), lat: 37.3407759410976, lng: 127.462295543478, hours: "마을 산책·체험 시설별 확인", cost: "체험 프로그램 별도", phone: "031-632-4304", access: "백사면 산수유마을 권역이에요. 꽃축제 때는 주차·교통 통제 공지를 확인하세요." },
  "22": { url: city("0101050000"), lat: 37.2957791977117, lng: 127.411693977247, hours: "공방·매장마다 다름", cost: "도자기 구매·체험별 별도" },
  "23": { url: city("0101020000"), lat: 37.340584, lng: 127.4754645, hours: "야외 문화유산 · 현장 통제 여부 확인", cost: "별도 요금 정보 미기재" },
  "24": { url: city("0101030000"), lat: 37.277502, lng: 127.450747, address: "경기 이천시 중리천로113번길 12", hours: "야외 정자 · 현장 통제 여부 확인", cost: "별도 요금 정보 미기재" },
  "25": { url: city("0101070000"), lat: 37.2697557, lng: 127.3913207, hours: "등산로 · 기상 및 통제 확인", cost: "별도 요금 정보 미기재", strollerAccessible: evidence("암릉과 등산 구간이 있는 코스여서 유모차 산책 코스로 추천하지 않아요.", city("0101070000"), "NO"), ageMinMonths: 72, access: "지도 표시는 이천시 관광 대표 지점이에요. 차량 진입지와 등산로 입구는 따로 확인하세요." },
  "26": { url: "https://museum.ck.ac.kr/", hours: "학사 일정·전시별 개관일 확인", cost: "관람·체험별 공식 안내 확인" },
  "27": { url: "https://www.kctg.or.kr/tour/touristSiteView.do?tourist_cd=TOURIST_ID00011367", lat: 37.276205, lng: 127.481539, address: "경기 이천시 부발읍 무촌로18번길 130", hours: "09:00–18:00", closed: "방문일 휴관 여부 공식 안내 확인", phone: "031-633-9743", openingHours: { open: "09:00", close: "18:00", closedDays: [] } },
  "30": { url: kto("128304"), lat: 37.0589038472, lng: 127.5478337813, address: "경기 이천시 율면 금율로640번길 177", hours: "10:00–18:00 · 체험 사전 예약", closed: "관광공사 안내 토·일 휴무 · 예약 시 실제 운영일 확인", cost: "체험 프로그램별 요금 상이", phone: "031-643-0817", parking: evidence("주차 가능", kto("128304")) },
};

export function applyPlaceResearch(place: Place): Place {
  const entry = research[place.id];
  if (!entry) return place;
  const { url, hours, closed, cost, phone, access: accessText, ...changes } = entry;
  const result = { ...place, ...changes, sourceUrl: url };
  if (changes.address) result.roadAddress = changes.address;
  if (entry.lat) result.coordinateSource ||= url;
  if (place.recommendationSource === "AI_RECOMMENDED") result.researchedInfo = {
    checkedAt: "2026-09-21", hours: hours || "공식 운영시간 미확인", closed: closed || "임시 휴무·통제는 방문 전 확인", cost: cost || "공식 요금 미확인", phone, access: accessText,
    sources: [{ label: url.includes("visitkorea") ? "한국관광공사 안내" : url.includes("icheon.go.kr") ? "이천시 공식 안내" : "운영 기관 안내", url }],
  };
  return result;
}
