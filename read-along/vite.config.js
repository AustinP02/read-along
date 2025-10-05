import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow streaming and large files
    middlewareMode: false,
    watch: {
      usePolling: true,
    },
  },
  build: {
    chunkSizeWarningLimit: 1600, // increases size limit warnings
    assetsInlineLimit: 0,        // ensures large files aren't inlined as base64
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
});
