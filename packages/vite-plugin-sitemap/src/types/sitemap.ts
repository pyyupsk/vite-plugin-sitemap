/**
 * Change frequency values as defined by the sitemap protocol.
 * Indicates how frequently the page is likely to change.
 */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * A single URL entry in the sitemap.
 */
export interface Route {
  /**
   * The URL of the page. Must be an absolute URL with http(s) protocol.
   * Maximum 2,048 characters.
   */
  url: string;

  /**
   * The date the page was last modified.
   * Must be in W3C Datetime format (ISO 8601 subset).
   * Examples: '2025-11-26', '2025-11-26T10:30:00Z'
   */
  lastmod?: string;

  /**
   * How frequently the page is likely to change.
   */
  changefreq?: ChangeFrequency;

  /**
   * The priority of this URL relative to other URLs on your site.
   * Valid values range from 0.0 to 1.0.
   */
  priority?: number;

  /**
   * Images associated with this URL for Google Image sitemap extension.
   * Maximum 1,000 images per URL.
   */
  images?: import("./extensions").Image[];

  /**
   * Videos associated with this URL for Google Video sitemap extension.
   */
  videos?: import("./extensions").Video[];

  /**
   * News article metadata for Google News sitemap extension.
   */
  news?: import("./extensions").News;

  /**
   * Alternate language versions of this URL for hreflang annotations.
   */
  alternates?: import("./extensions").Alternate[];
}

/**
 * Async function that returns routes.
 */
export type RouteGenerator = () => Route[] | Promise<Route[]>;

/**
 * Valid default export from sitemap.ts.
 */
export type SitemapDefaultExport = Route[] | RouteGenerator;

/**
 * Named exports from sitemap.ts for multiple sitemaps.
 */
export type SitemapNamedExports = Record<string, Route[] | RouteGenerator>;

/**
 * Complete sitemap.ts module structure.
 */
export interface SitemapModule {
  default?: SitemapDefaultExport;
  [key: string]: Route[] | RouteGenerator | undefined;
}

/**
 * Generated sitemap file structure.
 */
export interface Sitemap {
  /** Output filename (e.g., 'sitemap.xml') */
  filename: string;
  /** Routes in this sitemap */
  routes: Route[];
  /** Approximate XML size in bytes */
  byteSize: number;
}

/**
 * Reference to a child sitemap in an index.
 */
export interface SitemapReference {
  /** Absolute URL to sitemap file */
  loc: string;
  /** Optional last modified date */
  lastmod?: string;
}

/**
 * Index file referencing multiple sitemaps.
 */
export interface SitemapIndex {
  /** Always 'sitemap-index.xml' */
  filename: string;
  /** References to child sitemaps */
  sitemaps: SitemapReference[];
}
