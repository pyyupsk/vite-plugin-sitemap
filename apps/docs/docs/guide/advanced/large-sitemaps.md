# Large Sitemaps

When your site has thousands of URLs, the plugin automatically handles sitemap splitting according to Google's guidelines.

## Automatic Splitting

The plugin automatically splits sitemaps when they exceed:

- **50,000 URLs** per sitemap file
- **45 MB** file size (with 5 MB buffer from Google's 50 MB limit)

No configuration required - it just works.

## How It Works

When splitting is triggered:

1. Routes are distributed across multiple sitemap files
2. Each file is named sequentially: `sitemap-0.xml`, `sitemap-1.xml`, etc.
3. A `sitemap-index.xml` is generated referencing all sitemap files

## Example Output

For a site with 120,000 URLs:

```
dist/
├── sitemap-0.xml        # URLs 1-50,000
├── sitemap-1.xml        # URLs 50,001-100,000
├── sitemap-2.xml        # URLs 100,001-120,000
└── sitemap-index.xml    # References all sitemaps
```

### Generated Index File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-0.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-1.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-2.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
</sitemapindex>
```

## Named Exports with Splitting

When using named exports, each export can be split independently:

```typescript
// Large product catalog
export async function products(): Promise<Route[]> {
  // Returns 75,000 routes
  return await fetchAllProducts();
}

// Large blog archive
export async function blog(): Promise<Route[]> {
  // Returns 60,000 routes
  return await fetchAllPosts();
}
```

**Output:**

```
dist/
├── sitemap-products-0.xml    # Products 1-50,000
├── sitemap-products-1.xml    # Products 50,001-75,000
├── sitemap-blog-0.xml        # Posts 1-50,000
├── sitemap-blog-1.xml        # Posts 50,001-60,000
└── sitemap-index.xml         # References all 4 sitemaps
```

## Performance Considerations

### Memory Usage

For extremely large sitemaps, consider:

1. **Streaming data** - Don't load all routes into memory at once
2. **Pagination** - Fetch routes in batches

```typescript
export default async function getRoutes(): Promise<Route[]> {
  const routes: Route[] = [];
  let page = 1;
  const pageSize = 10000;

  while (true) {
    const batch = await fetchRoutes({ page, pageSize });
    if (batch.length === 0) break;

    routes.push(...batch);
    page++;
  }

  return routes;
}
```

### Build Time

Large sitemaps increase build time. To optimize:

1. **Cache API responses** - Store fetched data locally during development
2. **Parallel fetching** - Use `Promise.all` for independent data sources

```typescript
export default async function getRoutes(): Promise<Route[]> {
  // Parallel fetching
  const [products, posts, pages] = await Promise.all([fetchProducts(), fetchPosts(), fetchPages()]);

  return [...products, ...posts, ...pages];
}
```

## robots.txt with Split Sitemaps

When `generateRobotsTxt` is enabled with split sitemaps, the Sitemap directive points to the index file:

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

## Monitoring Sitemap Size

Use the CLI to check sitemap sizes without building:

```bash
vite-sitemap preview --verbose
```

Output shows size information:

```bash
ℹ Preview: default (75,000 routes)

Size: 12.4 MB
Routes: 75,000

⚠ Sitemap will be split into 2 files (exceeds 50,000 URL limit)
```

## Google Search Console

After deploying split sitemaps:

1. Submit `sitemap-index.xml` to Google Search Console
2. Google will automatically discover all child sitemaps
3. Monitor indexing status for each sitemap file

## Best Practices

1. **Use the index file** - Always submit the index, not individual sitemaps
2. **Keep URLs consistent** - Don't change URL structures between builds
3. **Update incrementally** - Only regenerate sitemaps when content changes
4. **Monitor coverage** - Check Search Console for indexing issues

## Related

- [Dynamic Routes](/guide/advanced/dynamic-routes)
- [Configuration](/guide/configuration)
- [CLI](/guide/cli)
