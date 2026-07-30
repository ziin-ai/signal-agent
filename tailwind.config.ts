import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
        info: "var(--color-info)",
        secondary: "var(--color-secondary)",
        primary: "var(--md-sys-color-primary)",
        "on-primary": "var(--md-sys-color-on-primary)",
        "primary-container": "var(--md-sys-color-primary-container)",
        "on-primary-container": "var(--md-sys-color-on-primary-container)",
        surface: "var(--md-sys-color-surface)",
        "on-surface": "var(--md-sys-color-on-surface)",
        "surface-container": "var(--md-sys-color-surface-container)",
        "surface-container-low": "var(--md-sys-color-surface-container-low)",
        "surface-container-high": "var(--md-sys-color-surface-container-high)",
        "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
        outline: "var(--md-sys-color-outline)",
        "outline-variant": "var(--md-sys-color-outline-variant)",
        "market-up": "var(--md-sys-color-market-up)",
        "market-down": "var(--md-sys-color-market-down)",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "system-ui", "sans-serif"],
        serif: ["Noto Sans KR", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        md3: "var(--md-sys-shape-corner-medium)",
        "md3-sm": "var(--md-sys-shape-corner-small)",
        "md3-lg": "var(--md-sys-shape-corner-large)",
        "md3-xl": "var(--md-sys-shape-corner-extra-large)",
      },
      boxShadow: {
        "md3-1": "var(--md-sys-elevation-1)",
        "md3-2": "var(--md-sys-elevation-2)",
        "md3-3": "var(--md-sys-elevation-3)",
      },
    },
  },
  plugins: [],
};

export default config;
