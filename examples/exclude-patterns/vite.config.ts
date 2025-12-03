import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
      // Exclude patterns - supports glob patterns and regex
      exclude: [
        // Glob patterns
        "/admin/*", // Exclude all admin pages
        "/api/*", // Exclude API endpoints
        "/internal/**", // Exclude internal pages (recursive)
        "*.pdf", // Exclude PDF files
        "/user/*/settings", // Exclude user settings pages

        // String patterns (exact path match)
        "/login",
        "/logout",
        "/register",
        "/forgot-password",

        // Regex patterns
        /\/preview\/.*/, // Exclude preview pages
        /\/draft-.*/, // Exclude draft pages
        /.*\.(json|xml|txt)$/, // Exclude data files
      ],
    }),
  ],
});
