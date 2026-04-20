import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // MSU Maverick brand colors
        mnsu: {
          purple: "#49306e",
          gold: "#febd11",
          "purple-dark": "#3e375a",
          "purple-light": "#8b6f90",
        },
      },
      fontFamily: {
        sans: ["Kanit", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
