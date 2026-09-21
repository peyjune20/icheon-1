"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ACCOUNT_CHANGED, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyError, UserFacingError } from "@/lib/client-errors";
import { PLACES_CHANGED } from "@/features/custom-places/use-places";
import { getTourStamps, TOUR_STAMPS_CHANGED_EVENT, TOUR_STAMPS_KEY, TourStampRecord } from "./tour-stamps.storage";
import { deleteVisitRecord, importVisitRecords, listVisitRecords, saveVisitRecord } from "./visit-repository";
import { legacyVisitsToImport } from "./visit-dates";

export function useVisitRecords(placeIds: string[]) {
  const [stamps, setStamps] = useState<TourStampRecord[]>([]);
  const [legacy, setLegacy] = useState<TourStampRecord[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const [feedbackPlaceId, setFeedbackPlaceId] = useState<string | null>(null);
  const [signInRequired, setSignInRequired] = useState(false);
  const generation = useRef(0), saving = useRef(false);
  const reloadAfterSave = useRef(false);

  const refresh = useCallback(async () => {
    // A same-account refresh must not replace an in-flight save with an older read.
    if (saving.current) { reloadAfterSave.current = true; return; }
    const current = ++generation.current;
    setLoading(true); setError("");
    const old = getTourStamps(); setLegacy(old);
    try {
      if (!isSupabaseConfigured()) { setOwner(null); setStamps(old); return; }
      const { data, error: authError } = await getSupabase().auth.getUser();
      if (current !== generation.current) return;
      if (authError && authError.name !== "AuthSessionMissingError") throw authError;
      if (!data.user) { setOwner(null); setStamps(old); return; }
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
    const accountChanged = () => {
      // Clear private data immediately only when the account really changes.
      generation.current++; setStamps([]); setOwner(null); setMessage("");
      setFeedbackPlaceId(null); setSignInRequired(false); setLoading(true); refresh();
    };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === TOUR_STAMPS_KEY || event.key === null) refresh();
    };
    const events = [PLACES_CHANGED, TOUR_STAMPS_CHANGED_EVENT];
    window.addEventListener(ACCOUNT_CHANGED, accountChanged);
    window.addEventListener("storage", storageChanged);
    events.forEach(event => window.addEventListener(event, refresh));
    return () => { generation.current++; window.removeEventListener(ACCOUNT_CHANGED, accountChanged); window.removeEventListener("storage", storageChanged); events.forEach(event => window.removeEventListener(event, refresh)); };
  }, [refresh]);

  const pendingImport = legacyVisitsToImport(legacy, placeIds, stamps);
  const mutate = async (placeId: string | null, action: () => Promise<void>, success: string) => {
    if (saving.current) return;
    setFeedbackPlaceId(placeId); setSignInRequired(false);
    if (loading) { setMessage("방문 기록을 불러오고 있어요. 잠시 후 다시 눌러 주세요."); return; }
    if (error) { setMessage(error); return; }
    if (!owner) { setSignInRequired(true); setMessage("스탬프를 저장하려면 로그인해 주세요. 로그인 후 이 화면으로 돌아옵니다."); return; }
    saving.current = true; setBusy(true); setMessage("방문 기록을 저장하고 있어요…");
    const current = generation.current;
    try { await action(); if (current === generation.current) { setError(""); setMessage(success); } }
    catch (e) { if (current === generation.current) { setSignInRequired(e instanceof UserFacingError && e.code === "AUTH"); setMessage(friendlyError(e, "방문 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.")); } }
    finally { saving.current = false; setBusy(false); if (reloadAfterSave.current) { reloadAfterSave.current = false; void refresh(); } }
  };
  const save = (id: string, date: string) => {
    const current = generation.current;
    return mutate(id, async () => {
      const record = await saveVisitRecord(id, date, owner!);
      if (current === generation.current) setStamps(previous => [...previous.filter(item => item.placeId !== id), record]);
    }, "방문 기록을 내 계정에 저장했어요. 마을 조형물도 색칠됐어요.");
  };
  const remove = (id: string) => {
    const current = generation.current;
    return mutate(id, async () => {
      await deleteVisitRecord(id, owner!);
      if (current === generation.current) setStamps(previous => previous.filter(item => item.placeId !== id));
    }, "내 계정의 스탬프를 해제했어요.");
  };
  const importLegacy = () => {
    const current = generation.current;
    return mutate(null, async () => {
      const added = await importVisitRecords(pendingImport, owner!);
      if (current === generation.current) setStamps(previous => [...new Map([...previous, ...added].map(record => [record.placeId, record])).values()]);
    }, "기존 기록을 내 계정에 복사했어요. 브라우저 원본과 이미 저장된 방문 날짜는 유지됩니다.");
  };
  return { stamps, owner, loading, busy, error, message, feedbackPlaceId, signInRequired, refresh, save, remove, importLegacy, pendingImport };
}
