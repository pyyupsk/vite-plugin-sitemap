import type { Alternate, Image, News, Video } from "./extensions";

/**
 * Change frequency values as defined by the sitemap protocol.
 * Indicates how frequently the page is likely to change.
 */
export type ChangeFrequency =
  | "always"
  | "daily"
  | "hourly"
  | "monthly"
  | "never"
  | "weekly"
  | "yearly";

/**
 * A single URL entry in the sitemap.
 */
export interface Route {
  /**
   * Alternate language versions of this URL for hreflang annotations.
   */
  alternates?: Alternate[];

  /**
   * How frequently the page is likely to change.
   */
  changefreq?: ChangeFrequency;

  /**
   * Images associated with this URL for Google Image sitemap extension.
   * Maximum 1,000 images per URL.
   */
  images?: Image[];

  /**
   * The date the page was last modified.
   * Must be in W3C Datetime format (ISO 8601 subset).
   * Examples: '2025-11-26', '2025-11-26T10:30:00Z'
   */
  lastmod?: string;

  /**
   * News article metadata for Google News sitemap extension.
   */
  news?: News;

  /**
   * The priority of this URL relative to other URLs on your site.
   * Valid values range from 0.0 to 1.0.
   */
  priority?: number;

  /**
   * The URL of the page. Must be an absolute URL with http(s) protocol.
   * Maximum 2,048 characters.
   */
  url: string;

  /**
   * Videos associated with this URL for Google Video sitemap extension.
   */
  videos?: Video[];
}

/**
 * Async function that returns routes.
 */
export type RouteGenerator = () => Promise<Route[]> | Route[];

/**
 * Generated sitemap file structure.
 */
export interface Sitemap {
  /** Approximate XML size in bytes */
  byteSize: number;
  /** Output filename (e.g., 'sitemap.xml') */
  filename: string;
  /** Routes in this sitemap */
  routes: Route[];
}

/**
 * Valid default export from sitemap.ts.
 */
export type SitemapDefaultExport = Route[] | RouteGenerator;

/**
 * Index file referencing multiple sitemaps.
 */
export interface SitemapIndex {
  /** Always 'sitemap-index.xml' */
  filename: string;
  /** References to child sitemaps */
  sitemaps: SitemapReference[];
}

/**
 * Complete sitemap.ts module structure.
 */
export interface SitemapModule {
  [key: string]: Route[] | RouteGenerator | undefined;
  default?: SitemapDefaultExport;
}

/**
 * Named exports from sitemap.ts for multiple sitemaps.
 */
export type SitemapNamedExports = Record<string, Route[] | RouteGenerator>;

/**
 * Reference to a child sitemap in an index.
 */
export interface SitemapReference {
  /** Optional last modified date */
  lastmod?: string;
  /** Absolute URL to sitemap file */
  loc: string;
}
