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
        primary: "#197a4a",
        "primary-container": "#25945a",
        "on-primary": "#ffffff",
        "on-primary-container": "#e1ffe5",
        "primary-fixed": "#d9f7e0",
        "primary-fixed-dim": "#b5eac3",
        "on-primary-fixed": "#0d3b23",
        "on-primary-fixed-variant": "#15663d",

        secondary: "#627267",
        "secondary-container": "#e9f2eb",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#42564a",
        "secondary-fixed": "#e9f2eb",
        "secondary-fixed-dim": "#cfdfd2",
        "on-secondary-fixed": "#203329",

        tertiary: "#d76338",
        "tertiary-container": "#ef855e",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#fff5f3",
        "tertiary-fixed": "#ffdad2",
        "tertiary-fixed-dim": "#ffb4a3",
        "on-tertiary-fixed": "#3d0600",

        surface: "#f8fcf8",
        "surface-bright": "#ffffff",
        "surface-dim": "#dde8df",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f8f2",
        "surface-container": "#e7f2e9",
        "surface-container-high": "#deece1",
        "surface-container-highest": "#d4e4d7",
        "on-surface": "#173125",
        "on-surface-variant": "#466052",

        outline: "#738b79",
        "outline-variant": "#c8ddcc",
        "surface-tint": "#197a4a",

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
