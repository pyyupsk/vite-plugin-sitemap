# @pyyupsk/vite-plugin-sitemap

A TypeScript-first Vite plugin for generating XML sitemaps from a file-based convention. Zero runtime footprint—build-time only execution.

## Features

- **File-based configuration** - Define routes in `src/sitemap.ts`
- **Async support** - Fetch routes from APIs or databases at build time
- **Auto-splitting** - Automatically splits large sitemaps (50,000+ URLs)
- **Google extensions** - Support for images, videos, news, and i18n (hreflang)
- **CLI tools** - Validate, preview, and generate sitemaps without building
- **Zero runtime** - No client bundle impact

## Installation

```bash
# npm
npm install --save-dev @pyyupsk/vite-plugin-sitemap

# pnpm
pnpm add -D @pyyupsk/vite-plugin-sitemap

# yarn
yarn add --dev @pyyupsk/vite-plugin-sitemap

# bun
bun add -d @pyyupsk/vite-plugin-sitemap
```

## Quick Start

### 1. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import sitemap from "@pyyupsk/vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
```

### 2. Create sitemap definition

```typescript
// src/sitemap.ts
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const routes: Route[] = [
  { url: "/" },
  { url: "/about" },
  { url: "/contact" },
  { url: "/blog", changefreq: "weekly", priority: 0.8 },
];

export default routes;
```

### 3. Build

```bash
npm run build
```

Your `dist/` folder will contain `sitemap.xml`.

## Plugin Options

```typescript
sitemap({
  // Base URL of your site (required for relative URLs)
  hostname: "https://example.com",

  // Path to sitemap definition file (without extension)
  sitemapFile: "src/sitemap", // default

  // Output directory
  outDir: "dist", // default: Vite's build.outDir

  // Output filename
  filename: "sitemap.xml", // default

  // Generate robots.txt with Sitemap directive
  generateRobotsTxt: false, // default

  // Default values for all routes
  changefreq: "weekly",
  priority: 0.5,
  lastmod: "2024-01-01",

  // Exclude URL patterns
  exclude: ["/admin/*", /\/private\/.*/],

  // Transform routes before generation
  transform: (route) => {
    if (route.url.includes("draft")) return null;
    return { ...route, priority: route.priority ?? 0.5 };
  },
});
```

## Route Definition

### Basic Routes

```typescript
// src/sitemap.ts
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const routes: Route[] = [
  { url: "/" },
  { url: "/about", lastmod: "2024-01-15" },
  { url: "/blog", changefreq: "weekly", priority: 0.8 },
];

export default routes;
```

### Async Routes

```typescript
// src/sitemap.ts
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function generateSitemap(): Promise<Route[]> {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return [
    { url: "/" },
    ...posts.map((post) => ({
      url: `/blog/${post.slug}`,
      lastmod: post.updatedAt,
    })),
  ];
}
```

### Multiple Sitemaps

Use named exports for multiple sitemaps:

```typescript
// src/sitemap.ts
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export const pages: Route[] = [{ url: "/" }, { url: "/about" }];

export async function blog(): Promise<Route[]> {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
  }));
}

export async function products(): Promise<Route[]> {
  const items = await fetchProducts();
  return items.map((item) => ({
    url: `/products/${item.id}`,
  }));
}
```

This generates:

- `sitemap-pages.xml`
- `sitemap-blog.xml`
- `sitemap-products.xml`
- `sitemap-index.xml`

## Google Extensions

### Images

```typescript
const routes: Route[] = [
  {
    url: "/gallery",
    images: [
      {
        loc: "https://example.com/images/photo1.jpg",
        title: "Beautiful sunset",
        caption: "A stunning sunset over the ocean",
      },
    ],
  },
];
```

### Videos

```typescript
const routes: Route[] = [
  {
    url: "/videos/intro",
    videos: [
      {
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Introduction Video",
        description: "Learn about our product",
        content_loc: "https://example.com/video.mp4",
        duration: 120,
      },
    ],
  },
];
```

### News

```typescript
const routes: Route[] = [
  {
    url: "/news/breaking-story",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2024-01-15T10:00:00Z",
      title: "Breaking: Major Event Happens",
    },
  },
];
```

### Internationalization (hreflang)

```typescript
const routes: Route[] = [
  {
    url: "/en/about",
    alternates: [
      { hreflang: "en", href: "https://example.com/en/about" },
      { hreflang: "es", href: "https://example.com/es/about" },
      { hreflang: "fr", href: "https://example.com/fr/about" },
      { hreflang: "x-default", href: "https://example.com/en/about" },
    ],
  },
];
```

## CLI Commands

### Validate

Check your sitemap configuration for errors:

```bash
npx vite-sitemap validate
```

### Preview

Preview the generated XML without writing files:

```bash
npx vite-sitemap preview
```

### Generate

Generate sitemaps without running a full Vite build:

```bash
npx vite-sitemap generate --output ./dist --hostname https://example.com
```

Options:

- `-o, --output <dir>` - Output directory (default: `dist`)
- `-h, --hostname <url>` - Base hostname for sitemap URLs
- `--robots-txt` - Generate robots.txt with Sitemap directive
- `--verbose` - Enable verbose output

## Type Definitions

### Route

```typescript
interface Route {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number; // 0.0 - 1.0
  images?: Image[];
  videos?: Video[];
  news?: News;
  alternates?: Alternate[];
}
```

### Image

```typescript
interface Image {
  loc: string;
  caption?: string;
  title?: string;
  geo_location?: string;
  license?: string;
}
```

### Video

```typescript
interface Video {
  thumbnail_loc: string;
  title: string;
  description: string;
  content_loc?: string;
  player_loc?: string;
  duration?: number;
  expiration_date?: string;
  rating?: number;
  view_count?: number;
  publication_date?: string;
  family_friendly?: boolean;
  restriction?: VideoRestriction;
  platform?: VideoPlatform;
  requires_subscription?: boolean;
  uploader?: VideoUploader;
  live?: boolean;
  tag?: string[];
}
```

### News

```typescript
interface News {
  publication: {
    name: string;
    language: string;
  };
  publication_date: string;
  title: string;
  keywords?: string;
  stock_tickers?: string;
}
```

### Alternate

```typescript
interface Alternate {
  hreflang: string;
  href: string;
}
```

## Requirements

- Vite 7.x
- Node.js 20.x

## License

MIT
