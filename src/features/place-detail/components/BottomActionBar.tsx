"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Place } from "@/domain/models/place";
import { useSavedPlaces } from "@/features/saved-places/use-saved-places";
import { readActiveCourse } from "@/features/itinerary/active-course";
import { readSavedPlan } from "@/features/custom-places/account-repository";

interface BottomActionBarProps {
  place: Place;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({ place }) => {
  const bookmarks = useSavedPlaces();
  const isBookmarked = bookmarks.status === "ready" && bookmarks.ids.includes(place.id);
  const bookmarkDisabled = bookmarks.status !== "ready" || bookmarks.busy;
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsAdded(false); setError("");
  }, [place.id, bookmarks.owner]);

  const handleToggleBookmark = () => {
    void bookmarks.toggle(place.id);
  };

  const handleAddToCourse = async () => {
    if (!await bookmarks.save(place.id)) return;
    setIsAdded(true);
    setError("");
    try {
      const plan = readActiveCourse() || await readSavedPlan();
      const params = new URLSearchParams(plan?.query || "");
      params.set("stops", [...new Set<string>([...(plan?.ids || []), place.id])].join(","));
      router.push(`/itinerary?${params}`);
    } catch { setError("코스에 연결하지 못했어요. 다시 시도해 주세요."); setIsAdded(false); }
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(43,43,43,0.06)] z-40 pb-safe"
      data-testid="bottom-action-bar"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2.5">
        {(error || bookmarks.error || bookmarks.message) && <p role="status" className="w-full text-xs text-primary">{error || bookmarks.error || bookmarks.message}{bookmarks.status === "error" && <button type="button" onClick={() => void bookmarks.refresh()} className="ml-2 underline">다시 불러오기</button>}</p>}
        {/* Bookmark Button with Toggle Animation */}
        <button
          type="button"
          aria-label="장소 찜하기"
          aria-pressed={isBookmarked}
          title={bookmarks.owner ? "내 계정의 찜" : "이 브라우저의 임시 찜"}
          onClick={handleToggleBookmark}
          disabled={bookmarkDisabled}
          className={`h-12 px-4 rounded-full border flex items-center justify-center gap-1.5 text-sm font-semibold transition-all active:scale-95 shrink-0 shadow-xs disabled:opacity-50 ${
            isBookmarked
              ? "bg-primary/10 border-primary text-primary"
              : "bg-white border-outline-variant/50 text-on-surface hover:bg-surface-container"
          }`}
          data-testid="btn-bookmark"
        >
          <span
            className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${
              isBookmarked ? "scale-110 text-primary" : "text-on-surface-variant"
            }`}
            style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            data-testid="bookmark-icon"
          >
            {isBookmarked ? "bookmark" : "bookmark_border"}
          </span>
          <span data-testid="bookmark-text">{bookmarks.status === "loading" ? "확인 중…" : isBookmarked ? (bookmarks.owner ? "찜됨" : "임시 찜됨") : bookmarks.owner ? "찜" : "임시 찜"}</span>
        </button>

        {/* Primary Course Add Button with Feedback */}
        <button
          type="button"
          onClick={handleAddToCourse}
          disabled={isAdded || bookmarkDisabled || !!place.unavailableReason}
          className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all active:scale-[0.98] ${
            isAdded
              ? "bg-primary-container text-white"
              : "bg-primary text-white hover:bg-primary-container"
          }`}
          data-testid="btn-add-to-course"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isAdded ? "check" : "add_circle"}
          </span>
          <span data-testid="add-feedback-text">
            {place.unavailableReason ? "운영 정보 확인 후 추가 가능" : isAdded ? "코스에 추가되었습니다" : "이 장소를 내 코스에 담기"}
          </span>
        </button>
      </div>
    </div>
  );
};
