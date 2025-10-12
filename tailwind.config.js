const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    extend: {
      colors: {
        primary: colors.blue,
        accent: colors.purple,
        "text-primary": colors.gray[600],
        "bg-primary": colors.indigo[50],
      },
    },
  },
  plugins: [],
};
