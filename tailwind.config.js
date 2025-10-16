import { colors } from "./src/constants.ts";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    extend: {
      colors,
      spacing: {
        "between-header-main-sidebar": "2.5rem",
      },
    },
  },
  plugins: [],
};
