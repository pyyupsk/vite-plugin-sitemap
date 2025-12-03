import type { Route } from "@pyyupsk/vite-plugin-sitemap";

/**
 * Exclude Patterns Example
 *
 * This sitemap contains many routes, but some will be filtered out
 * by the exclude patterns defined in vite.config.ts.
 *
 * Supported pattern types:
 * 1. Glob patterns: "/admin/*", "/api/**", "*.pdf"
 * 2. String patterns: "/login", "/logout" (exact match on path)
 * 3. Regex patterns: RegExp objects like new RegExp("preview")
 */

export default [
  // ✅ These will be INCLUDED in the sitemap
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
  { url: "https://example.com/products" },
  { url: "https://example.com/products/category-a" },
  { url: "https://example.com/products/item-123" },
  { url: "https://example.com/blog" },
  { url: "https://example.com/blog/hello-world" },
  { url: "https://example.com/docs" },
  { url: "https://example.com/docs/getting-started" },
  { url: "https://example.com/user/profile" },
  { url: "https://example.com/user/orders" },

  // ❌ These will be EXCLUDED by glob patterns
  { url: "https://example.com/admin/dashboard" }, // /admin/*
  { url: "https://example.com/admin/users" }, // /admin/*
  { url: "https://example.com/api/users" }, // /api/*
  { url: "https://example.com/api/products" }, // /api/*
  { url: "https://example.com/internal/metrics" }, // /internal/**
  { url: "https://example.com/internal/logs/2025" }, // /internal/**
  { url: "https://example.com/docs/guide.pdf" }, // *.pdf
  { url: "https://example.com/user/123/settings" }, // /user/*/settings

  // ❌ These will be EXCLUDED by string patterns
  { url: "https://example.com/login" },
  { url: "https://example.com/logout" },
  { url: "https://example.com/register" },
  { url: "https://example.com/forgot-password" },

  // ❌ These will be EXCLUDED by regex patterns
  { url: "https://example.com/preview/new-feature" }, // /\/preview\/.*/
  { url: "https://example.com/preview/upcoming" }, // /\/preview\/.*/
  { url: "https://example.com/draft-post-1" }, // /\/draft-.*/
  { url: "https://example.com/blog/draft-ideas" }, // /\/draft-.*/
  { url: "https://example.com/data/config.json" }, // /.*\.(json|xml|txt)$/
  { url: "https://example.com/feeds/rss.xml" }, // /.*\.(json|xml|txt)$/
  { url: "https://example.com/robots.txt" }, // /.*\.(json|xml|txt)$/
] satisfies Route[];
