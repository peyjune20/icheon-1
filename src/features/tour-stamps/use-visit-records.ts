"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACCOUNT_CHANGED, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyError } from "@/lib/client-errors";
import { PLACES_CHANGED } from "@/features/custom-places/use-places";
import { getTourStamps, TOUR_STAMPS_CHANGED_EVENT, TourStampRecord } from "./tour-stamps.storage";
import { deleteVisitRecord, importVisitRecords, listVisitRecords, saveVisitRecord } from "./visit-repository";
import { legacyVisitsToImport } from "./visit-dates";

export function useVisitRecords(placeIds: string[]) {
  const [stamps, setStamps] = useState<TourStampRecord[]>([]);
  const [legacy, setLegacy] = useState<TourStampRecord[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const generation = useRef(0), saving = useRef(false);

  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setStamps([]); setOwner(null); setLoading(true); setError(""); setMessage("");
    const old = getTourStamps(); setLegacy(old);
    try {
      if (!isSupabaseConfigured()) { setStamps(old); return; }
      const { data, error: authError } = await getSupabase().auth.getUser();
      if (current !== generation.current) return;
      if (authError && authError.name !== "AuthSessionMissingError") throw authError;
      if (!data.user) { setStamps(old); return; }
      setOwner(data.user.id);
      const next = await listVisitRecords(data.user.id);
      if (current === generation.current) setStamps(next);
    } catch (e) {
      // A cloud failure must never silently become a successful local save.
      if (current === generation.current) setError(friendlyError(e, "방문 기록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요."));
    } finally { if (current === generation.current) setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const events = [ACCOUNT_CHANGED, PLACES_CHANGED, TOUR_STAMPS_CHANGED_EVENT, "storage"];
    events.forEach(event => window.addEventListener(event, refresh));
    return () => { generation.current++; events.forEach(event => window.removeEventListener(event, refresh)); };
  }, [refresh]);

  const pendingImport = legacyVisitsToImport(legacy, placeIds, stamps);
  const mutate = async (action: () => Promise<void>, success: string) => {
    if (loading || saving.current || error) return;
    if (!owner) { setMessage("방문 기록을 저장하려면 먼저 로그인해 주세요. 기존 브라우저 기록은 그대로 보관되어 있어요."); return; }
    saving.current = true; setBusy(true); setMessage("");
    const current = generation.current;
    try { await action(); if (current === generation.current) { setError(""); setMessage(success); } }
    catch (e) { if (current === generation.current) setMessage(friendlyError(e, "방문 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.")); }
    finally { saving.current = false; setBusy(false); }
  };
  const save = (id: string, date: string) => {
    const current = generation.current;
    return mutate(async () => {
      const record = await saveVisitRecord(id, date, owner!);
      if (current === generation.current) setStamps(previous => [...previous.filter(item => item.placeId !== id), record]);
    }, "방문 기록을 내 계정에 저장했어요. 마을 조형물도 색칠됐어요.");
  };
  const remove = (id: string) => {
    const current = generation.current;
    return mutate(async () => {
      await deleteVisitRecord(id, owner!);
      if (current === generation.current) setStamps(previous => previous.filter(item => item.placeId !== id));
    }, "내 계정의 스탬프를 해제했어요.");
  };
  const importLegacy = () => {
    const current = generation.current;
    return mutate(async () => {
      const added = await importVisitRecords(pendingImport, owner!);
      if (current === generation.current) setStamps(previous => [...new Map([...previous, ...added].map(record => [record.placeId, record])).values()]);
    }, "기존 기록을 내 계정에 복사했어요. 브라우저 원본과 이미 저장된 방문 날짜는 유지됩니다.");
  };
  return { stamps, owner, loading, busy, error, message, refresh, save, remove, importLegacy, pendingImport };
}
