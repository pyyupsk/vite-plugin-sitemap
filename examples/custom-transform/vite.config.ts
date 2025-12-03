import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
      // Transform function to modify routes before sitemap generation
      transform: async (route) => {
        // Example 1: Add trailing slashes to all URLs
        if (!route.url.endsWith("/")) {
          route.url = route.url + "/";
        }

        // Example 2: Set priority based on URL depth
        const depth = (route.url.match(/\//g) || []).length - 3; // subtract protocol slashes
        route.priority = Math.max(0.1, 1 - depth * 0.2);

        // Example 3: Remove certain routes by returning null
        if (route.url.includes("/internal/") || route.url.includes("/draft/")) {
          return null;
        }

        // Example 4: Add lastmod based on some logic
        if (!route.lastmod) {
          // Could fetch from database, file system, etc.
          route.lastmod = new Date().toISOString().split("T")[0];
        }

        return route;
      },
    }),
  ],
});
