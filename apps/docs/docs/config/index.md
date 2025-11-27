# Plugin Options

Complete reference for all plugin configuration options.

## Usage

```typescript
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      // options here
    }),
  ],
});
```

## Options

### hostname

- **Type:** `string`
- **Default:** `undefined`

The base URL of your site. Required for relative URLs to be properly resolved.

```typescript
sitemap({
  hostname: "https://example.com",
});
```

All relative URLs in your routes will be prefixed with this hostname:

```typescript
// Route: { url: "/about" }
// Output: <loc>https://example.com/about</loc>
```

---

### sitemapFile

- **Type:** `string`
- **Default:** Auto-discovered

Path to your sitemap definition file (without extension).

```typescript
sitemap({
  sitemapFile: "config/sitemap",
});
```

If not specified, the plugin searches in order:

1. `src/sitemap.{ts,js,mts,mjs}`
2. `sitemap.{ts,js,mts,mjs}` (project root)

---

### outDir

- **Type:** `string`
- **Default:** Vite's `build.outDir`

Output directory for generated sitemap files.

```typescript
sitemap({
  outDir: "public",
});
```

---

### filename

- **Type:** `string`
- **Default:** `"sitemap.xml"`

Name of the output sitemap file.

```typescript
sitemap({
  filename: "urlset.xml",
});
```

::: info
When sitemap splitting occurs, this becomes the base name:

- `sitemap-0.xml`, `sitemap-1.xml`, ...
- `sitemap-index.xml`
  :::

---

### changefreq

- **Type:** `ChangeFrequency`
- **Default:** `undefined`

Default change frequency applied to all routes that don't specify their own.

```typescript
sitemap({
  changefreq: "weekly",
});
```

**Valid values:**

- `"always"` - Changes every time accessed
- `"hourly"` - Changes every hour
- `"daily"` - Changes every day
- `"weekly"` - Changes every week
- `"monthly"` - Changes every month
- `"yearly"` - Changes every year
- `"never"` - Archived content

---

### priority

- **Type:** `number`
- **Default:** `undefined`

Default priority applied to all routes. Must be between `0.0` and `1.0`.

```typescript
sitemap({
  priority: 0.5,
});
```

::: tip
Priority is relative to other pages on your site, not absolute. The default for pages without a specified priority is `0.5`.
:::

---

### lastmod

- **Type:** `string`
- **Default:** `undefined`

Default last modified date for all routes. Must be in W3C Datetime format.

```typescript
sitemap({
  lastmod: "2025-01-15",
});

// Or dynamic
sitemap({
  lastmod: new Date().toISOString().split("T")[0],
});
```

**Valid formats:**

- `"2025"` - Year only
- `"2025-01"` - Year and month
- `"2025-01-15"` - Full date
- `"2025-01-15T10:30:00Z"` - With time (UTC)
- `"2025-01-15T10:30:00+05:30"` - With timezone

---

### exclude

- **Type:** `Array<string | RegExp>`
- **Default:** `[]`

URL patterns to exclude from the sitemap.

```typescript
sitemap({
  exclude: [
    // String patterns (glob-like matching)
    "/admin/*",
    "/api/*",
    "/internal/*",

    // Regular expressions
    /^\/private/,
    /\/draft-/,
    /\?/, // Exclude URLs with query strings
  ],
});
```

---

### transform

- **Type:** `(route: Route) => Route | null | Promise<Route | null>`
- **Default:** `undefined`

Transform each route before XML generation. Return `null` to exclude the route.

```typescript
// Add trailing slashes
sitemap({
  transform: (route) => ({
    ...route,
    url: route.url.endsWith("/") ? route.url : `${route.url}/`,
  }),
});

// Async transformation
sitemap({
  transform: async (route) => {
    const meta = await fetchPageMeta(route.url);
    if (!meta.published) return null;
    return { ...route, lastmod: meta.updatedAt };
  },
});

// Exclude specific routes
sitemap({
  transform: (route) => {
    if (route.url.includes("/secret/")) return null;
    return route;
  },
});
```

---

### serialize

- **Type:** `(routes: Route[]) => string | Promise<string>`
- **Default:** `undefined`

Custom XML serialization function. Receives all validated routes and must return the complete XML string.

```typescript
sitemap({
  serialize: (routes) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map((r) => `<url><loc>${r.url}</loc></url>`).join("\n  ")}
</urlset>`;
  },
});
```

See [Custom Serialization](/guide/advanced/custom-serialization) for detailed examples.

---

### generateRobotsTxt

- **Type:** `boolean`
- **Default:** `false`

Generate or update `robots.txt` with a Sitemap directive.

```typescript
sitemap({
  hostname: "https://example.com",
  generateRobotsTxt: true,
});
```

**Creates new robots.txt:**

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

**Updates existing robots.txt:**

- Appends Sitemap directive if not present
- Preserves existing content

::: warning
Requires `hostname` to be set for the Sitemap URL.
:::

## TypeScript

For full type safety, import the options type:

```typescript
import type { PluginOptions } from "@pyyupsk/vite-plugin-sitemap";
import sitemap from "@pyyupsk/vite-plugin-sitemap";

const options: PluginOptions = {
  hostname: "https://example.com",
  changefreq: "weekly",
};

export default defineConfig({
  plugins: [sitemap(options)],
});
```

## Complete Example

```typescript
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
      sitemapFile: "src/sitemap",
      outDir: "dist",
      filename: "sitemap.xml",
      changefreq: "weekly",
      priority: 0.5,
      lastmod: new Date().toISOString().split("T")[0],
      exclude: ["/admin/*", "/api/*", /^\/private/],
      transform: (route) => {
        // Add trailing slash
        if (!route.url.endsWith("/")) {
          return { ...route, url: `${route.url}/` };
        }
        return route;
      },
      generateRobotsTxt: true,
    }),
  ],
});
```
