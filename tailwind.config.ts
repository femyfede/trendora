import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0FAFB",
          100: "#D6F1F4",
          200: "#AEE3E9",
          300: "#77CED8",
          400: "#3AAEBD",
          500: "#1B93A3",
          600: "#117585",
          700: "#0E5F6D",
          800: "#104E59",
          900: "#0C3F49",
          950: "#06272E"
        },
        // Warm accents drawn from kanga prints and terracotta: use sparingly for emphasis.
        clay: {
          50: "#FCF3EE",
          100: "#F8E1D5",
          200: "#EFC0A8",
          500: "#C8623A",
          600: "#B0522D",
          700: "#8E4124"
        },
        sun: {
          100: "#FBEFD3",
          400: "#E9B64A",
          500: "#D99A21"
        },
        ink: "#0B0F10",
        smoke: "#F5F7F7",
        blush: "#F6DAD5",
        sand: "#F7F3EC"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        shell: "1440px"
      },
      boxShadow: {
        card: "0 18px 45px -28px rgba(6, 39, 46, 0.35)",
        lift: "0 24px 60px -24px rgba(6, 39, 46, 0.35)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.45s ease both",
        marquee: "marquee 28s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
