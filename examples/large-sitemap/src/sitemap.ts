import type { Route } from "@pyyupsk/vite-plugin-sitemap";

/**
 * Large Sitemap Example
 *
 * This example generates 60,000 URLs to demonstrate automatic sitemap splitting.
 * The sitemap protocol limits each file to 50,000 URLs, so this will be split into:
 * - sitemap-0.xml (50,000 URLs)
 * - sitemap-1.xml (10,000 URLs)
 * - sitemap-index.xml (index file pointing to the above)
 *
 * In a real application, these URLs would come from:
 * - Database queries (products, articles, user profiles)
 * - CMS API calls
 * - File system scanning
 */

const TOTAL_URLS = 60_000;

// Simulate generating URLs for a large e-commerce site
function generateProductUrls(count: number): Route[] {
  const routes: Route[] = [];
  const categories = ["electronics", "clothing", "home", "sports", "books"];

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const productId = String(i + 1).padStart(6, "0");

    routes.push({
      url: `https://example.com/products/${category}/item-${productId}`,
      changefreq: "weekly",
      priority: 0.6,
      // Simulate different last modified dates
      lastmod: new Date(2025, 0, 1 + (i % 30)).toISOString().split("T")[0],
    });
  }

  return routes;
}

// Static pages
const staticRoutes: Route[] = [
  { url: "https://example.com/", priority: 1.0, changefreq: "daily" },
  { url: "https://example.com/about", priority: 0.8, changefreq: "monthly" },
  { url: "https://example.com/contact", priority: 0.8, changefreq: "monthly" },
  { url: "https://example.com/faq", priority: 0.7, changefreq: "monthly" },
  { url: "https://example.com/terms", priority: 0.3, changefreq: "yearly" },
  { url: "https://example.com/privacy", priority: 0.3, changefreq: "yearly" },
];

// Category pages
const categoryRoutes: Route[] = ["electronics", "clothing", "home", "sports", "books"].map(
  (category) => ({
    url: `https://example.com/products/${category}`,
    priority: 0.9,
    changefreq: "daily" as const,
  }),
);

// Generate all routes
export default [
  ...staticRoutes,
  ...categoryRoutes,
  ...generateProductUrls(TOTAL_URLS - staticRoutes.length - categoryRoutes.length),
] satisfies Route[];
