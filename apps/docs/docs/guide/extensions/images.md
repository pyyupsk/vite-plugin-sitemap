# Image Sitemaps

Image sitemaps help Google discover images on your pages. This is especially useful for JavaScript-rendered images that might not be discovered during crawling.

## Basic Usage

Add an `images` array to any route:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/gallery",
    images: [
      {
        loc: "https://example.com/images/photo1.jpg",
      },
      {
        loc: "https://example.com/images/photo2.jpg",
      },
    ],
  },
] satisfies Route[];
```

## Image Properties

```typescript
interface Image {
  // Required
  loc: string;

  // Optional
  title?: string;
  caption?: string;
  geo_location?: string;
  license?: string;
}
```

### loc (required)

The URL of the image. Must be an absolute URL:

```typescript
{
  loc: "https://example.com/images/hero.jpg";
}
```

### title

The title of the image:

```typescript
{
  loc: "https://example.com/images/hero.jpg",
  title: "Beautiful Mountain Landscape"
}
```

### caption

A caption describing the image:

```typescript
{
  loc: "https://example.com/images/hero.jpg",
  title: "Mountain Landscape",
  caption: "A stunning view of the Swiss Alps at sunset"
}
```

### geo_location

The geographic location where the image was taken:

```typescript
{
  loc: "https://example.com/images/hero.jpg",
  geo_location: "Swiss Alps, Switzerland"
}
```

### license

A URL to the license of the image:

```typescript
{
  loc: "https://example.com/images/hero.jpg",
  license: "https://example.com/image-license"
}
```

## Full Example

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/gallery",
    priority: 0.8,
    changefreq: "weekly",
    images: [
      {
        loc: "https://example.com/images/landscape.jpg",
        title: "Mountain Landscape",
        caption: "A stunning view of the Swiss Alps at sunset",
        geo_location: "Swiss Alps, Switzerland",
        license: "https://example.com/license",
      },
      {
        loc: "https://example.com/images/city.jpg",
        title: "City Skyline",
        caption: "Downtown skyline at night",
        geo_location: "New York, USA",
      },
    ],
  },
  {
    url: "/products/widget",
    images: [
      {
        loc: "https://example.com/products/widget-front.jpg",
        title: "Widget - Front View",
      },
      {
        loc: "https://example.com/products/widget-side.jpg",
        title: "Widget - Side View",
      },
    ],
  },
] satisfies Route[];
```

## Generated XML

The above configuration generates:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://example.com/images/landscape.jpg</image:loc>
      <image:title>Mountain Landscape</image:title>
      <image:caption>A stunning view of the Swiss Alps at sunset</image:caption>
      <image:geo_location>Swiss Alps, Switzerland</image:geo_location>
      <image:license>https://example.com/license</image:license>
    </image:image>
    <image:image>
      <image:loc>https://example.com/images/city.jpg</image:loc>
      <image:title>City Skyline</image:title>
      <image:caption>Downtown skyline at night</image:caption>
      <image:geo_location>New York, USA</image:geo_location>
    </image:image>
  </url>
</urlset>
```

## Dynamic Image Generation

Fetch images from an API or CMS:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  const galleries = await fetch("https://api.example.com/galleries").then((r) => r.json());

  return galleries.map((gallery) => ({
    url: `/gallery/${gallery.slug}`,
    lastmod: gallery.updatedAt,
    images: gallery.photos.map((photo) => ({
      loc: photo.url,
      title: photo.title,
      caption: photo.description,
      geo_location: photo.location,
    })),
  }));
}
```

## Best Practices

1. **Use descriptive titles and captions** - Help search engines understand your images
2. **Include geo_location** - Useful for location-based image searches
3. **Maximum 1,000 images per URL** - Google's limit per page
4. **Use absolute URLs** - All image URLs must be absolute

## Related

- [Google Image Sitemap Documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Video Sitemaps](/guide/extensions/videos)
- [News Sitemaps](/guide/extensions/news)
