# Route Options

Complete reference for route configuration options.

## Basic Route

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const route: Route = {
  url: "/about",
};
```

## Route Interface

```typescript
interface Route {
  // Required
  url: string;

  // Standard sitemap properties
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: number;

  // Google extensions
  images?: Image[];
  videos?: Video[];
  news?: News;
  alternates?: Alternate[];
}
```

## Standard Properties

### url

- **Type:** `string`
- **Required:** Yes

The URL of the page. Can be relative or absolute.

```typescript
// Relative (hostname prepended from config)
{
  url: "/about";
}
{
  url: "/blog/post-1";
}

// Absolute
{
  url: "https://example.com/about";
}
```

**Requirements:**

- Maximum 2,048 characters
- Must be valid URL format
- No URL fragments (`#`)
- After resolution, must use `http://` or `https://`

---

### lastmod

- **Type:** `string`
- **Required:** No

The date the page was last modified. Must be W3C Datetime format.

```typescript
{ url: "/", lastmod: "2025-01-15" }
{ url: "/", lastmod: "2025-01-15T10:30:00Z" }
{ url: "/", lastmod: "2025-01-15T10:30:00+05:30" }
```

**Valid formats:**
| Format | Example |
|--------|---------|
| Year | `"2025"` |
| Year-Month | `"2025-01"` |
| Date | `"2025-01-15"` |
| DateTime (UTC) | `"2025-01-15T10:30:00Z"` |
| DateTime (offset) | `"2025-01-15T10:30:00+05:30"` |

---

### changefreq

- **Type:** `ChangeFrequency`
- **Required:** No

How frequently the page is likely to change.

```typescript
type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
```

```typescript
{ url: "/", changefreq: "daily" }
{ url: "/blog", changefreq: "weekly" }
{ url: "/archive/2020", changefreq: "never" }
```

---

### priority

- **Type:** `number`
- **Required:** No

The priority of this URL relative to other URLs on your site.

```typescript
{ url: "/", priority: 1.0 }      // Highest
{ url: "/about", priority: 0.8 }
{ url: "/contact", priority: 0.5 } // Default
{ url: "/terms", priority: 0.3 }  // Lower
```

**Requirements:**

- Value between `0.0` and `1.0`
- Default is `0.5` if not specified

## Google Extensions

### images

- **Type:** `Image[]`
- **Required:** No

Images associated with this URL. See [Image Sitemaps](/guide/extensions/images).

```typescript
interface Image {
  loc: string; // Required: Image URL
  title?: string; // Image title
  caption?: string; // Image caption
  geo_location?: string; // Geographic location
  license?: string; // License URL
}
```

```typescript
{
  url: "/gallery",
  images: [
    {
      loc: "https://example.com/images/photo.jpg",
      title: "Beautiful Photo",
      caption: "A stunning landscape",
      geo_location: "Swiss Alps",
    },
  ],
}
```

---

### videos

- **Type:** `Video[]`
- **Required:** No

Videos associated with this URL. See [Video Sitemaps](/guide/extensions/videos).

```typescript
interface Video {
  // Required
  title: string;
  description: string;
  thumbnail_loc: string;

  // At least one required
  content_loc?: string;
  player_loc?: string;

  // Optional
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

```typescript
{
  url: "/videos/tutorial",
  videos: [
    {
      title: "Getting Started",
      description: "Learn the basics",
      thumbnail_loc: "https://example.com/thumb.jpg",
      content_loc: "https://example.com/video.mp4",
      duration: 300,
    },
  ],
}
```

---

### news

- **Type:** `News`
- **Required:** No

News article metadata. See [News Sitemaps](/guide/extensions/news).

```typescript
interface News {
  publication: {
    name: string; // Publication name
    language: string; // ISO 639-1 code
  };
  publication_date: string; // W3C Datetime
  title: string; // Article title

  // Optional
  keywords?: string; // Comma-separated
  stock_tickers?: string; // Max 5 tickers
}
```

```typescript
{
  url: "/news/breaking",
  news: {
    publication: {
      name: "Example News",
      language: "en",
    },
    publication_date: "2025-01-15T10:30:00Z",
    title: "Breaking News Story",
    keywords: "breaking, news, important",
  },
}
```

---

### alternates

- **Type:** `Alternate[]`
- **Required:** No

Alternate language versions. See [Internationalization](/guide/extensions/i18n).

```typescript
interface Alternate {
  hreflang: string; // Language code or "x-default"
  href: string; // Absolute URL
}
```

```typescript
{
  url: "/products",
  alternates: [
    { hreflang: "en", href: "https://example.com/products" },
    { hreflang: "es", href: "https://example.com/es/productos" },
    { hreflang: "x-default", href: "https://example.com/products" },
  ],
}
```

## Complete Example

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  // Basic page
  {
    url: "/",
    priority: 1.0,
    changefreq: "daily",
    lastmod: "2025-01-15",
  },

  // Page with images
  {
    url: "/gallery",
    priority: 0.8,
    images: [
      {
        loc: "https://example.com/images/hero.jpg",
        title: "Hero Image",
      },
    ],
  },

  // Video page
  {
    url: "/tutorials",
    videos: [
      {
        title: "Tutorial",
        description: "Learn how to use our product",
        thumbnail_loc: "https://example.com/thumb.jpg",
        content_loc: "https://example.com/video.mp4",
        duration: 600,
      },
    ],
  },

  // News article
  {
    url: "/news/announcement",
    news: {
      publication: { name: "Company Blog", language: "en" },
      publication_date: new Date().toISOString(),
      title: "Important Announcement",
    },
  },

  // Multi-language page
  {
    url: "/about",
    alternates: [
      { hreflang: "en", href: "https://example.com/about" },
      { hreflang: "es", href: "https://example.com/es/acerca" },
      { hreflang: "x-default", href: "https://example.com/about" },
    ],
  },
] satisfies Route[];
```
