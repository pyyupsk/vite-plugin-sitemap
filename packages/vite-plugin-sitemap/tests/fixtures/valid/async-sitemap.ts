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

// Async default export
export default async function getRoutes(): Promise<Route[]> {
  const posts = await fetchPosts();

  const staticRoutes: Route[] = [
    { priority: 1.0, url: "https://example.com/" },
    { priority: 0.8, url: "https://example.com/about" },
    { priority: 0.9, url: "https://example.com/blog" },
  ];

  const blogRoutes: Route[] = posts.map((post) => ({
    changefreq: "weekly" as const,
    lastmod: post.updatedAt,
    priority: 0.7,
    url: `https://example.com/blog/${post.slug}`,
  }));

  return [...staticRoutes, ...blogRoutes];
}

// Simulated async fetch
async function fetchPosts(): Promise<typeof mockPosts> {
  // In real usage, this would be a database query or API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPosts), 10);
  });
}
