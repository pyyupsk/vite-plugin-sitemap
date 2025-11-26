import type { Route, ChangeFrequency } from "./sitemap";

/**
 * Function to transform routes before XML generation.
 * Return null to exclude the route from the sitemap.
 */
export type RouteTransformer = (
  route: Route,
) => Route | null | Promise<Route | null>;

/**
 * Custom XML serializer function.
 */
export type XmlSerializer = (route: Route) => string;

/**
 * Plugin configuration options.
 */
export interface PluginOptions {
  /**
   * Base URL of the site. Required for relative URL resolution.
   * Example: 'https://example.com'
   */
  hostname?: string;

  /**
   * Path to the sitemap definition file (without extension).
   * @default 'src/sitemap'
   */
  sitemapFile?: string;

  /**
   * Output directory for generated files.
   * @default Vite's build.outDir
   */
  outDir?: string;

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
   * Default change frequency for all routes.
   */
  changefreq?: ChangeFrequency;

  /**
   * Default priority for all routes.
   */
  priority?: number;

  /**
   * Default last modified date for all routes.
   */
  lastmod?: string;

  /**
   * URL patterns to exclude from the sitemap.
   * Supports string patterns and RegExp.
   */
  exclude?: Array<string | RegExp>;

  /**
   * Transform function applied to each route.
   * Return null to exclude the route.
   */
  transform?: RouteTransformer;

  /**
   * Custom XML serialization function.
   */
  serialize?: XmlSerializer;
}

/**
 * Resolved plugin options with defaults applied.
 */
export interface ResolvedPluginOptions {
  hostname: string | undefined;
  sitemapFile: string;
  outDir: string;
  filename: string;
  generateRobotsTxt: boolean;
  changefreq: ChangeFrequency | undefined;
  priority: number | undefined;
  lastmod: string | undefined;
  exclude: Array<string | RegExp>;
  transform: RouteTransformer | undefined;
  serialize: XmlSerializer | undefined;
}

/**
 * Default plugin options.
 */
export const defaultOptions: Omit<ResolvedPluginOptions, "outDir"> = {
  hostname: undefined,
  sitemapFile: "src/sitemap",
  filename: "sitemap.xml",
  generateRobotsTxt: false,
  changefreq: undefined,
  priority: undefined,
  lastmod: undefined,
  exclude: [],
  transform: undefined,
  serialize: undefined,
};

/**
 * Resolve plugin options with defaults.
 */
export function resolveOptions(
  options: PluginOptions,
  outDir: string,
): ResolvedPluginOptions {
  return {
    hostname: options.hostname ?? defaultOptions.hostname,
    sitemapFile: options.sitemapFile ?? defaultOptions.sitemapFile,
    outDir: options.outDir ?? outDir,
    filename: options.filename ?? defaultOptions.filename,
    generateRobotsTxt:
      options.generateRobotsTxt ?? defaultOptions.generateRobotsTxt,
    changefreq: options.changefreq ?? defaultOptions.changefreq,
    priority: options.priority ?? defaultOptions.priority,
    lastmod: options.lastmod ?? defaultOptions.lastmod,
    exclude: options.exclude ?? defaultOptions.exclude,
    transform: options.transform ?? defaultOptions.transform,
    serialize: options.serialize ?? defaultOptions.serialize,
  };
}
