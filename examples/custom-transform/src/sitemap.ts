import type { Route } from "@pyyupsk/vite-plugin-sitemap";

/**
 * Custom Transform Example
 *
 * The routes defined here will be modified by the transform function
 * in vite.config.ts before being written to the sitemap.
 *
 * Transform capabilities:
 * 1. Modify route properties (url, priority, changefreq, lastmod)
 * 2. Add/remove images, videos, news, alternates
 * 3. Filter out routes by returning null
 * 4. Async operations (fetch from API, database, etc.)
 */

export default [
  // These will get trailing slashes added
  { url: "https://example.com" },
  { url: "https://example.com/about" },
  { url: "https://example.com/products" },
  { url: "https://example.com/products/category-a" },
  { url: "https://example.com/products/category-a/item-1" },

  // These will be filtered out by the transform (contain /internal/ or /draft/)
  { url: "https://example.com/internal/admin" },
  { url: "https://example.com/internal/dashboard" },
  { url: "https://example.com/blog/draft/upcoming-post" },

  // Blog posts - priority will be calculated based on depth
  { url: "https://example.com/blog" },
  { url: "https://example.com/blog/2025" },
  { url: "https://example.com/blog/2025/01" },
  { url: "https://example.com/blog/2025/01/hello-world" },

  // These already have lastmod, so transform won't override
  { url: "https://example.com/changelog", lastmod: "2025-01-15" },
  { url: "https://example.com/docs", lastmod: "2025-01-10" },
] satisfies Route[];
