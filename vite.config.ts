import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react()],
    base: isProd ? "/ReactPokedexArchi/" : "/",
    server: {
      port: 5173,
    },
    build: {
      outDir: "dist",
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
