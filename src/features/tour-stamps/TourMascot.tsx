interface TourMascotProps {
  compact?: boolean;
}

export function TourMascot({ compact = false }: TourMascotProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={compact ? "h-8 w-8" : "h-14 w-14"}
      role="img"
      aria-label="베베 라이스 캐릭터"
    >
      <path d="M29 14c-3-6-8-8-12-7 1 6 5 10 12 10" fill="#ffbd60" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 14c3-6 8-8 12-7-1 6-5 10-12 10" fill="#ffbd60" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="32" cy="36" rx="19" ry="23" fill="#fffdf9" stroke="#7866b2" strokeWidth="2.5" />
      <path d="M22 25c3-4 17-4 20 0" fill="none" stroke="#f2b4c4" strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="36" r="2.2" fill="#482a38" />
      <circle cx="39" cy="36" r="2.2" fill="#482a38" />
      <circle cx="20" cy="40" r="3.5" fill="#ffc2d0" opacity="0.9" />
      <circle cx="44" cy="40" r="3.5" fill="#ffc2d0" opacity="0.9" />
      <path d="M28 43c2.5 3 5.5 3 8 0" fill="none" stroke="#482a38" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 47v7" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 54l-4 3m4-3 4 3" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
