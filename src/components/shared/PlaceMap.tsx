"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LatLngExpression } from "leaflet";

export interface MapPoint { id: string; name: string; lat: number; lng: number; address?: string; coordinateSource?: string; }
let kakaoReady: Promise<any> | undefined;
const loadKakao = (key: string): Promise<any> => {
  if (!kakaoReady) kakaoReady = new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Map timeout")), 8000);
    const sdk = document.createElement("script");
    sdk.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    sdk.onload = () => {
      const kakao = (window as any).kakao;
      if (!kakao?.maps) { reject(new Error("Map unavailable")); return; }
      kakao.maps.load(() => { window.clearTimeout(timer); resolve(kakao.maps); });
    };
    sdk.onerror = reject;
    document.head.appendChild(sdk);
  });
  return kakaoReady;
};

export function PlaceMap({ points, route = false }: { points: MapPoint[]; route?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("지도를 불러오는 중이에요.");
  const [provider, setProvider] = useState("");
  const [addressMap, setAddressMap] = useState("");
  const serialized = JSON.stringify(points);
  useEffect(() => {
    const node = container.current;
    if (!node || !points.length) return;
    let disposed = false;
    let leaflet: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    const controller = new AbortController();
    const render = async () => {
      setAddressMap("");
      let key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
      try { const config: { kakaoMapKey?: string } = await fetch("/api/config", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(3000)]) }).then(r => r.ok ? r.json() : {}); key ||= config.kakaoMapKey; } catch { /* Static preview */ }
      let resolvedPoints = points;
      let maps: any;
      if (key) {
        try {
          maps = await loadKakao(key);
          const geocoder = new maps.services.Geocoder();
          resolvedPoints = await Promise.all(points.map(p => p.coordinateSource || !p.address ? p : new Promise<MapPoint>((resolve) => {
            const timer = window.setTimeout(() => resolve(p), 5000);
            geocoder.addressSearch(p.address, (data: any[], status: string) => { window.clearTimeout(timer); resolve(status === maps.services.Status.OK && data[0] ? { ...p, lat: Number(data[0].y), lng: Number(data[0].x), coordinateSource: "Kakao 주소 검색" } : p); });
          })));
        } catch { maps = undefined; }
      }
      if (disposed) return;
      // Never place a precise-looking pin at an old, unverified seed coordinate.
      if (resolvedPoints.some(p => p.address && !p.coordinateSource)) {
        const query = (p: MapPoint) => p.coordinateSource ? `${p.lat},${p.lng}` : p.address || p.name;
        const params = new URLSearchParams({ output: "embed", hl: "ko" });
        if (route && points.length > 1) { params.set("saddr", query(points[0])); params.set("daddr", points.slice(1).map(query).join(" to:")); }
        else params.set("q", query(points[0]));
        setAddressMap(`https://maps.google.com/maps?${params}`);
        setProvider("Google Maps 주소 검색"); setStatus("등록 주소로 찾은 지도예요. 정확한 입구와 자동차 경로는 아래 카카오맵에서 최종 확인하세요."); return;
      }
      const mapped = resolvedPoints;
      let positions = mapped.map(p => [p.lat, p.lng] as [number, number]);
      let geometry: [number, number][] | undefined;
      let routeLabel = "방문 순서";
      if (route && points.length > 1) {
        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${mapped.map(p => `${p.lng},${p.lat}`).join(";")}?overview=full&geometries=geojson`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
          if (!response.ok) throw new Error("Route unavailable");
          const result = await response.json();
          if (result.code !== "Ok") throw new Error("Route unavailable");
          geometry = result.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
          routeLabel = `도로 기준 예상 경로 · 약 ${Math.round(result.routes[0].distance / 1000)}km · 교통 상황 미반영`;
        } catch { routeLabel = "도로 경로를 불러오지 못해 방문 순서만 점선으로 표시해요."; }
      }
      if (disposed) return;
      if (maps) {
        try {
          if (disposed) return;
          const map = new maps.Map(node, { center: new maps.LatLng(...positions[0]), level: 5 });
          const bounds = new maps.LatLngBounds();
          mapped.forEach((p, i) => {
            const position = new maps.LatLng(p.lat, p.lng);
            bounds.extend(position);
            const content = document.createElement("div");
            content.className = "map-number-label";
            content.textContent = `${i + 1}. ${p.name}`;
            new maps.CustomOverlay({ map, position, content, yAnchor: 1.2 });
            new maps.Marker({ map, position });
          });
          if (route && points.length > 1) new maps.Polyline({ map, path: (geometry || positions).map(p => new maps.LatLng(...p)), strokeWeight: 5, strokeColor: "#e46183", strokeOpacity: .9, strokeStyle: geometry ? "solid" : "dash" });
          geometry?.forEach(p => bounds.extend(new maps.LatLng(...p)));
          if (points.length > 1) map.setBounds(bounds, 60, 55, 60, 55);
          observer = new ResizeObserver(() => map.relayout()); observer.observe(node);
          setProvider("Kakao Maps"); setStatus(route ? routeLabel : "실제 지도에서 위치와 주변 도로를 확인하세요."); return;
        } catch { /* An unavailable Kakao key must not leave an empty map. */ }
      }
      const L = await import("leaflet");
      if (disposed) return;
      leaflet = L.map(node, { scrollWheelZoom: false }).setView(positions[0], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(leaflet);
      mapped.forEach((p, index) => {
        const label = document.createElement("span"); label.textContent = `${index + 1}. ${p.name}`;
        L.marker([p.lat, p.lng], { icon: L.divIcon({ html: `<span class="map-number">${index + 1}</span>`, className: "map-number-icon", iconSize: [30, 30], iconAnchor: [15, 30] }) }).addTo(leaflet!).bindTooltip(label, { permanent: !route, direction: "top", offset: [0, -30] });
      });
      if (route && points.length > 1) L.polyline((geometry || positions) as LatLngExpression[], { color: "#e46183", weight: 5, dashArray: geometry ? undefined : "8 8" }).addTo(leaflet);
      if (points.length > 1) leaflet.fitBounds(L.latLngBounds(geometry || positions), { padding: [45, 55], maxZoom: 15 });
      observer = new ResizeObserver(() => leaflet?.invalidateSize()); observer.observe(node);
      setProvider("OpenStreetMap"); setStatus(route ? routeLabel : "실제 지도에서 위치와 주변 도로를 확인하세요.");
    };
    render().catch(() => { if (!disposed) setStatus("지도를 불러오지 못했어요. 아래 카카오맵 버튼으로 위치를 확인해 주세요."); });
    return () => { disposed = true; controller.abort(); observer?.disconnect(); leaflet?.remove(); node.replaceChildren(); };
  // Points are compared by value to avoid remounts after unrelated state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, route]);
  return <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white">
    <div className="relative"><div ref={container} className="relative z-0 h-[350px] w-full sm:h-[420px]" aria-label={route ? "방문 순서와 전체 이동 경로 지도" : "장소 실제 위치 지도"} />{addressMap && <iframe title={route ? "주소 기반 전체 코스 지도" : "장소 주소 검색 지도"} src={addressMap} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}</div>
    <p role="status" className="px-4 py-3 text-xs leading-5 text-on-surface-variant">{status} {provider && `(${provider})`}</p>
  </div>;
}
