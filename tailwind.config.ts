import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.24)",
        glow: "0 16px 48px rgba(201, 168, 76, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backdropBlur: {
        xs: "2px"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.96)", opacity: "0.6" },
          "70%": { transform: "scale(1.04)", opacity: "0.18" },
          "100%": { transform: "scale(1.08)", opacity: "0" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.4s ease-out infinite",
        shimmer: "shimmer 2.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
