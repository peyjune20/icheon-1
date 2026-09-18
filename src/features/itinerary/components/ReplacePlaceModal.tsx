"use client";

import React from "react";
import Image from "next/image";
import { Place } from "@/domain/models/place";

interface ReplacePlaceModalProps {
  isOpen: boolean;
  targetPlace: Place | null;
  candidates: Place[];
  onClose: () => void;
  onSelectCandidate: (candidateId: string) => void;
}

export const ReplacePlaceModal: React.FC<ReplacePlaceModalProps> = ({
  isOpen,
  targetPlace,
  candidates,
  onClose,
  onSelectCandidate,
}) => {
  if (!isOpen || !targetPlace) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      data-testid="replace-place-modal"
    >
      <div className="w-full max-w-[480px] bg-surface rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <span className="text-xs font-bold text-primary">장소 교체</span>
            <h3 className="text-lg font-bold text-on-surface">
              &lsquo;{targetPlace.name}&rsquo; 대신 어디로 갈까요?
            </h3>
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

        {/* Current Place Note */}
        <div className="py-2.5 px-3 my-3 bg-surface-container-low rounded-xl flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-tertiary">swap_horiz</span>
          <span>현재 장소: <strong className="text-on-surface">{targetPlace.name}</strong> ({targetPlace.recommendedDurationMin}분)</span>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <p className="text-xs font-semibold text-secondary">추천 대체 후보 ({candidates.length}곳)</p>
          {candidates.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant text-sm">
              교체 가능한 대체 후보 장소가 없습니다.
            </div>
          ) : (
            candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/30 shadow-xs hover:border-primary transition-all flex gap-3 cursor-pointer group"
                onClick={() => onSelectCandidate(candidate.id)}
                data-testid={`candidate-${candidate.id}`}
              >
                <div className="w-20 h-20 rounded-lg relative overflow-hidden bg-surface-container shrink-0">
                  <Image
                    src={candidate.thumbnailImage || candidate.imageFiles[0] || "/resources/pic/3-1.jpg"}
                    alt={candidate.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-primary">
                        {candidate.name}
                      </h4>
                      <span className="text-xs text-primary font-semibold shrink-0">
                        {candidate.recommendedDurationMin}분 체류
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                      {candidate.roadAddress || candidate.address}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                      {candidate.strollerAccessible.value === "YES" && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary">
                          유모차✓
                        </span>
                      )}
                      {candidate.parking.value === "YES" && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary">
                          주차✓
                        </span>
                      )}
                      {candidate.indoorOutdoor === "INDOOR" ? (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary">실내</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container">자연</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-xs group-hover:bg-primary-container"
                    >
                      선택
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
