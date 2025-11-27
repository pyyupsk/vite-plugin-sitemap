# Configuration

Configure the plugin in your `vite.config.ts` file.

## Basic Configuration

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

## All Options

```typescript
sitemap({
  // Base URL (required for relative URLs)
  hostname: "https://example.com",

  // Path to sitemap definition file
  sitemapFile: "src/sitemap",

  // Output directory (defaults to Vite's build.outDir)
  outDir: "dist",

  // Output filename
  filename: "sitemap.xml",

  // Default values for all routes
  changefreq: "weekly",
  priority: 0.5,
  lastmod: "2025-01-15",

  // URL patterns to exclude
  exclude: ["/admin/*", /^\/private/],

  // Transform routes before generation
  transform: (route) => route,

  // Custom XML serializer
  serialize: (routes) => "...",

  // Generate robots.txt
  generateRobotsTxt: true,
});
```

## Options Reference

### hostname

- **Type:** `string`
- **Required:** Yes (for relative URLs)

The base URL of your site. Prepended to relative URLs:

```typescript
sitemap({
  hostname: "https://example.com",
});

// Route { url: "/about" } becomes "https://example.com/about"
```

### sitemapFile

- **Type:** `string`
- **Default:** Auto-discovered

Path to your sitemap definition file (without extension):

```typescript
sitemap({
  sitemapFile: "config/sitemap", // Loads config/sitemap.ts
});
```

If not specified, the plugin searches:

1. `src/sitemap.{ts,js,mts,mjs}`
2. `sitemap.{ts,js,mts,mjs}` (project root)

### outDir

- **Type:** `string`
- **Default:** Vite's `build.outDir`

Output directory for generated files:

```typescript
sitemap({
  outDir: "public", // Output to public/ instead of dist/
});
```

### filename

- **Type:** `string`
- **Default:** `"sitemap.xml"`

Name of the output sitemap file:

```typescript
sitemap({
  filename: "urlset.xml",
});
```

### changefreq

- **Type:** `ChangeFrequency`
- **Default:** `undefined`

Default change frequency applied to all routes:

```typescript
sitemap({
  changefreq: "weekly",
});
```

### priority

- **Type:** `number` (0.0 - 1.0)
- **Default:** `undefined`

Default priority applied to all routes:

```typescript
sitemap({
  priority: 0.5,
});
```

### lastmod

- **Type:** `string` (W3C Datetime)
- **Default:** `undefined`

Default last modified date applied to all routes:

```typescript
sitemap({
  lastmod: new Date().toISOString().split("T")[0],
});
```

### exclude

- **Type:** `Array<string | RegExp>`
- **Default:** `[]`

URL patterns to exclude from the sitemap:

```typescript
sitemap({
  exclude: [
    // String patterns (glob-like)
    "/admin/*",
    "/api/*",
    "/internal/*",

    // Regular expressions
    /^\/private/,
    /\/draft-/,
  ],
});
```

### transform

- **Type:** `(route: Route) => Route | null | Promise<Route | null>`
- **Default:** `undefined`

Transform each route before XML generation. Return `null` to exclude:

```typescript
sitemap({
  transform: (route) => {
    // Add trailing slashes
    if (!route.url.endsWith("/")) {
      return { ...route, url: `${route.url}/` };
    }
    return route;
  },
});
```

```typescript
sitemap({
  transform: async (route) => {
    // Fetch additional metadata
    const meta = await fetchPageMeta(route.url);

    // Exclude unpublished pages
    if (!meta.published) {
      return null;
    }

    return {
      ...route,
      lastmod: meta.updatedAt,
    };
  },
});
```

### serialize

- **Type:** `(routes: Route[]) => string | Promise<string>`
- **Default:** `undefined`

Custom XML serialization function:

```typescript
sitemap({
  serialize: (routes) => {
    // Return custom XML
    return `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map((r) => `<url><loc>${r.url}</loc></url>`).join("\n  ")}
</urlset>`;
  },
});
```

### generateRobotsTxt

- **Type:** `boolean`
- **Default:** `false`

Generate or update `robots.txt` with Sitemap directive:

```typescript
sitemap({
  hostname: "https://example.com",
  generateRobotsTxt: true,
});
```

Creates:

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

Or appends to existing `robots.txt`:

```txt
# Your existing rules...

Sitemap: https://example.com/sitemap.xml
```

## TypeScript Configuration

For full type safety, import the plugin types:

```typescript
import type { PluginOptions } from "@pyyupsk/vite-plugin-sitemap";
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

const sitemapOptions: PluginOptions = {
  hostname: "https://example.com",
  changefreq: "weekly",
};

export default defineConfig({
  plugins: [sitemap(sitemapOptions)],
});
```

## Environment-Specific Configuration

Use Vite's mode for different environments:

```typescript
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    sitemap({
      hostname: mode === "production" ? "https://example.com" : "https://staging.example.com",
    }),
  ],
}));
```

## Next Steps

- Define your [Routes](/guide/routes)
- Add [Google Extensions](/guide/extensions/images)
- Use the [CLI](/guide/cli) for validation
