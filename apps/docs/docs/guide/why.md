# Why This Plugin?

There are several sitemap plugins for Vite. Here's why `@pyyupsk/vite-plugin-sitemap` stands out.

## Key Differentiators

### Full Google Extensions Support

Most sitemap plugins only support basic URL entries. This plugin provides first-class support for:

- **Image sitemaps** - Help Google discover images on your pages
- **Video sitemaps** - Provide rich metadata for video content
- **News sitemaps** - Optimize for Google News indexing
- **Internationalization** - hreflang annotations for multi-language sites

### Type-Safe Configuration

Built with TypeScript from the ground up:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Full IntelliSense and compile-time checking
const routes: Route[] = [
  {
    url: "/video",
    videos: [
      {
        title: "Tutorial",
        description: "Learn how to use our product",
        thumbnail_loc: "https://example.com/thumb.jpg",
        // TypeScript will catch missing required fields
      },
    ],
  },
];
```

### Runtime Validation

Zod-powered validation catches errors before they reach production:

```bash
$ vite-sitemap validate

✗ Validation failed:
  Route "/blog/post-1":
    - lastmod: Invalid W3C Datetime format
      Received: "2025-13-45"
      Suggestion: Use ISO 8601 format like "2025-01-15" or "2025-01-15T10:30:00Z"
```

### Async Route Generation

Fetch routes from any data source at build time:

```typescript
export default async function getRoutes() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return posts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
  }));
}
```

### Automatic Sitemap Splitting

Large sites with 50,000+ URLs are automatically split into multiple sitemaps with an index file, following Google's guidelines.

### Powerful CLI

Validate, preview, and generate sitemaps without running a full Vite build:

```bash
# Validate configuration
vite-sitemap validate

# Preview generated XML
vite-sitemap preview

# Generate without full build
vite-sitemap generate --hostname https://example.com
```

## Comparison

| Feature              | vite-plugin-sitemap | Others  |
| -------------------- | ------------------- | ------- |
| TypeScript           | Full support        | Partial |
| Google Image Sitemap | Yes                 | No      |
| Google Video Sitemap | Yes                 | No      |
| Google News Sitemap  | Yes                 | No      |
| hreflang Support     | Yes                 | Partial |
| Runtime Validation   | Zod-powered         | None    |
| Async Routes         | Yes                 | Limited |
| Auto-splitting       | Yes                 | No      |
| CLI Tools            | Full suite          | None    |
| Zero Runtime         | Yes                 | Yes     |

## When to Use This Plugin

This plugin is ideal if you:

- Need Google extensions (images, videos, news)
- Want comprehensive type safety
- Have large sites requiring sitemap splitting
- Need to validate sitemaps in CI/CD
- Want to fetch routes from APIs at build time
- Value detailed error messages and suggestions

## When to Consider Alternatives

You might prefer a simpler solution if:

- You only need basic sitemaps with no extensions
- You're using a framework with built-in sitemap support (Next.js, Nuxt, etc.)
- You prefer minimal configuration over flexibility
