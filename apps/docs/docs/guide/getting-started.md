# Getting Started

This guide will help you set up `@pyyupsk/vite-plugin-sitemap` in your Vite project.

## Prerequisites

- Node.js 20 or higher
- Vite 7.x

## Installation

::: code-group

```bash [npm]
npm install @pyyupsk/vite-plugin-sitemap
```

```bash [pnpm]
pnpm add @pyyupsk/vite-plugin-sitemap
```

```bash [yarn]
yarn add @pyyupsk/vite-plugin-sitemap
```

```bash [bun]
bun add @pyyupsk/vite-plugin-sitemap
```

:::

## Basic Setup

### 1. Configure the Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
```

### 2. Create a Sitemap File

Create a `src/sitemap.ts` file to define your routes:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/about", priority: 0.8 },
  { url: "/blog", priority: 0.9, changefreq: "weekly" },
  { url: "/contact", priority: 0.5 },
] satisfies Route[];
```

### 3. Preview in Dev Mode

Start the dev server to preview your sitemap:

```bash
npm run dev
```

Visit `http://localhost:5173/sitemap.xml` to see your generated sitemap in real-time. Changes to `src/sitemap.ts` are reflected immediately.

### 4. Build Your Project

Run your Vite build:

```bash
npm run build
```

The plugin will generate `sitemap.xml` in your output directory (`dist/` by default).

## Generated Output

After building, you'll find a `sitemap.xml` file like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://example.com/contact</loc>
    <priority>0.5</priority>
  </url>
</urlset>
```

## Adding robots.txt

Enable automatic `robots.txt` generation:

```typescript
sitemap({
  hostname: "https://example.com",
  generateRobotsTxt: true, // [!code ++]
});
```

This creates or updates `robots.txt` with a Sitemap directive:

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

::: tip Dev Mode Support
When `generateRobotsTxt` is enabled, `robots.txt` is also served during development at `http://localhost:5173/robots.txt`.
:::

## Next Steps

- Learn about [Route Definition](/guide/routes) options
- Explore [Configuration](/guide/configuration) options
- Add [Google Extensions](/guide/extensions/images) for images, videos, and news
- Use the [CLI](/guide/cli) for validation and preview
