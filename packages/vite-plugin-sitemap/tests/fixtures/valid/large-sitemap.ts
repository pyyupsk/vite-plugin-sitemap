/**
 * Large sitemap fixture with 150+ routes.
 * Tests handling of larger sitemaps and potential splitting.
 */

import type { Route } from "../../../src/types/sitemap";

/**
 * Generate routes for testing.
 */
function generateRoutes(): Route[] {
  const routes: Route[] = [];

  // Add homepage
  routes.push({
    changefreq: "daily",
    lastmod: "2024-01-15",
    priority: 1.0,
    url: "https://example.com/",
  });

  // Add 50 blog posts
  for (let i = 1; i <= 50; i++) {
    routes.push({
      changefreq: "weekly",
      lastmod: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
      priority: 0.7,
      url: `https://example.com/blog/post-${i}`,
    });
  }

  // Add 50 product pages
  for (let i = 1; i <= 50; i++) {
    routes.push({
      changefreq: "monthly",
      priority: 0.8,
      url: `https://example.com/products/product-${i}`,
    });
  }

  // Add 30 category pages
  for (let i = 1; i <= 30; i++) {
    routes.push({
      changefreq: "weekly",
      priority: 0.6,
      url: `https://example.com/categories/category-${i}`,
    });
  }

  // Add 20 documentation pages
  for (let i = 1; i <= 20; i++) {
    routes.push({
      changefreq: "monthly",
      priority: 0.5,
      url: `https://example.com/docs/guide-${i}`,
    });
  }

  return routes;
}

export default generateRoutes() satisfies Route[];
