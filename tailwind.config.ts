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
        bg: {
          base: "#050505",
          s1: "#0D0D10",
          s2: "#17171C",
          s3: "#1F1F26",
        },
        line: {
          DEFAULT: "#27272A",
          strong: "#3F3F46",
        },
        ink: {
          hi: "#F4F4F5",
          mid: "#A1A1AA",
          lo: "#52525B",
          dim: "#3F3F46",
        },
        sev: {
          safe: "#00FF66",
          watch: "#00E5FF",
          elevated: "#FFAB00",
          critical: "#FF3B30",
          offline: "#71717A",
        },
        accent: {
          cyan: "#00E5FF",
          amber: "#FFAB00",
          red: "#FF3B30",
          green: "#00FF66",
        },
      },
      fontFamily: {
        sans: ["var(--font-chivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "12px"],
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flashRed: {
          "0%, 100%": { backgroundColor: "rgba(255, 59, 48, 0)" },
          "50%": { backgroundColor: "rgba(255, 59, 48, 0.15)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        tick: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        flashRed: "flashRed 1.2s ease-in-out infinite",
        blink: "blink 1.4s ease-in-out infinite",
        tick: "tick 40s linear infinite",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(63,63,70,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(63,63,70,0.15) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
