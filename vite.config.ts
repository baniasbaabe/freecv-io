import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  // Pre-bundle the lazily imported CV parsers so the dev server doesn't reload the page on first import.
  optimizeDeps: { include: ["pdfjs-dist/legacy/build/pdf.mjs", "mammoth"] },
  // Default target kept (not the guide's safari13): Tailwind v4 needs Safari 16.4+ / Chrome 111+ anyway.
  build: {
    minify: !process.env.TAURI_ENV_DEBUG,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // Loaded from disk inside the desktop app, so the web-oriented 500 kB chunk warning doesn't apply.
    chunkSizeWarningLimit: 1000,
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
