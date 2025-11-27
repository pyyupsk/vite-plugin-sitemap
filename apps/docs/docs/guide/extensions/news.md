# News Sitemaps

News sitemaps help Google News discover and index your news articles. They're essential for news publishers who want their articles to appear in Google News.

## Basic Usage

Add a `news` object to any route:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  {
    url: "/news/breaking-story",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-15T10:30:00Z",
      title: "Breaking: Important Announcement",
    },
  },
] satisfies Route[];
```

## News Properties

```typescript
interface News {
  // Required
  publication: NewsPublication;
  publication_date: string;
  title: string;

  // Optional
  keywords?: string;
  stock_tickers?: string;
}

interface NewsPublication {
  name: string;
  language: string;
}
```

### Required Properties

#### publication

Information about the news publication:

```typescript
{
  publication: {
    name: "Example News",      // Publication name
    language: "en"             // ISO 639-1 language code
  }
}
```

#### publication_date

When the article was published (W3C Datetime):

```typescript
{
  publication_date: "2025-01-15T10:30:00Z";
}

// Or just the date
{
  publication_date: "2025-01-15";
}
```

#### title

The title of the news article (max 2,048 characters):

```typescript
{
  title: "Breaking: Major Tech Company Announces New Product";
}
```

### Optional Properties

#### keywords

Comma-separated list of keywords:

```typescript
{
  keywords: "technology, business, announcement, product launch";
}
```

#### stock_tickers

Comma-separated stock tickers (max 5):

```typescript
{
  stock_tickers: "NASDAQ:GOOG, NASDAQ:AAPL";
}
```

## Full Example

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

const now = new Date().toISOString();

export default [
  {
    url: "/news/tech-announcement",
    lastmod: now,
    news: {
      publication: {
        name: "Tech Daily",
        language: "en",
      },
      publication_date: now,
      title: "Major Tech Company Unveils Revolutionary New Product",
      keywords: "technology, innovation, product launch, silicon valley",
      stock_tickers: "NASDAQ:TECH",
    },
  },
  {
    url: "/news/market-update",
    lastmod: now,
    news: {
      publication: {
        name: "Tech Daily",
        language: "en",
      },
      publication_date: now,
      title: "Stock Markets React to Federal Reserve Decision",
      keywords: "finance, stocks, federal reserve, economy",
      stock_tickers: "NYSE:DJI, NASDAQ:IXIC, NYSE:SPX",
    },
  },
] satisfies Route[];
```

## Generated XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://example.com/news/tech-announcement</loc>
    <lastmod>2025-01-15T10:30:00.000Z</lastmod>
    <news:news>
      <news:publication>
        <news:name>Tech Daily</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2025-01-15T10:30:00.000Z</news:publication_date>
      <news:title>Major Tech Company Unveils Revolutionary New Product</news:title>
      <news:keywords>technology, innovation, product launch, silicon valley</news:keywords>
      <news:stock_tickers>NASDAQ:TECH</news:stock_tickers>
    </news:news>
  </url>
</urlset>
```

## Dynamic News Generation

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default async function getRoutes(): Promise<Route[]> {
  // Fetch recent articles (last 2 days for Google News)
  const articles = await fetch("https://api.example.com/articles?since=2d").then((r) => r.json());

  return articles.map((article) => ({
    url: `/news/${article.slug}`,
    lastmod: article.updatedAt,
    news: {
      publication: {
        name: "Example News",
        language: article.language,
      },
      publication_date: article.publishedAt,
      title: article.title,
      keywords: article.tags.join(", "),
    },
  }));
}
```

## Multi-Language News

For publications in multiple languages:

```typescript
import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// English articles
export const newsEn: Route[] = [
  {
    url: "/en/news/article-1",
    news: {
      publication: {
        name: "Global News",
        language: "en",
      },
      publication_date: "2025-01-15",
      title: "English Article Title",
    },
  },
];

// Spanish articles
export const newsEs: Route[] = [
  {
    url: "/es/noticias/articulo-1",
    news: {
      publication: {
        name: "Global News",
        language: "es",
      },
      publication_date: "2025-01-15",
      title: "Título del Artículo en Español",
    },
  },
];
```

## Best Practices

1. **Fresh content only** - Google News indexes articles from the past 2 days
2. **Accurate publication dates** - Must match when the article was first published
3. **Original content** - Don't include aggregated or syndicated content
4. **Unique titles** - Each article should have a distinct, descriptive title
5. **Update frequently** - Rebuild sitemap when new articles are published
6. **Use ISO 639-1 codes** - For language (en, es, fr, de, etc.)

## Google News Requirements

To be included in Google News:

1. Your site must be accepted into Google News
2. Articles must be original news content
3. Publication must have a consistent name
4. Articles should be timely (within 2 days)

## Related

- [Google News Sitemap Documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- [Image Sitemaps](/guide/extensions/images)
- [Video Sitemaps](/guide/extensions/videos)
- [Internationalization](/guide/extensions/i18n)
