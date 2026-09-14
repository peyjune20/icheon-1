import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#316342",
        "primary-container": "#4a7c59",
        "on-primary": "#ffffff",
        "on-primary-container": "#e1ffe5",
        "primary-fixed": "#b9efc5",
        "primary-fixed-dim": "#9dd3aa",
        "on-primary-fixed": "#00210e",
        "on-primary-fixed-variant": "#1e5031",

        secondary: "#5f5e5a",
        "secondary-container": "#e5e2dc",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#656460",
        "secondary-fixed": "#e5e2dc",
        "secondary-fixed-dim": "#c9c6c1",
        "on-secondary-fixed": "#1c1c18",

        tertiary: "#943f2b",
        "tertiary-container": "#b35641",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fff5f3",
        "tertiary-fixed": "#ffdad2",
        "tertiary-fixed-dim": "#ffb4a3",
        "on-tertiary-fixed": "#3d0600",

        surface: "#fcf9f8",
        "surface-bright": "#fcf9f8",
        "surface-dim": "#dcd9d9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "surface-container": "#f0eded",
        "surface-container-high": "#eae7e7",
        "surface-container-highest": "#e4e2e1",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#414942",

        outline: "#717971",
        "outline-variant": "#c1c9bf",
        "surface-tint": "#376847",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
      },
      spacing: {
        gutter: "1rem",
        "gutter-mobile": "0.75rem",
        margin: "1.25rem",
        "margin-mobile": "1rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
      },
      fontFamily: {
        headline: ["'Plus Jakarta Sans'", "'Noto Sans KR'", "sans-serif"],
        body: ["'Noto Sans KR'", "sans-serif"],
        numeric: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["22px", { lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["18px", { lineHeight: "26px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.02em", fontWeight: "500" }],
        "numeric-callout": ["20px", { lineHeight: "24px", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      }
    },
  },
  plugins: [],
};

export default config;
