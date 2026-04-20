import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // MNSU Maverick brand colors
        mnsu: {
          maroon: "#782F40",
          gold: "#C8A84B",
          "maroon-dark": "#5a1f2e",
          "gold-light": "#e8d08a",
        },
      },
      fontFamily: {
        sans: ["Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
