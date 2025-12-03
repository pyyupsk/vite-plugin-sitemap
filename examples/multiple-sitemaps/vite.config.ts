import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
