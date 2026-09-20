"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LatLngExpression } from "leaflet";
import { loadKakaoMaps } from "@/lib/kakao-maps";
import { MapPoint, resolveMapPoint, isLocated, isCarDestination } from "@/lib/map-points";
import { readJsonResponse } from "@/lib/client-errors";
export type { MapPoint } from "@/lib/map-points";

export function PlaceMap({ points, route = false }: { points: MapPoint[]; route?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("지도를 불러오는 중이에요.");
  const [provider, setProvider] = useState("");

  const serialized = JSON.stringify(points);
  useEffect(() => {
    const node = container.current;
    if (!node || !points.length) return;
    let disposed = false;
    let leaflet: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    const controller = new AbortController();
    const render = async () => {
      setProvider(""); setStatus("카카오 지도에서 장소를 확인하고 있어요.");
      let maps: any;
      try { maps = await loadKakaoMaps(); } catch { /* Only verified coordinates may use the labelled map fallback. */ }
      const resolvedPoints = maps ? await Promise.all(points.map(resolveMapPoint)) : points;
      if (disposed) return;
      if (resolvedPoints.some(p => !isLocated(p))) {
        setStatus("정확한 장소 위치를 확인하지 못했어요. 카카오 키·도메인을 연결하거나 아래 카카오맵에서 장소를 선택해 주세요. 미확인 위치에는 핀을 찍지 않아요.");
        return;
      }
      const mapped = resolvedPoints;
      const positions = mapped.map(p => [p.lat, p.lng] as [number, number]);
      let geometry: [number, number][] | undefined;
      let routeLabel = "방문 순서";
      if (route && mapped.some(p => !isCarDestination(p))) routeLabel = "차량 접근 지점 확인이 필요한 장소가 있어 도로선을 표시하지 않아요. 카카오맵에서 주차장·입구를 선택하세요.";
      if (route && points.length > 1 && mapped.every(isCarDestination)) {
        try {
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${mapped.map(p => `${p.lng},${p.lat}`).join(";")}?overview=full&geometries=geojson`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
          if (!response.ok) throw new Error("Route unavailable");
          const result = await readJsonResponse<any>(response);
          if (result.code !== "Ok") throw new Error("Route unavailable");
          geometry = result.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
          routeLabel = `OSRM 자동차 도로 참고 경로 · 약 ${Math.round(result.routes[0].distance / 1000)}km · 교통 상황 미반영`;
        } catch { routeLabel = "도로 경로를 불러오지 못했어요. 핀은 방문 위치이며 카카오맵 버튼에서 자동차 경로를 확인하세요."; }
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
          if (route && geometry) new maps.Polyline({ map, path: (geometry || positions).map(p => new maps.LatLng(...p)), strokeWeight: 5, strokeColor: "#e46183", strokeOpacity: .9, strokeStyle: geometry ? "solid" : "dash" });
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
      if (route && geometry) L.polyline((geometry || positions) as LatLngExpression[], { color: "#e46183", weight: 5, dashArray: geometry ? undefined : "8 8" }).addTo(leaflet);
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
    <div className="relative"><div ref={container} className="relative z-0 h-[350px] w-full sm:h-[420px]" aria-label={route ? "방문 순서와 전체 이동 경로 지도" : "장소 실제 위치 지도"} /></div>
    <p role="status" className="px-4 py-3 text-xs leading-5 text-on-surface-variant">{status} {provider && `(${provider})`}</p>
  </div>;
}
