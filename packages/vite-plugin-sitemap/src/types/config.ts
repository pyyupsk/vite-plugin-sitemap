import type { ChangeFrequency, Route } from "./sitemap";

/**
 * Plugin configuration options.
 */
export interface PluginOptions {
  /**
   * Default change frequency for all routes.
   */
  changefreq?: ChangeFrequency;

  /**
   * URL patterns to exclude from the sitemap.
   * Supports string patterns and RegExp.
   */
  exclude?: Array<RegExp | string>;

  /**
   * Name of the output sitemap file.
   * @default 'sitemap.xml'
   */
  filename?: string;

  /**
   * Generate or update robots.txt with Sitemap directive.
   * @default false
   */
  generateRobotsTxt?: boolean;

  /**
   * Base URL of the site. Required for relative URL resolution.
   * Example: 'https://example.com'
   */
  hostname?: string;

  /**
   * Default last modified date for all routes.
   */
  lastmod?: string;

  /**
   * Output directory for generated files.
   * @default Vite's build.outDir
   */
  outDir?: string;

  /**
   * Default priority for all routes.
   */
  priority?: number;

  /**
   * Custom XML serialization function.
   */
  serialize?: XmlSerializer;

  /**
   * Path to the sitemap definition file (without extension).
   * @default 'src/sitemap'
   */
  sitemapFile?: string;

  /**
   * Transform function applied to each route.
   * Return null to exclude the route.
   */
  transform?: RouteTransformer;
}

/**
 * Resolved plugin options with defaults applied.
 */
export interface ResolvedPluginOptions {
  changefreq: ChangeFrequency | undefined;
  exclude: Array<RegExp | string>;
  filename: string;
  generateRobotsTxt: boolean;
  hostname: string | undefined;
  lastmod: string | undefined;
  outDir: string;
  priority: number | undefined;
  serialize: undefined | XmlSerializer;
  sitemapFile: string | undefined;
  transform: RouteTransformer | undefined;
}

/**
 * Function to transform routes before XML generation.
 * Return null to exclude the route from the sitemap.
 */
export type RouteTransformer = (route: Route) => null | Promise<null | Route> | Route;

/**
 * Custom XML serializer function.
 * Receives all routes and returns the complete XML string.
 */
export type XmlSerializer = (routes: Route[]) => Promise<string> | string;

/**
 * Default plugin options.
 */
export const defaultOptions: Omit<ResolvedPluginOptions, "outDir" | "sitemapFile"> & {
  sitemapFile: string | undefined;
} = {
  changefreq: undefined,
  exclude: [],
  filename: "sitemap.xml",
  generateRobotsTxt: false,
  hostname: undefined,
  lastmod: undefined,
  priority: undefined,
  serialize: undefined,
  sitemapFile: undefined, // undefined enables auto-discovery
  transform: undefined,
};

/**
 * Resolve plugin options with defaults.
 */
export function resolveOptions(options: PluginOptions, outDir: string): ResolvedPluginOptions {
  return {
    changefreq: options.changefreq ?? defaultOptions.changefreq,
    exclude: options.exclude ?? defaultOptions.exclude,
    filename: options.filename ?? defaultOptions.filename,
    generateRobotsTxt: options.generateRobotsTxt ?? defaultOptions.generateRobotsTxt,
    hostname: options.hostname ?? defaultOptions.hostname,
    lastmod: options.lastmod ?? defaultOptions.lastmod,
    outDir: options.outDir ?? outDir,
    priority: options.priority ?? defaultOptions.priority,
    serialize: options.serialize ?? defaultOptions.serialize,
    sitemapFile: options.sitemapFile ?? defaultOptions.sitemapFile,
    transform: options.transform ?? defaultOptions.transform,
  };
}
