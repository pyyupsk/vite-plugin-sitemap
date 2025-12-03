import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Simulate fetching blog posts from a CMS or database
async function fetchBlogPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  // In a real app, this would be an API call
  return [
    { slug: "hello-world", updatedAt: "2025-01-15" },
    { slug: "getting-started-guide", updatedAt: "2025-01-20" },
    { slug: "advanced-techniques", updatedAt: "2025-02-01" },
    { slug: "performance-tips", updatedAt: "2025-02-10" },
    { slug: "best-practices-2025", updatedAt: "2025-02-15" },
  ];
}

// Simulate fetching products from an e-commerce API
async function fetchProducts(): Promise<{ id: string; category: string }[]> {
  return [
    { id: "prod-001", category: "electronics" },
    { id: "prod-002", category: "electronics" },
    { id: "prod-003", category: "clothing" },
    { id: "prod-004", category: "home" },
    { id: "prod-005", category: "home" },
  ];
}

// Export an async function that generates routes dynamically
export default async function (): Promise<Route[]> {
  const [posts, products] = await Promise.all([fetchBlogPosts(), fetchProducts()]);

  const staticRoutes: Route[] = [
    { url: "https://example.com/" },
    { url: "https://example.com/about" },
    { url: "https://example.com/contact" },
    { url: "https://example.com/blog" },
    { url: "https://example.com/products" },
  ];

  const blogRoutes: Route[] = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: "weekly" as const,
    priority: 0.7,
  }));

  const productRoutes: Route[] = products.map((product) => ({
    url: `https://example.com/products/${product.category}/${product.id}`,
    changefreq: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes, ...productRoutes];
}
