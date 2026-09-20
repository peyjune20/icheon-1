import type { Place } from "@/domain/models/place";
type AddressAudit = { address: string; url: string; note?: string; status?: "WEB_CHECKED" | "NEEDS_CHECK" };
const city = "https://www.icheon.go.kr/tour/";
const kto = (id: string) => "https://data.visitkorea.or.kr/linkedview/" + id;
/** Address-only corrections. Stable IDs, photos, themes and field-visit status are untouched.
 * A postal address is not proof of a drivable entrance coordinate.
 */
export const ADDRESS_AUDIT: Record<string, AddressAudit> = {
  "1": { address: "경기 이천시 모가면 사실로 979-10", url: "https://www.tabling.co.kr/place/677cd2de66de5f06988a837c", note: "미솥지음 이천점 · B동 1층. 기존 신둔면 주소 오류 교정." },
  "2": { address: "경기 이천시 모가면 산내리 산59-1", url: "https://www.placeview.co.kr/id/MTUyMjM0NzQ0MSAg", status: "WEB_CHECKED", note: "숲 소재지로 공개된 지번입니다. 차량 진입·주차 주소는 별도 확인하세요. 기존 진상미로 주소는 제거했습니다." },
  "3": { address: "경기 이천시 모가면 공원로 48", url: city + "cultureTour/manage/view.do?idx=78&mid=0302010000" },
  "4": { address: "경기 이천시 호법면 중부대로798번길 126", url: "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=66713c73-69d0-4139-9883-33603b34aa53", note: "환경학습관 건물 번호 126 누락 교정." },
  "5": { address: "경기 이천시 이섭대천로 1382", url: "https://pf.kakao.com/_iTstG/105811890", note: "증포동 을를 복합공간 · 베이커리 을를. 기존 율면 주소 오류 교정." },
  "6": { address: "경기 이천시 모가면 공원로 48", url: city + "cultureTour/manage/view.do?idx=205&mid=0101020000", note: "라이스카페 공원점 · 이천농업테마공원 내. 공원 대표 좌표와 카페 입구는 다를 수 있어요." },
  "7": { address: "경기 이천시 설성면 성호로 354", url: kto("2763831") },
  "8": { address: "경기 이천시 마장면 작촌로 282", url: "https://www.dinovill.com/67" },
  "9": { address: "경기 이천시 경충대로2709번길 128", url: kto("1624755") },
  "10": { address: "경기 이천시 신둔면 도자예술로5번길 109", url: "https://ktxmagazine.kr/wp-content/uploads/2024/12/2404.pdf", note: "예스파크 관광 대표 주소. 개별 공방과 주차장 주소는 다릅니다." },
  "11": { address: "경기 이천시 경충대로2697번길 172", url: kto("3023991") },
  "12": { address: "경기 이천시 경충대로2709번길 185", url: "https://www.iwoljeon.org/intro/intro.php?sp=view" },
  "13": { address: "경기 이천시 경충대로2697번길 263", url: "https://www.gmocca.org/info/icheon-museum", note: "세라피아 내 경기도자미술관 대표 주소." },
  "14": { address: "경기 이천시 모가면 사실로 984", url: kto("128870") },
  "15": { address: "경기 이천시 호법면 프리미엄아울렛로 177-74", url: kto("2041024") },
  "16": { address: "경기 이천시 마장면 덕이로154번길 287-76", url: "https://access.visitkorea.or.kr/cos/detail.do?cotId=34cfe5d1-b254-46a3-b996-0c59f7e39379", note: "기존 시설 소재지만 유지. 영업 중단 안내로 추천 제외." },
  "17": { address: "경기 이천시 마장면 지산로 267", url: "https://www.jisanresort.co.kr/m/guide/map.asp", note: "스키장·콘도 주소. 용인 소재 골프장과 구분." },
  "18": { address: "경기 이천시 마장면 서이천로 449-79", url: "https://www.wegive.co.kr/contents/wetownDetail/3571003", status: "WEB_CHECKED", note: "에덴파라다이스호텔 주소. 인접 에덴낙원(449-82)과 구분." },
  "19": { address: "경기 이천시 모가면 사실로 988", url: "https://www.diningcode.com/profile.php?rid=QIEvEpwIFeRO", status: "WEB_CHECKED" },
  "20": { address: "경기 이천시 · 정확한 장소 주소 확인 필요", url: city, status: "NEEDS_CHECK", note: "이천치유의숲 공식 운영 장소를 특정하지 못했습니다. 기존 설봉산 추정 주소로 안내하지 않습니다." },
  "21": { address: "경기 이천시 백사면 원적로775번길 17", url: "https://www.welchon.com/web/lay1/program/S1T11C189/seasontheme/view.do?seth_seq=273" },
  "22": { address: "경기 이천시 경충대로2993번길 56", url: "https://ktxmagazine.kr/wp-content/uploads/2024/12/2404.pdf", note: "도예촌 관광 대표 주소. 매장별 주소는 달라요." },
  "23": { address: "경기 이천시 백사면 도립리 201-11", url: "https://www.heritage.go.kr/heri/cul/culSelectDetail.do?ccbaCpno=1363103810000", note: "국가유산포털 소재지. 문화유산 위치와 차량 접근 지점을 구분해 주세요." },
  "24": { address: "경기 이천시 중리천로113번길 12", url: city + "contents.do?mid=0101030000" },
  "25": { address: "경기 이천시 마장면 목리 일원", url: city + "contents.do?mid=0101070000", note: "산 정상은 자동차 목적지가 아닙니다. 주차장·등산로 입구를 선택해 주세요." },
  "26": { address: "경기 이천시 마장면 청강가창로 389-94 청강홀 3층", url: "https://museum.ck.ac.kr/" },
  "27": { address: "경기 이천시 부발읍 무촌로18번길 130", url: "https://www.kctg.or.kr/tour/touristSiteView.do?tourist_cd=TOURIST_ID00011367" },
  "28": { address: "경기 이천시 경충대로2709번길 128", url: "https://www.artic.or.kr/base/nrr/performance/read?menuLevel=&menuNo=&performanceNo=1735" },
  "29": { address: "경기 이천시 마장면 덕이로154번길 287-76", url: city + "cultureTour/manage/view.do?idx=37&mid=0302040000", note: "고속도로 방향·진입 가능 도로를 카카오 자동차 길찾기에서 확인하세요." },
  "30": { address: "경기 이천시 율면 금율로640번길 177", url: kto("128304") },
};
export function applyAddressAudit(place: Place): Place {
  const audit = ADDRESS_AUDIT[place.id]; if (!audit) return place;
  return { ...place, address: audit.address, roadAddress: audit.address,
    ...(audit.status === "NEEDS_CHECK" ? { editorialReview: "공식 운영 장소와 주소를 확인 중인 후보예요. 확인 전에는 자동 코스 추천에서 제외합니다.", recommendationReason: "공식 운영 장소와 주소를 먼저 확인해 주세요." } : {}),
    addressEvidence: { ...audit, checkedAt: "2026-09-21" } };
}
