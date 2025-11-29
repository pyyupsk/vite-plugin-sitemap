import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const BASE_URL = "https://pyyupsk.github.io/vite-plugin-sitemap";

const routes: Route[] = [
  // Homepage
  { url: "/", priority: 1.0, changefreq: "weekly" },

  // Guide - Introduction
  { url: "/guide/getting-started", priority: 0.9, changefreq: "weekly" },
  { url: "/guide/why", priority: 0.8, changefreq: "monthly" },

  // Guide - Core Concepts
  { url: "/guide/routes", priority: 0.8, changefreq: "monthly" },
  { url: "/guide/configuration", priority: 0.8, changefreq: "monthly" },

  // Guide - Google Extensions
  { url: "/guide/extensions/images", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/extensions/videos", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/extensions/news", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/extensions/i18n", priority: 0.7, changefreq: "monthly" },

  // Guide - Tools
  { url: "/guide/cli", priority: 0.8, changefreq: "monthly" },

  // Guide - Advanced
  { url: "/guide/advanced/large-sitemaps", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/advanced/dynamic-routes", priority: 0.7, changefreq: "monthly" },
  { url: "/guide/advanced/custom-serialization", priority: 0.7, changefreq: "monthly" },

  // Config Reference
  { url: "/config/", priority: 0.8, changefreq: "monthly" },
  { url: "/config/route", priority: 0.8, changefreq: "monthly" },

  // API Reference
  { url: "/api/", priority: 0.8, changefreq: "monthly" },
  { url: "/api/types", priority: 0.8, changefreq: "monthly" },

  // LLM-friendly documentation
  { url: "/llms.txt", priority: 0.6, changefreq: "weekly" },
  { url: "/llms-full.txt", priority: 0.6, changefreq: "weekly" },
];

export default routes.map((route) => ({
  ...route,
  url: `${BASE_URL}${route.url}`,
}));
