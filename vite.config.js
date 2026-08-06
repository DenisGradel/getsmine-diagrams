import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/getsmine-diagrams/",
  publicDir: false,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "app/index.html"),
        metaChatArchitecture: resolve(
          import.meta.dirname,
          "app/diagrams/gm-meta-ads-chat-architecture.html",
        ),
        dataMap: resolve(
          import.meta.dirname,
          "app/diagrams/gm-data-map.html",
        ),
        smmContentFlow: resolve(
          import.meta.dirname,
          "app/diagrams/gm-smm-content-flow.html",
        ),
      },
    },
  },
});
