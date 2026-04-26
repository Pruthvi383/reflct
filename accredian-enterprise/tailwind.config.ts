import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#1A56DB",
        "brand-dark": "#123DA5",
        ink: "#0F172A"
      },
      boxShadow: {
        soft: "0 20px 60px -24px rgba(15, 23, 42, 0.22)"
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 5s ease-in-out infinite"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
