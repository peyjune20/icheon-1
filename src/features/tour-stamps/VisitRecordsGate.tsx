import type { ReactNode } from "react";
import Link from "next/link";

export const VISIT_LOGIN_HREF = "/account?returnTo=%2Fmy-trip%23stamp-book";

export function VisitRecordsGate({ owner, loading, error, onRetry, children }: {
  owner: string | null;
  loading: boolean;
  error: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  // Keep the same account's open stamp book mounted during a background refresh.
  // Logout/account change clears owner immediately; private children then unmount.
  if (owner && !error) return <>{children}</>;
  return <section id="stamp-book" className="mt-8 scroll-mt-28 rounded-[28px] border border-outline-variant/30 bg-surface-container-low p-5 sm:p-7">
    <p className="text-xs font-bold text-primary">TOUR STAMP BOOK</p>
    {error ? <>
      <h2 className="mt-2 text-xl font-bold">방문 기록을 확인하지 못했어요</h2>
      <p role="status" className="mt-3 text-sm text-on-surface-variant">{error}</p>
      <button type="button" onClick={onRetry} disabled={loading} className="mt-4 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">다시 불러오기</button>
    </> : loading ? <p role="status" className="mt-3 text-sm text-on-surface-variant">로그인 상태와 내 방문 기록을 확인하고 있어요…</p> : <>
      <h2 className="mt-2 text-xl font-bold">스탬프는 로그인 후 이용할 수 있어요</h2>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">방문 날짜와 완성한 마을은 본인 계정에 저장돼요. 같은 계정으로 로그인하면 다른 PC와 모바일에서도 이어볼 수 있어요.</p>
      <Link href={VISIT_LOGIN_HREF} className="mt-4 inline-block rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">로그인하고 내 스탬프 보기</Link>
    </>}
  </section>;
}
