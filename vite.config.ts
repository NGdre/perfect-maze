import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: process.env.NODE_ENV === "production" ? "/perfect-maze/" : "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    port: 3000,
  },
  worker: {
    format: "es",
  },
  resolve: {
    // these aliases needed so path resolution in workers could work
    alias: {
      "@models": path.resolve(__dirname, "src/models"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@generators": path.resolve(__dirname, "src/models/generators"),
      "@solvers": path.resolve(__dirname, "src/models/solvers"),
      "@constants": path.resolve(__dirname, "src/constants"),
      "@configs": path.resolve(__dirname, "src/configs"),
    },
  },
});
