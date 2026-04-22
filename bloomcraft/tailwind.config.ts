import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — mirrors CSS variables
        cream: {
          DEFAULT: "var(--cream)",
          50: "var(--cream-50)",
          100: "var(--cream-100)",
        },
        blush: {
          DEFAULT: "var(--blush)",
          light: "var(--blush-light)",
          dark: "var(--blush-dark)",
        },
        sage: {
          DEFAULT: "var(--sage)",
          light: "var(--sage-light)",
          dark: "var(--sage-dark)",
        },
        mauve: {
          DEFAULT: "var(--mauve)",
          light: "var(--mauve-light)",
          dark: "var(--mauve-dark)",
        },
        champagne: "var(--champagne)",
        charcoal: "var(--charcoal)",
        ink: "var(--ink)",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-jost)", "system-ui", "sans-serif"],
        script: ["var(--font-petit-formal)", "cursive"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        petal: "0 8px 32px rgba(180, 130, 130, 0.15)",
        "petal-lg": "0 16px 48px rgba(180, 130, 130, 0.2)",
        soft: "0 4px 24px rgba(0, 0, 0, 0.06)",
      },
      backgroundImage: {
        "gradient-petal":
          "linear-gradient(135deg, var(--blush-light), var(--cream))",
        "gradient-sage":
          "linear-gradient(135deg, var(--sage-light), var(--cream))",
        "gradient-hero":
          "linear-gradient(160deg, var(--cream) 0%, var(--blush-light) 50%, var(--cream) 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "petal-fall": "petalFall 8s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        petalFall: {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
