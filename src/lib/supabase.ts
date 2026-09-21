import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserFacingError } from "./client-errors";

export const ACCOUNT_CHANGED = "bebe-account-changed";
// Keep direct property access: Next.js replaces NEXT_PUBLIC_* at build time.
export const getSupabasePublicConfig = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "",
});
export const isSupabaseConfigured = () => { const { url, key } = getSupabasePublicConfig(); return !!(url && key); };
let client: SupabaseClient | undefined;
let lastAccount: string | null | undefined;
export function getSupabase() {
  if (!isSupabaseConfigured()) throw new UserFacingError("계정 저장소 연결을 준비 중이에요. 관리자에게 Supabase 설정을 요청해 주세요.", "CONFIG");
  if (!client) {
    const { url, key } = getSupabasePublicConfig();
    client = createClient(url, key);
    client.auth.onAuthStateChange((_event, session) => {
      const account = session?.user.id || null;
      if (account === lastAccount) return;
      const initialSession = lastAccount === undefined && _event === "INITIAL_SESSION";
      lastAccount = account;
      // Consumers already load the initial user. A delayed initial notification
      // must not erase a click's feedback or remount the stamp book.
      if (initialSession) return;
      if (typeof window !== "undefined") window.setTimeout(() => window.dispatchEvent(new Event(ACCOUNT_CHANGED)), 0);
    });
  }
  return client;
}
export async function requireUser(expectedUserId?: string) {
  const db = getSupabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new UserFacingError("내 기록을 저장하려면 먼저 로그인해 주세요.", "AUTH");
  if (expectedUserId && data.user.id !== expectedUserId) throw new UserFacingError("로그인 계정이 바뀌었어요. 목록을 다시 확인해 주세요.", "AUTH_CHANGED");
  return { db, user: data.user };
}
