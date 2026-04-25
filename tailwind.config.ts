import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: "#fcffed",
          black: "#000000",
          olive: "#7c966c",
          sage: "#aacc92",
          yellow: "#a6c776",
          forest: "#62835a",
          khaki: "#8a8c50",
          warm: "#cacba3",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
