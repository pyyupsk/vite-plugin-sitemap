# Route Definition

Routes define the URLs in your sitemap. This guide covers all the ways to define routes.

## Basic Structure

Create a `src/sitemap.ts` file (or `sitemap.ts` in your project root):

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [{ url: "/" }, { url: "/about" }, { url: "/contact" }] satisfies Route[];
```

## Route Properties

Each route can have the following properties:

```typescript
interface Route {
  // Required
  url: string;

  // Optional standard properties
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: number;

  // Optional Google extensions
  images?: Image[];
  videos?: Video[];
  news?: News;
  alternates?: Alternate[];
}
```

### url (required)

The URL of the page. Can be absolute or relative:

```typescript
// Relative URLs (hostname prepended automatically)
{
  url: "/";
}
{
  url: "/about";
}
{
  url: "/blog/post-1";
}

// Absolute URLs
{
  url: "https://example.com/page";
}
```

::: warning URL Requirements

- Maximum 2,048 characters
- Must use `http://` or `https://` protocol (after hostname resolution)
- Cannot contain URL fragments (`#`)
  :::

### lastmod

The date the page was last modified. Must be in W3C Datetime format:

```typescript
// Date only
{ url: "/", lastmod: "2025-01-15" }

// With time and timezone
{ url: "/", lastmod: "2025-01-15T10:30:00Z" }
{ url: "/", lastmod: "2025-01-15T10:30:00+05:30" }

// Dynamic using JavaScript
{ url: "/", lastmod: new Date().toISOString().split("T")[0] }
```

### changefreq

How frequently the page is likely to change:

```typescript
type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

{ url: "/", changefreq: "daily" }
{ url: "/about", changefreq: "monthly" }
{ url: "/archive/2020", changefreq: "never" }
```

### priority

The priority of this URL relative to other URLs on your site:

```typescript
// Values from 0.0 to 1.0
{ url: "/", priority: 1.0 }        // Highest priority
{ url: "/about", priority: 0.8 }
{ url: "/contact", priority: 0.5 } // Default
{ url: "/terms", priority: 0.3 }   // Lower priority
```

::: tip
Priority is relative to other pages on your site, not absolute. A priority of `1.0` doesn't guarantee top search ranking.
:::

## Async Route Generation

For dynamic content, export an async function:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  // Fetch from API
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  // Fetch from database
  const products = await db.product.findMany();

  return [
    { url: "/", priority: 1.0 },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: "weekly" as const,
    })),
    ...products.map((product) => ({
      url: `/products/${product.id}`,
      lastmod: product.modifiedAt,
    })),
  ];
}
```

## Multiple Sitemaps

Use named exports to generate multiple sitemap files:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Generates sitemap-pages.xml
export const pages: Route[] = [{ url: "/", priority: 1.0 }, { url: "/about" }, { url: "/contact" }];

// Generates sitemap-blog.xml
export const blog: Route[] = [
  { url: "/blog", priority: 0.9 },
  { url: "/blog/post-1" },
  { url: "/blog/post-2" },
];

// Generates sitemap-products.xml (async)
export async function products(): Promise<Route[]> {
  const items = await fetchProducts();
  return items.map((p) => ({ url: `/products/${p.id}` }));
}
```

This generates:

- `sitemap-pages.xml`
- `sitemap-blog.xml`
- `sitemap-products.xml`
- `sitemap-index.xml` (referencing all three)

## File Discovery

The plugin searches for your sitemap file in this order:

1. Custom path (if `sitemapFile` option is set)
2. `src/sitemap.{ts,js,mts,mjs}`
3. `sitemap.{ts,js,mts,mjs}` (project root)

## Full Example

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Static pages
export const pages: Route[] = [
  {
    url: "/",
    priority: 1.0,
    changefreq: "daily",
    lastmod: "2025-01-15",
  },
  {
    url: "/about",
    priority: 0.8,
    changefreq: "monthly",
  },
  {
    url: "/gallery",
    priority: 0.7,
    images: [
      {
        loc: "https://example.com/images/hero.jpg",
        title: "Hero Image",
        caption: "Our main hero image",
      },
    ],
  },
];

// Dynamic blog posts
export async function blog(): Promise<Route[]> {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return [
    { url: "/blog", priority: 0.9, changefreq: "daily" },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
      changefreq: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
```

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Add [Google Extensions](/guide/extensions/images) for rich content
- Handle [Large Sitemaps](/guide/advanced/large-sitemaps)
