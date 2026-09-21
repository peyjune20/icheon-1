"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ACCOUNT_CHANGED, getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { friendlyError } from "@/lib/client-errors";

function authLinkErrorMessage(errorCode: string | null, error: string | null) {
  if (errorCode === "otp_expired") return "이 로그인 링크는 이미 사용됐거나 만료됐어요. 새 링크를 요청한 뒤 가장 최근 메일의 링크를 한 번만 열어 주세요.";
  if (error === "access_denied") return "로그인을 완료하지 못했어요. 새 로그인 링크를 요청해 다시 시도해 주세요.";
  return "";
}

function Account() {
  const params = useSearchParams(); const [email, setEmail] = useState(""); const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const requested = params.get("returnTo") || "/my-trip";
  const returnTo = requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\") ? requested : "/my-trip";
  const linkError = authLinkErrorMessage(params.get("error_code"), params.get("error"));
  useEffect(() => {
    if (!isSupabaseConfigured()) { setMessage(linkError || "계정 저장소 연결을 준비 중이에요. 관리자가 Supabase 설정을 완료하면 로그인할 수 있어요."); return; }
    if (linkError) setMessage(linkError);
    let active = true;
    const sync = () => getSupabase().auth.getUser().then(({ data }) => { if (active) setSignedIn(!!data.user); });
    sync(); window.addEventListener(ACCOUNT_CHANGED, sync); return () => { active = false; window.removeEventListener(ACCOUNT_CHANGED, sync); };
  }, [linkError]);
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const { error } = await getSupabase().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + "/account?returnTo=" + encodeURIComponent(returnTo) } });
      if (error) throw error;
      setMessage("로그인 메일을 보냈어요. 이 브라우저에서 가장 최근 메일의 링크를 한 번만 열어 주세요. 링크는 약 1시간 뒤 만료됩니다.");
    } catch (e) { setMessage(friendlyError(e, "로그인 메일을 보내지 못했어요. 이메일 주소를 확인하고 잠시 후 다시 시도해 주세요.")); } finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true); try { const { error } = await getSupabase().auth.signOut(); if (error) throw error; setSignedIn(false); setMessage("로그아웃했어요."); } catch (e) { setMessage(friendlyError(e, "로그아웃하지 못했어요. 다시 시도해 주세요.")); } finally { setBusy(false); }
  };
  return <main className="mx-auto w-full max-w-xl px-5 pb-24 pt-28"><section className="rounded-3xl border border-outline-variant/40 bg-white p-6"><h1 className="text-2xl font-bold">우리 가족 기록 로그인</h1><p className="mt-3 text-sm leading-6 text-on-surface-variant">내 장소·방문 기록·사진·코스를 본인 계정에 안전하게 보관해요. 이메일 링크로 로그인합니다.</p>
    {signedIn ? <div className="mt-5 flex flex-wrap gap-4"><Link href={returnTo} className="rounded-full bg-primary px-5 py-3 font-bold text-white">내 기록으로 돌아가기 →</Link><button disabled={busy} onClick={signOut} className="text-sm text-primary underline">로그아웃</button></div> : <form onSubmit={signIn} className="mt-5 space-y-3"><label className="block text-sm font-bold">이메일<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><button disabled={busy || !isSupabaseConfigured()} className="w-full rounded-full bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "보내는 중…" : "이메일로 로그인 링크 받기"}</button></form>}
    <p role="status" className="mt-4 text-sm leading-6 text-secondary">{message}</p><Link href="/places" className="mt-4 inline-block text-sm underline">로그인 없이 장소 탐색하기</Link>
  </section></main>;
}
export default function AccountPage() { return <Suspense><Account /></Suspense>; }
