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
        primary: "#ed7185",
        "primary-container": "#f38da0",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",
        "primary-fixed": "#ffe1e8",
        "primary-fixed-dim": "#ffc2d0",
        "on-primary-fixed": "#632235",
        "on-primary-fixed-variant": "#b4475f",

        secondary: "#7866b2",
        "secondary-container": "#eeeaff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#584786",
        "secondary-fixed": "#eeeaff",
        "secondary-fixed-dim": "#d9d0fb",
        "on-secondary-fixed": "#35265d",

        tertiary: "#d99024",
        "tertiary-container": "#ffbd60",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#613800",
        "tertiary-fixed": "#ffe2ad",
        "tertiary-fixed-dim": "#ffc96e",
        "on-tertiary-fixed": "#533000",

        surface: "#fff9fb",
        "surface-bright": "#ffffff",
        "surface-dim": "#f1dde5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff0f5",
        "surface-container": "#ffe7ee",
        "surface-container-high": "#f9dce6",
        "surface-container-highest": "#efceda",
        "on-surface": "#482a38",
        "on-surface-variant": "#765968",

        outline: "#b88e9f",
        "outline-variant": "#f0cad7",
        "surface-tint": "#ed7185",

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
