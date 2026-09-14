"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Place } from "@/domain/models/place";

interface ReorderModalProps {
  isOpen: boolean;
  places: Place[];
  onClose: () => void;
  onApplyOrder: (newOrderedPlaceIds: string[]) => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  places,
  onClose,
  onApplyOrder,
}) => {
  const [orderedList, setOrderedList] = useState<Place[]>(places);

  useEffect(() => {
    setOrderedList(places);
  }, [places]);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...orderedList];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOrderedList(updated);
  };

  const moveDown = (index: number) => {
    if (index === orderedList.length - 1) return;
    const updated = [...orderedList];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOrderedList(updated);
  };

  const handleApply = () => {
    onApplyOrder(orderedList.map((p) => p.id));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      data-testid="reorder-modal"
    >
      <div className="w-full max-w-[480px] bg-surface rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <span className="text-xs font-bold text-primary">순서 변경</span>
            <h3 className="text-lg font-bold text-on-surface">방문 순서 재배열</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant my-3">
          화살표 버튼을 눌러 방문 순서를 변경하세요. 변경 시 이동 동선이 자동으로 재계산됩니다.
        </p>

        {/* Ordered Places List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {orderedList.map((place, idx) => (
            <div
              key={place.id}
              className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/30 shadow-xs flex items-center gap-3"
              data-testid={`reorder-item-${place.id}`}
            >
              {/* Order Node */}
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </div>

              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                <Image
                  src={place.thumbnailImage || place.imageFiles[0] || "/resources/pic/3-1.jpg"}
                  alt={place.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-on-surface truncate">{place.name}</h4>
                <p className="text-xs text-on-surface-variant">{place.recommendedDurationMin}분 체류</p>
              </div>

              {/* Up / Down Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  aria-label="위로 이동"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    idx === 0
                      ? "text-outline-variant cursor-not-allowed"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface active:scale-95"
                  }`}
                  data-testid={`btn-move-up-${place.id}`}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === orderedList.length - 1}
                  aria-label="아래로 이동"
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    idx === orderedList.length - 1
                      ? "text-outline-variant cursor-not-allowed"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface active:scale-95"
                  }`}
                  data-testid={`btn-move-down-${place.id}`}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Apply CTA */}
        <div className="pt-3 border-t border-outline-variant/30 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-full border border-outline-variant/50 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 rounded-full bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-container active:scale-[0.98]"
            data-testid="btn-apply-reorder"
          >
            순서 적용하기
          </button>
        </div>
      </div>
    </div>
  );
};
