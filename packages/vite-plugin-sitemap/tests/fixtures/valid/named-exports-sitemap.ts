/**
 * Sitemap with named exports for multiple sitemaps.
 */

import type { Route } from "../../../src/types/sitemap";

// Default export for main pages
export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
] satisfies Route[];

// Named export for blog posts
export const blog: Route[] = [
  { lastmod: "2024-01-15", url: "https://example.com/blog/post-1" },
  { lastmod: "2024-01-10", url: "https://example.com/blog/post-2" },
  { lastmod: "2024-01-05", url: "https://example.com/blog/post-3" },
];

// Named export for product pages
export const products: Route[] = [
  { priority: 0.8, url: "https://example.com/products/item-1" },
  { priority: 0.8, url: "https://example.com/products/item-2" },
  { priority: 0.8, url: "https://example.com/products/item-3" },
];

// Named async export for dynamic content
export async function news(): Promise<Route[]> {
  // Simulated async fetch
  return [
    {
      news: {
        publication: { language: "en", name: "Example News" },
        publication_date: "2024-01-15",
        title: "Latest News",
      },
      url: "https://example.com/news/latest",
    },
  ];
}
