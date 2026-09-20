import { UserFacingError } from "./client-errors";

export type KakaoPlace = { id: string; place_name: string; road_address_name: string; address_name: string; x: string; y: string; place_url: string };
export type SearchPlace = { id: string; name: string; address: string; jibunAddress: string; lat: number; lng: number; source: "Kakao Maps" };
// The vendor SDK lives at this single boundary; map constructors are supplied by Kakao.
let ready: Promise<any> | undefined;
export function loadKakaoMaps(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new UserFacingError("브라우저에서 지도를 열어 주세요."));
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();
  if (!key) return Promise.reject(new UserFacingError("카카오 지도 키가 아직 연결되지 않았어요. 직접 입력은 이용할 수 있어요.", "KAKAO_CONFIG"));
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    let finished = false;
    let script = document.querySelector<HTMLScriptElement>('script[data-bebe-kakao-sdk]');
    const fail = () => {
      if (finished) return; finished = true; window.clearTimeout(timer); script?.remove(); ready = undefined;
      reject(new UserFacingError("카카오 지도를 불러오지 못했어요. 네트워크와 허용 도메인 설정을 확인하고 다시 시도해 주세요.", "KAKAO_LOAD"));
    };
    const timer = window.setTimeout(fail, 12000);
    const loaded = () => {
      const maps = (window as any).kakao?.maps;
      if (!maps?.load) { fail(); return; }
      maps.load(() => {
        if (finished) return;
        if (!maps.services?.Places) { fail(); return; }
        finished = true; window.clearTimeout(timer); resolve(maps);
      });
    };
    if ((window as any).kakao?.maps?.services?.Places) { loaded(); return; }
    if (!script) {
      script = document.createElement("script"); script.dataset.bebeKakaoSdk = "true";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`;
      script.async = true; script.addEventListener("load", loaded, { once: true }); script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    } else { script.addEventListener("load", loaded, { once: true }); script.addEventListener("error", fail, { once: true }); }
  });
  return ready;
}
export function normalizeKakaoPlace(p: KakaoPlace): SearchPlace {
  return { id: p.id, name: p.place_name, address: p.road_address_name || p.address_name, jibunAddress: p.address_name, lat: Number(p.y), lng: Number(p.x), source: "Kakao Maps" };
}
export async function searchKakaoPlaces(keyword: string): Promise<SearchPlace[]> {
  if (keyword.trim().length < 2 || keyword.length > 100) throw new UserFacingError("검색어를 2~100자로 입력해 주세요.");
  const maps = await loadKakaoMaps();
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new UserFacingError("장소 검색이 지연되고 있어요. 잠시 후 다시 시도해 주세요.")), 10000);
    new maps.services.Places().keywordSearch(keyword.trim(), (data: KakaoPlace[], status: string) => {
      window.clearTimeout(timer);
      if (status === maps.services.Status.ZERO_RESULT) { resolve([]); return; }
      if (status !== maps.services.Status.OK) { reject(new UserFacingError("장소 검색에 실패했어요. 잠시 후 다시 시도해 주세요.")); return; }
      // No radius/rect restriction: explicit destinations outside Icheon remain searchable.
      const results = data.map(normalizeKakaoPlace).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      resolve(results.sort((a, b) => Number(b.address.includes("이천시")) - Number(a.address.includes("이천시"))));
    }, { location: new maps.LatLng(37.2799, 127.4428), size: 15 });
  });
}
