import sitemap from "@pyyupsk/vite-plugin-sitemap";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
