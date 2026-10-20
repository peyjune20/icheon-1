"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ACCOUNT_CHANGED, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyError, UserFacingError } from "@/lib/client-errors";
import { PLACES_CHANGED } from "@/features/custom-places/use-places";
import { deleteAccountSavedPlace, listAccountSavedPlaces, saveAccountPlaces } from "./saved-places.repository";
import {
  getGuestSavedPlaceIds, removeGuestSavedPlace, saveGuestPlace,
  SAVED_PLACE_IDS_KEY, SAVED_PLACES_CHANGED_EVENT,
} from "./saved-places.storage";

// Only an invalidation token is shared across tabs, never account IDs or bookmarks.
const ACCOUNT_BOOKMARKS_SIGNAL = "icheon-bebe-road:account-bookmarks-changed";
type Status = "loading" | "ready" | "error";
type SavedPlacesState = {
  ids: string[];
  guestIds: string[];
  owner: string | null;
  status: Status;
  busy: boolean;
  message: string;
  error: string;
  refresh: () => Promise<void>;
  save: (id: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  toggle: (id: string) => Promise<boolean>;
  importGuest: (ids: string[]) => Promise<boolean>;
};
const SavedPlacesContext = createContext<SavedPlacesState | null>(null);

async function currentOwner(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getSupabase().auth.getUser();
  // A network/auth failure is not proof that the visitor is a guest.
  if (error && error.name !== "AuthSessionMissingError") throw error;
  return data.user?.id || null;
}

export function SavedPlacesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]), [guestIds, setGuestIds] = useState<string[]>([]);
  const [owner, setOwner] = useState<string | null>(null), [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [error, setError] = useState("");
  const generation = useRef(0), saving = useRef(false), reloadAfterSave = useRef(false);
  const scope = useRef<string | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (saving.current) { reloadAfterSave.current = true; return; }
    const current = ++generation.current;
    setStatus("loading"); setError("");
    const guest = getGuestSavedPlaceIds();
    setGuestIds(guest);
    try {
      const account = await currentOwner();
      if (current !== generation.current) return;
      if (scope.current !== account) { setIds([]); setMessage(""); }
      scope.current = account; setOwner(account);
      const next = account ? await listAccountSavedPlaces(account) : guest;
      if (current !== generation.current) return;
      setIds(next); setStatus("ready");
    } catch (e) {
      if (current !== generation.current) return;
      setIds([]); setStatus("error");
      setError(friendlyError(e, "찜 목록을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요."));
    }
  }, []);

  useEffect(() => {
    const accountChanged = () => {
      // Invalidate reads/writes before refreshing; never show the previous account's list.
      generation.current++; scope.current = undefined;
      setIds([]); setOwner(null); setMessage(""); setError(""); setStatus("loading");
      void refresh();
    };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === SAVED_PLACE_IDS_KEY || event.key === ACCOUNT_BOOKMARKS_SIGNAL || event.key === null) void refresh();
    };
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    window.addEventListener(ACCOUNT_CHANGED, accountChanged);
    window.addEventListener(SAVED_PLACES_CHANGED_EVENT, refresh);
    window.addEventListener(PLACES_CHANGED, refresh);
    window.addEventListener("storage", storageChanged);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      generation.current++;
      window.removeEventListener(ACCOUNT_CHANGED, accountChanged);
      window.removeEventListener(SAVED_PLACES_CHANGED_EVENT, refresh);
      window.removeEventListener(PLACES_CHANGED, refresh);
      window.removeEventListener("storage", storageChanged);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  const mutate = async (selectedIds: string[], operation: "save" | "remove" | "import") => {
    if (saving.current || status !== "ready") return false;
    if (!selectedIds.length) { setMessage("복사할 임시 찜을 다시 선택해 주세요."); return false; }
    const expectedOwner = scope.current;
    if (expectedOwner === undefined || (operation === "import" && !expectedOwner)) return false;
    const current = generation.current;
    saving.current = true; setBusy(true); setMessage("");
    try {
      // Also check before guest writes: a delayed login must not write to guest storage.
      if (await currentOwner() !== expectedOwner) throw new UserFacingError("로그인 상태가 바뀌었어요. 찜 목록을 다시 확인해 주세요.", "AUTH_CHANGED");
      if (current !== generation.current) return false;
      if (expectedOwner) {
        if (operation === "remove") await deleteAccountSavedPlace(selectedIds[0], expectedOwner);
        else await saveAccountPlaces(selectedIds, expectedOwner);
        if (current !== generation.current) return false;
        setIds(previous => operation === "remove"
          ? previous.filter(id => id !== selectedIds[0])
          : [...new Set([...previous, ...selectedIds])]);
        // Storage may be unavailable; a notification failure must not undo a successful DB write.
        try { window.localStorage.setItem(ACCOUNT_BOOKMARKS_SIGNAL, `${Date.now()}-${Math.random()}`); } catch {}
      } else {
        if (operation !== "remove" && !/^([1-9]|[12][0-9]|30)$/.test(selectedIds[0])) {
          throw new UserFacingError("직접 추가한 장소를 찜하려면 해당 계정으로 로그인해 주세요.", "AUTH");
        }
        const next = operation === "remove" ? removeGuestSavedPlace(selectedIds[0]) : saveGuestPlace(selectedIds[0]);
        setIds(next); setGuestIds(next);
      }
      setMessage(operation === "import" ? "선택한 임시 찜을 내 계정에 복사했어요. 브라우저 원본은 그대로 유지됩니다."
        : operation === "remove" ? (expectedOwner ? "내 계정의 찜을 취소했어요." : "이 브라우저의 임시 찜을 취소했어요.")
        : expectedOwner ? "내 계정에 찜했어요." : "이 브라우저에 임시 찜했어요.");
      return true;
    } catch (e) {
      if (current === generation.current) {
        setMessage(friendlyError(e, "찜 목록을 변경하지 못했어요. 잠시 후 다시 시도해 주세요."));
        if (e instanceof UserFacingError && (e.code === "AUTH_CHANGED" || e.code === "AUTH")) {
          scope.current = undefined; setIds([]); setOwner(null); setStatus("loading");
          reloadAfterSave.current = true;
        }
      }
      return false;
    } finally {
      saving.current = false; setBusy(false);
      if (reloadAfterSave.current) { reloadAfterSave.current = false; void refresh(); }
    }
  };
  const save = (id: string) => mutate([id], "save");
  const remove = (id: string) => mutate([id], "remove");
  const toggle = (id: string) => ids.includes(id) ? remove(id) : save(id);
  // Only the explicitly selected, still-existing guest items can be copied.
  const importGuest = (selected: string[]) => mutate(
    [...new Set(selected)].filter(id => getGuestSavedPlaceIds().includes(id) && !ids.includes(id)), "import",
  );
  return <SavedPlacesContext.Provider value={{ ids, guestIds, owner, status, busy, error, message, refresh, save, remove, toggle, importGuest }}>{children}</SavedPlacesContext.Provider>;
}

export function useSavedPlaces() {
  const state = useContext(SavedPlacesContext);
  if (!state) throw new Error("useSavedPlaces requires SavedPlacesProvider");
  return state;
}
