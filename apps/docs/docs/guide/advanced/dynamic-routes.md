# Dynamic Routes

Generate sitemap routes dynamically from APIs, databases, CMSs, or any async data source at build time.

## Basic Async Routes

Export an async function from your sitemap file:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return [
    { url: "/", priority: 1.0 },
    { url: "/blog", priority: 0.9 },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
    })),
  ];
}
```

## Multiple Data Sources

Combine data from multiple sources:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  // Fetch from multiple APIs in parallel
  const [posts, products, categories] = await Promise.all([
    fetch("https://api.example.com/posts").then((r) => r.json()),
    fetch("https://api.example.com/products").then((r) => r.json()),
    fetch("https://api.example.com/categories").then((r) => r.json()),
  ]);

  return [
    // Static pages
    { url: "/", priority: 1.0 },
    { url: "/about", priority: 0.8 },

    // Blog posts
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: "weekly" as const,
    })),

    // Products
    ...products.map((product) => ({
      url: `/products/${product.id}`,
      lastmod: product.modifiedAt,
      images: product.images.map((img) => ({ loc: img.url })),
    })),

    // Categories
    ...categories.map((category) => ({
      url: `/category/${category.slug}`,
      changefreq: "daily" as const,
    })),
  ];
}
```

## Database Integration

### Prisma

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getRoutes(): Promise<Route[]> {
  const [posts, products] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, updatedAt: true },
    }),
  ]);

  await prisma.$disconnect();

  return [
    { url: "/", priority: 1.0 },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
    })),
    ...products.map((product) => ({
      url: `/products/${product.id}`,
      lastmod: product.updatedAt.toISOString(),
    })),
  ];
}
```

### Drizzle

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";
import { db } from "./db";
import { posts, products } from "./schema";
import { eq } from "drizzle-orm";

export default async function getRoutes(): Promise<Route[]> {
  const [allPosts, allProducts] = await Promise.all([
    db.select().from(posts).where(eq(posts.published, true)),
    db.select().from(products).where(eq(products.active, true)),
  ]);

  return [
    { url: "/" },
    ...allPosts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
    })),
    ...allProducts.map((product) => ({
      url: `/products/${product.id}`,
      lastmod: product.updatedAt,
    })),
  ];
}
```

## CMS Integration

### Contentful

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";
import { createClient } from "contentful";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export default async function getRoutes(): Promise<Route[]> {
  const entries = await client.getEntries({
    content_type: "blogPost",
    limit: 1000,
  });

  return [
    { url: "/", priority: 1.0 },
    { url: "/blog", priority: 0.9 },
    ...entries.items.map((entry) => ({
      url: `/blog/${entry.fields.slug}`,
      lastmod: entry.sys.updatedAt,
    })),
  ];
}
```

### Sanity

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

export default async function getRoutes(): Promise<Route[]> {
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  return [
    { url: "/" },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post._updatedAt,
    })),
  ];
}
```

### Strapi

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export default async function getRoutes(): Promise<Route[]> {
  const response = await fetch(`${STRAPI_URL}/api/posts?populate=*`);
  const { data } = await response.json();

  return [
    { url: "/" },
    ...data.map((post) => ({
      url: `/blog/${post.attributes.slug}`,
      lastmod: post.attributes.updatedAt,
    })),
  ];
}
```

## Named Exports with Async

Each named export can be a separate async function:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Static pages
export const pages: Route[] = [{ url: "/", priority: 1.0 }, { url: "/about" }, { url: "/contact" }];

// Dynamic blog posts
export async function blog(): Promise<Route[]> {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
  }));
}

// Dynamic products
export async function products(): Promise<Route[]> {
  const products = await fetchProducts();
  return products.map((product) => ({
    url: `/products/${product.id}`,
    lastmod: product.modifiedAt,
  }));
}
```

## Error Handling

Handle API failures gracefully:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  const staticRoutes: Route[] = [{ url: "/", priority: 1.0 }, { url: "/about" }];

  try {
    const posts = await fetch("https://api.example.com/posts").then((r) => {
      if (!r.ok) throw new Error(`API returned ${r.status}`);
      return r.json();
    });

    return [
      ...staticRoutes,
      ...posts.map((post) => ({
        url: `/blog/${post.slug}`,
        lastmod: post.updatedAt,
      })),
    ];
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    // Return static routes only on failure
    return staticRoutes;
  }
}
```

## Caching

Cache API responses during development:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const CACHE_FILE = ".sitemap-cache.json";
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (process.env.NODE_ENV === "development" && existsSync(CACHE_FILE)) {
    const cache = JSON.parse(await readFile(CACHE_FILE, "utf-8"));
    if (cache[key] && Date.now() - cache[key].timestamp < CACHE_TTL) {
      return cache[key].data;
    }
  }

  const data = await fetcher();

  if (process.env.NODE_ENV === "development") {
    const cache = existsSync(CACHE_FILE) ? JSON.parse(await readFile(CACHE_FILE, "utf-8")) : {};
    cache[key] = { data, timestamp: Date.now() };
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  }

  return data;
}

export default async function getRoutes(): Promise<Route[]> {
  const posts = await getCachedOrFetch("posts", () =>
    fetch("https://api.example.com/posts").then((r) => r.json()),
  );

  return [{ url: "/" }, ...posts.map((post) => ({ url: `/blog/${post.slug}` }))];
}
```

## Environment Variables

Use environment variables for API keys and URLs:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const API_URL = process.env.API_URL || "https://api.example.com";
const API_KEY = process.env.API_KEY;

export default async function getRoutes(): Promise<Route[]> {
  const response = await fetch(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const posts = await response.json();
  return posts.map((post) => ({ url: `/blog/${post.slug}` }));
}
```

## Related

- [Route Definition](/guide/routes)
- [Large Sitemaps](/guide/advanced/large-sitemaps)
- [CLI](/guide/cli)
