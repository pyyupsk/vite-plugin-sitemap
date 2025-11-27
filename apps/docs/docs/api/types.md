# Types

TypeScript type definitions exported by `@pyyupsk/vite-plugin-sitemap`.

## Core Types

### Route

A single URL entry in the sitemap.

```typescript
interface Route {
  url: string;
  lastmod?: string;
  changefreq?: ChangeFrequency;
  priority?: number;
  images?: Image[];
  videos?: Video[];
  news?: News;
  alternates?: Alternate[];
}
```

---

### ChangeFrequency

Valid change frequency values.

```typescript
type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
```

---

### RouteGenerator

Async function that returns routes.

```typescript
type RouteGenerator = () => Promise<Route[]> | Route[];
```

---

### SitemapDefaultExport

Valid default export types from sitemap.ts.

```typescript
type SitemapDefaultExport = Route[] | RouteGenerator;
```

## Plugin Types

### PluginOptions

Plugin configuration options.

```typescript
interface PluginOptions {
  hostname?: string;
  sitemapFile?: string;
  outDir?: string;
  filename?: string;
  changefreq?: ChangeFrequency;
  priority?: number;
  lastmod?: string;
  exclude?: Array<string | RegExp>;
  transform?: RouteTransformer;
  serialize?: XmlSerializer;
  generateRobotsTxt?: boolean;
}
```

---

### RouteTransformer

Function to transform routes before XML generation.

```typescript
type RouteTransformer = (route: Route) => Route | null | Promise<Route | null>;
```

---

### XmlSerializer

Custom XML serializer function.

```typescript
type XmlSerializer = (routes: Route[]) => string | Promise<string>;
```

## Extension Types

### Image

Image metadata for Google Image sitemap extension.

```typescript
interface Image {
  loc: string;
  title?: string;
  caption?: string;
  geo_location?: string;
  license?: string;
}
```

---

### Video

Video metadata for Google Video sitemap extension.

```typescript
interface Video {
  title: string;
  description: string;
  thumbnail_loc: string;
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

---

### VideoRestriction

Geographic restrictions for video playback.

```typescript
interface VideoRestriction {
  relationship: "allow" | "deny";
  countries: string[];
}
```

---

### VideoPlatform

Platform restrictions for video playback.

```typescript
interface VideoPlatform {
  relationship: "allow" | "deny";
  platforms: Array<"web" | "mobile" | "tv">;
}
```

---

### VideoUploader

Information about the video uploader.

```typescript
interface VideoUploader {
  name: string;
  info?: string;
}
```

---

### News

News article metadata for Google News sitemap extension.

```typescript
interface News {
  publication: NewsPublication;
  publication_date: string;
  title: string;
  keywords?: string;
  stock_tickers?: string;
}
```

---

### NewsPublication

Information about the news publication.

```typescript
interface NewsPublication {
  name: string;
  language: string;
}
```

---

### Alternate

Alternate language version for hreflang annotations.

```typescript
interface Alternate {
  hreflang: string;
  href: string;
}
```

## Result Types

### ValidationResult

Result from route validation.

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

---

### ValidationError

A validation error.

```typescript
interface ValidationError {
  url: string;
  field: string;
  message: string;
  suggestion?: string;
  received?: unknown;
}
```

---

### ValidationWarning

A validation warning (non-blocking).

```typescript
interface ValidationWarning {
  url: string;
  field: string;
  message: string;
}
```

---

### GeneratorResult

Result from sitemap generation.

```typescript
interface GeneratorResult {
  success: boolean;
  xml?: string;
  byteSize?: number;
  routeCount?: number;
  warnings: string[];
  validation: ValidationResult;
  splitResult?: SplitResult;
}
```

---

### SplitResult

Result when sitemap was split into multiple files.

```typescript
interface SplitResult {
  wasSplit: boolean;
  sitemaps: SitemapChunk[];
  indexXml?: string;
}
```

---

### SitemapChunk

A chunk of a split sitemap.

```typescript
interface SitemapChunk {
  filename: string;
  xml: string;
  routes: Route[];
  byteSize: number;
}
```

## Sitemap Types

### Sitemap

Generated sitemap file structure.

```typescript
interface Sitemap {
  filename: string;
  routes: Route[];
  byteSize: number;
}
```

---

### SitemapIndex

Index file referencing multiple sitemaps.

```typescript
interface SitemapIndex {
  filename: string;
  sitemaps: SitemapReference[];
}
```

---

### SitemapReference

Reference to a child sitemap in an index.

```typescript
interface SitemapReference {
  loc: string;
  lastmod?: string;
}
```

## Importing Types

Import types for use in your code:

```typescript
import type {
  Route,
  ChangeFrequency,
  Image,
  Video,
  News,
  Alternate,
  PluginOptions,
  RouteTransformer,
  XmlSerializer,
  ValidationResult,
} from "@pyyupsk/vite-plugin-sitemap";
```

## Type-Safe Routes

Use `satisfies` for type checking without explicit annotation:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/",
    priority: 1.0,
    changefreq: "daily",
  },
  {
    url: "/about",
    priority: 0.8,
  },
] satisfies Route[];
```
