# API Reference

This page documents the public API exports from `@pyyupsk/vite-plugin-sitemap`.

## Plugin

### sitemapPlugin (default)

The main Vite plugin function.

```typescript
import sitemap from "@pyyupsk/vite-plugin-sitemap";

// Usage
sitemap(options?: PluginOptions): Plugin
```

**Parameters:**

- `options` - [Plugin options](/config/)

**Returns:** Vite Plugin object

**Example:**

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

## Generator Functions

### generateSitemap

Generate sitemap XML from routes programmatically.

```typescript
import { generateSitemap } from "@pyyupsk/vite-plugin-sitemap";

async function generateSitemap(
  routes: Route[],
  options?: GeneratorOptions,
): Promise<GeneratorResult>;
```

**Parameters:**

- `routes` - Array of route objects
- `options` - Generator options

**Returns:** `GeneratorResult` object with XML and metadata

**Example:**

```typescript
import { generateSitemap } from "@pyyupsk/vite-plugin-sitemap";

const result = await generateSitemap(
  [{ url: "https://example.com/" }, { url: "https://example.com/about" }],
  { hostname: "https://example.com" },
);

if (result.success) {
  console.log(result.xml);
}
```

---

### validateRoutes

Validate routes without generating XML.

```typescript
import { validateRoutes } from "@pyyupsk/vite-plugin-sitemap";

function validateRoutes(routes: Route[]): ValidationResult;
```

**Parameters:**

- `routes` - Array of route objects

**Returns:** `ValidationResult` with validation status and errors

**Example:**

```typescript
import { validateRoutes } from "@pyyupsk/vite-plugin-sitemap";

const result = validateRoutes([
  { url: "https://example.com/" },
  { url: "invalid-url" }, // Will fail validation
]);

if (!result.valid) {
  console.error(result.errors);
}
```

## XML Builders

### buildSitemapXml

Build a complete sitemap XML string from routes.

```typescript
import { buildSitemapXml } from "@pyyupsk/vite-plugin-sitemap";

function buildSitemapXml(routes: Route[]): string;
```

**Example:**

```typescript
import { buildSitemapXml } from "@pyyupsk/vite-plugin-sitemap";

const xml = buildSitemapXml([
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
]);
```

---

### buildSitemapIndexXml

Build a sitemap index XML string.

```typescript
import { buildSitemapIndexXml } from "@pyyupsk/vite-plugin-sitemap";

function buildSitemapIndexXml(references: SitemapReference[]): string;
```

**Example:**

```typescript
import { buildSitemapIndexXml } from "@pyyupsk/vite-plugin-sitemap";

const xml = buildSitemapIndexXml([
  { loc: "https://example.com/sitemap-0.xml", lastmod: "2025-01-15" },
  { loc: "https://example.com/sitemap-1.xml", lastmod: "2025-01-15" },
]);
```

---

### buildUrlElement

Build a single URL element XML string.

```typescript
import { buildUrlElement } from "@pyyupsk/vite-plugin-sitemap";

function buildUrlElement(route: Route): string;
```

**Example:**

```typescript
import { buildUrlElement } from "@pyyupsk/vite-plugin-sitemap";

const xml = buildUrlElement({
  url: "https://example.com/",
  lastmod: "2025-01-15",
  changefreq: "daily",
  priority: 1.0,
});

// Output:
// <url>
//   <loc>https://example.com/</loc>
//   <lastmod>2025-01-15</lastmod>
//   <changefreq>daily</changefreq>
//   <priority>1.0</priority>
// </url>
```

## Utilities

### calculateByteSize

Calculate the byte size of an XML string (UTF-8).

```typescript
import { calculateByteSize } from "@pyyupsk/vite-plugin-sitemap";

function calculateByteSize(xml: string): number;
```

**Example:**

```typescript
import { buildSitemapXml, calculateByteSize } from "@pyyupsk/vite-plugin-sitemap";

const xml = buildSitemapXml([{ url: "https://example.com/" }]);
const size = calculateByteSize(xml);
console.log(`Sitemap size: ${size} bytes`);
```

## Validation

### ValidationError

Error class for validation failures.

```typescript
import { ValidationError } from "@pyyupsk/vite-plugin-sitemap";

interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
  received?: unknown;
}
```

---

### formatResultForConsole

Format a validation result for console output.

```typescript
import { formatResultForConsole } from "@pyyupsk/vite-plugin-sitemap";

function formatResultForConsole(result: ValidationResult): string;
```

---

### formatErrorsForConsole

Format validation errors for console output.

```typescript
import { formatErrorsForConsole } from "@pyyupsk/vite-plugin-sitemap";

function formatErrorsForConsole(errors: ValidationError[]): string;
```

## Full Export List

```typescript
// Default export
export { sitemapPlugin as default };

// Plugin
export { sitemapPlugin, PLUGIN_NAME };

// Generator
export { generateSitemap, validateRoutes };
export type { GenerationOptions, GenerationResult };

// XML Builders
export { buildSitemapXml, buildSitemapIndexXml, buildUrlElement, calculateByteSize };

// Validation
export { formatResultForConsole, formatErrorsForConsole };
export type { ValidationError, ValidationResult };

// Types
export type {
  Route,
  ChangeFrequency,
  Image,
  Video,
  News,
  NewsPublication,
  Alternate,
  VideoRestriction,
  VideoPlatform,
  VideoUploader,
  PluginOptions,
  RouteTransformer,
  XmlSerializer,
};
```
