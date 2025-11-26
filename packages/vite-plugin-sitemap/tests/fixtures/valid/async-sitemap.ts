/**
 * Async sitemap that fetches routes dynamically.
 */

import type { Route } from "../../../src/types/sitemap";

// Simulated API data
const mockPosts = [
  { slug: "hello-world", updatedAt: "2024-01-15" },
  { slug: "getting-started", updatedAt: "2024-01-10" },
  { slug: "advanced-tips", updatedAt: "2024-01-05" },
];

// Simulated async fetch
async function fetchPosts(): Promise<typeof mockPosts> {
  // In real usage, this would be a database query or API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPosts), 10);
  });
}

// Async default export
export default async function getRoutes(): Promise<Route[]> {
  const posts = await fetchPosts();

  const staticRoutes: Route[] = [
    { url: "https://example.com/", priority: 1 },
    { url: "https://example.com/about", priority: 0.8 },
    { url: "https://example.com/blog", priority: 0.9 },
  ];

  const blogRoutes: Route[] = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
