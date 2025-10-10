module.exports = {
  plugins: [
    // is used for import sorting
    "@trivago/prettier-plugin-sort-imports",
    // Sorts Tailwind CSS utility classes in a consistent order
    "prettier-plugin-tailwindcss",
  ],
  tailwindConfig: "./tailwind.config.js",
  tailwindFunctions: ["clsx", "cn", "classnames"],
  importOrder: [
    "^react",
    "^@core/(.*)$",
    "^@server/(.*)$",
    "^@ui/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
