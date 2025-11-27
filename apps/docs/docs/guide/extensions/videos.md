# Video Sitemaps

Video sitemaps provide rich metadata about video content on your pages, helping Google understand and index your videos.

## Basic Usage

Add a `videos` array to any route:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/tutorials/getting-started",
    videos: [
      {
        title: "Getting Started Tutorial",
        description: "Learn how to set up and use our product",
        thumbnail_loc: "https://example.com/thumbnails/tutorial.jpg",
        content_loc: "https://example.com/videos/tutorial.mp4",
      },
    ],
  },
] satisfies Route[];
```

## Video Properties

```typescript
interface Video {
  // Required
  title: string;
  description: string;
  thumbnail_loc: string;

  // Location (at least one required)
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

### Required Properties

#### title

The title of the video (max 100 characters):

```typescript
{
  title: "Getting Started with Our Product";
}
```

#### description

A description of the video (max 2,048 characters):

```typescript
{
  description: "In this comprehensive guide, you'll learn how to set up and configure our product for your specific use case.";
}
```

#### thumbnail_loc

URL to the video thumbnail image:

```typescript
{
  thumbnail_loc: "https://example.com/thumbnails/video.jpg";
}
```

### Location Properties

At least one of `content_loc` or `player_loc` is required.

#### content_loc

Direct URL to the video file:

```typescript
{
  content_loc: "https://example.com/videos/tutorial.mp4";
}
```

#### player_loc

URL to a player for the video:

```typescript
{
  player_loc: "https://example.com/player?video=tutorial";
}
```

### Optional Properties

#### duration

Video duration in seconds (1 to 28,800):

```typescript
{
  duration: 300; // 5 minutes
}
```

#### rating

Video rating from 0.0 to 5.0:

```typescript
{
  rating: 4.5;
}
```

#### view_count

Number of times the video has been viewed:

```typescript
{
  view_count: 15000;
}
```

#### publication_date

When the video was first published (W3C Datetime):

```typescript
{
  publication_date: "2025-01-15";
}
```

#### expiration_date

When the video will no longer be available:

```typescript
{
  expiration_date: "2025-12-31";
}
```

#### family_friendly

Whether the video is suitable for all ages:

```typescript
{
  family_friendly: true;
}
```

#### live

Whether the video is a live stream:

```typescript
{
  live: false;
}
```

#### requires_subscription

Whether a subscription is required to view:

```typescript
{
  requires_subscription: false;
}
```

#### tag

Tags associated with the video (max 32 tags):

```typescript
{
  tag: ["tutorial", "beginner", "guide", "setup"];
}
```

### Complex Properties

#### restriction

Geographic restrictions:

```typescript
{
  restriction: {
    relationship: "allow",
    countries: ["US", "CA", "GB"]
  }
}

// Or deny specific countries
{
  restriction: {
    relationship: "deny",
    countries: ["CN", "RU"]
  }
}
```

#### platform

Platform restrictions:

```typescript
{
  platform: {
    relationship: "allow",
    platforms: ["web", "mobile"]  // "web" | "mobile" | "tv"
  }
}
```

#### uploader

Information about the video uploader:

```typescript
{
  uploader: {
    name: "Example Channel",
    info: "https://example.com/channel"
  }
}
```

## Full Example

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/videos/tutorial",
    priority: 0.9,
    videos: [
      {
        title: "Getting Started Tutorial",
        description:
          "Learn how to use our product in this comprehensive guide covering setup, configuration, and best practices.",
        thumbnail_loc: "https://example.com/thumbnails/tutorial.jpg",
        content_loc: "https://example.com/videos/tutorial.mp4",
        duration: 600,
        rating: 4.8,
        view_count: 25000,
        publication_date: "2025-01-15",
        family_friendly: true,
        tag: ["tutorial", "beginner", "guide"],
        uploader: {
          name: "Example Tutorials",
          info: "https://example.com/channel",
        },
        restriction: {
          relationship: "allow",
          countries: ["US", "CA", "GB", "AU"],
        },
        platform: {
          relationship: "allow",
          platforms: ["web", "mobile", "tv"],
        },
      },
    ],
  },
] satisfies Route[];
```

## Generated XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://example.com/videos/tutorial</loc>
    <priority>0.9</priority>
    <video:video>
      <video:thumbnail_loc>https://example.com/thumbnails/tutorial.jpg</video:thumbnail_loc>
      <video:title>Getting Started Tutorial</video:title>
      <video:description>Learn how to use our product...</video:description>
      <video:content_loc>https://example.com/videos/tutorial.mp4</video:content_loc>
      <video:duration>600</video:duration>
      <video:rating>4.8</video:rating>
      <video:view_count>25000</video:view_count>
      <video:publication_date>2025-01-15</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:tag>tutorial</video:tag>
      <video:tag>beginner</video:tag>
      <video:tag>guide</video:tag>
      <video:restriction relationship="allow">US CA GB AU</video:restriction>
      <video:platform relationship="allow">web mobile tv</video:platform>
      <video:uploader info="https://example.com/channel">Example Tutorials</video:uploader>
    </video:video>
  </url>
</urlset>
```

## Dynamic Video Generation

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  const videos = await fetch("https://api.example.com/videos").then((r) => r.json());

  return videos.map((video) => ({
    url: `/videos/${video.slug}`,
    lastmod: video.updatedAt,
    videos: [
      {
        title: video.title,
        description: video.description,
        thumbnail_loc: video.thumbnailUrl,
        content_loc: video.videoUrl,
        duration: video.durationSeconds,
        publication_date: video.publishedAt,
        view_count: video.views,
        tag: video.tags,
      },
    ],
  }));
}
```

## Best Practices

1. **Use high-quality thumbnails** - Minimum 160x90, recommended 1920x1080
2. **Write accurate descriptions** - Help users understand video content
3. **Keep titles concise** - Maximum 100 characters
4. **Update view counts** - Rebuild sitemap periodically to update metrics
5. **Set expiration dates** - For time-limited content

## Related

- [Google Video Sitemap Documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [Image Sitemaps](/guide/extensions/images)
- [News Sitemaps](/guide/extensions/news)
