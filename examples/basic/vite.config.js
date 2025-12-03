import sitemap from "@pyyupsk/vite-plugin-sitemap";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
