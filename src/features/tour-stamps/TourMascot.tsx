import { PlaceCategory } from "@/domain/models/place";

export type TourMascotTheme = "rice" | "cafe" | "nature" | "park" | "indoor" | "experience";

interface TourMascotProps {
  compact?: boolean;
  category?: PlaceCategory;
}

const MASCOT_THEMES: Record<TourMascotTheme, { label: string; fill: string; accent: string }> = {
  rice: { label: "BEBE RICE", fill: "#fffdf9", accent: "#ffbd60" },
  cafe: { label: "COZY CAFE", fill: "#fff7f8", accent: "#ed7185" },
  nature: { label: "FOREST FRIEND", fill: "#f6fcf3", accent: "#76b96f" },
  park: { label: "PARK BUD", fill: "#fff8ed", accent: "#ff9fb3" },
  indoor: { label: "COZY INDOOR", fill: "#f7f5ff", accent: "#8f7bd5" },
  experience: { label: "PLAY DAY", fill: "#fff9e9", accent: "#f1ad43" },
};

export function getTourMascotTheme(category?: PlaceCategory): TourMascotTheme {
  if (category === "CAFE") return "cafe";
  if (category === "NATURE") return "nature";
  if (category === "PARK") return "park";
  if (category === "INDOOR") return "indoor";
  if (category === "EXPERIENCE") return "experience";
  return "rice";
}

export function getTourMascotLabel(category?: PlaceCategory) {
  return MASCOT_THEMES[getTourMascotTheme(category)].label;
}

function MascotAccessory({ theme, accent }: { theme: TourMascotTheme; accent: string }) {
  if (theme === "rice") {
    return (
      <>
        <path d="M29 14c-3-6-8-8-12-7 1 6 5 10 12 10" fill={accent} stroke="#7866b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 14c3-6 8-8 12-7-1 6-5 10-12 10" fill={accent} stroke="#7866b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }

  if (theme === "cafe") {
    return (
      <>
        <path d="M23 18c1-4 5-5 9-5s8 1 9 5" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M23 46h18c2 0 3-2 3-4V32H20v10c0 2 1 4 3 4Z" fill={accent} stroke="#7866b2" strokeWidth="2" strokeLinejoin="round" />
        <path d="M44 35h4c3 0 3 7 0 7h-4" fill="none" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 28c-2-2 1-4 0-6m6 6c-2-2 1-4 0-6" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
      </>
    );
  }

  if (theme === "nature") {
    return (
      <>
        <path d="M32 17c-2-7 2-11 7-13 1 7-1 12-7 13Z" fill={accent} stroke="#7866b2" strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 18c-6-5-12-4-15-1 6 4 11 4 15 1Z" fill="#a4d696" stroke="#7866b2" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 39c-4 1-5 6-2 8l5-2" fill="#b3dca5" stroke="#7866b2" strokeWidth="2" strokeLinejoin="round" />
      </>
    );
  }

  if (theme === "park") {
    return (
      <>
        <g fill={accent} stroke="#7866b2" strokeWidth="1.6">
          <ellipse cx="32" cy="14" rx="4" ry="7" />
          <ellipse cx="22" cy="18" rx="4" ry="7" transform="rotate(-48 22 18)" />
          <ellipse cx="42" cy="18" rx="4" ry="7" transform="rotate(48 42 18)" />
          <ellipse cx="25" cy="10" rx="4" ry="7" transform="rotate(48 25 10)" />
          <ellipse cx="39" cy="10" rx="4" ry="7" transform="rotate(-48 39 10)" />
        </g>
        <circle cx="32" cy="14" r="3" fill="#ffcf67" stroke="#7866b2" strokeWidth="1.5" />
      </>
    );
  }

  if (theme === "indoor") {
    return (
      <>
        <path d="M19 24 32 13l13 11" fill="#cfc4ff" stroke="#7866b2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 22v6m18-6v6" stroke="#7866b2" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="24" y="44" width="16" height="8" rx="3" fill={accent} stroke="#7866b2" strokeWidth="1.8" />
        <path d="M29 48h6" stroke="#fffdf9" strokeWidth="1.6" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <path d="m32 10 3.4 7 7.6 1.1-5.5 5.3 1.3 7.6-6.8-3.7-6.8 3.7 1.3-7.6-5.5-5.3 7.6-1.1Z" fill={accent} stroke="#7866b2" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 44h8v8h-8zm20 0h8v8h-8z" fill="#ffdb91" stroke="#7866b2" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  );
}

export function TourMascot({ compact = false, category }: TourMascotProps) {
  const theme = getTourMascotTheme(category);
  const { fill, accent, label } = MASCOT_THEMES[theme];

  return (
    <svg
      viewBox="0 0 64 64"
      className={compact ? "h-8 w-8" : "h-14 w-14"}
      role="img"
      aria-label={`${label} 캐릭터`}
    >
      <MascotAccessory theme={theme} accent={accent} />
      <ellipse cx="32" cy="37" rx="18" ry="21" fill={fill} stroke="#7866b2" strokeWidth="2.5" />
      <path d="M22 28c3-3 17-3 20 0" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="37" r="2.2" fill="#482a38" />
      <circle cx="39" cy="37" r="2.2" fill="#482a38" />
      <circle cx="20" cy="41" r="3.5" fill="#ffc2d0" opacity="0.9" />
      <circle cx="44" cy="41" r="3.5" fill="#ffc2d0" opacity="0.9" />
      <path d="M28 44c2.5 3 5.5 3 8 0" fill="none" stroke="#482a38" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 48v6" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 54l-4 3m4-3 4 3" stroke="#7866b2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
