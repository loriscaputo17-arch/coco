import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coco: {
          white:   "#FAFAF7",
          cream:   "#F5F0E8",
          sky:     "#D6EEF5",
          blue:    "#7EC8E3",
          "blue-dark": "#2E8FAD",
          "blue-deep": "#1A6482",
          sand:    "#C4A882",
          brown:   "#7A5C3A",
          "brown-dark": "#4A3420",
          mocha:   "#2C1F0F",
          coconut: "#E8DDD0",
          bark:    "#9B7B5A",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.75rem",
      },
      boxShadow: {
        "coco-sm": "0 2px 8px rgba(44, 31, 15, 0.08)",
        "coco":    "0 4px 20px rgba(44, 31, 15, 0.10)",
        "coco-lg": "0 8px 40px rgba(44, 31, 15, 0.12)",
        "blue-glow": "0 0 0 3px rgba(126, 200, 227, 0.35)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.4s ease forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "kw-pop":    "kwPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.85)" },
          "50%":      { opacity: "1",   transform: "scale(1)" },
        },
        kwPop: {
          "0%":   { opacity: "0", transform: "scale(0.8) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;