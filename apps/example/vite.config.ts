import sitemap from "@pyyupsk/vite-plugin-sitemap";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      // Default values for all routes (can be overridden per-route)
      changefreq: "weekly",

      // Exclude patterns (string or RegExp)
      exclude: ["/admin/*", /^\/private/],

      // Generate robots.txt with Sitemap directive
      generateRobotsTxt: true,

      // Required: Base URL for your site
      hostname: "https://example.com",
      priority: 0.5,

      // Transform routes before generation
      transform: (route) => {
        // Example: Add trailing slashes
        if (!route.url.endsWith("/")) {
          return { ...route, url: `${route.url}/` };
        }
        return route;
      },
    }),
  ],
});
