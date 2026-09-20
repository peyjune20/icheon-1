import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserFacingError } from "./client-errors";

export const ACCOUNT_CHANGED = "bebe-account-changed";
export const isSupabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
let client: SupabaseClient | undefined;
let lastAccount: string | null | undefined;
export function getSupabase() {
  if (!isSupabaseConfigured()) throw new UserFacingError("계정 저장소 연결을 준비 중이에요. 관리자에게 Supabase 설정을 요청해 주세요.", "CONFIG");
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    client.auth.onAuthStateChange((_event, session) => {
      const account = session?.user.id || null;
      if (account === lastAccount) return;
      lastAccount = account;
      if (typeof window !== "undefined") window.setTimeout(() => window.dispatchEvent(new Event(ACCOUNT_CHANGED)), 0);
    });
  }
  return client;
}
export async function requireUser() {
  const db = getSupabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new UserFacingError("내 기록을 저장하려면 먼저 로그인해 주세요.", "AUTH");
  return { db, user: data.user };
}
