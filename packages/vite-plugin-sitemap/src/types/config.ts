/**
 * Plugin configuration type definitions.
 * @module
 */

import type { ChangeFrequency, Route } from "./sitemap";

/**
 * Plugin configuration options.
 *
 * @interface PluginOptions
 * @since 0.1.0
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
 *
 * @interface ResolvedPluginOptions
 * @since 0.1.0
 */
export interface ResolvedPluginOptions {
  /**
   * Default change frequency for all routes.
   */
  changefreq: ChangeFrequency | undefined;
  /**
   * URL patterns to exclude from the sitemap.
   */
  exclude: Array<RegExp | string>;
  /**
   * Name of the output sitemap file.
   */
  filename: string;
  /**
   * Whether to generate or update robots.txt.
   */
  generateRobotsTxt: boolean;
  /**
   * Base URL of the site.
   */
  hostname: string | undefined;
  /**
   * Default last modified date for all routes.
   */
  lastmod: string | undefined;
  /**
   * Output directory for generated files.
   */
  outDir: string;
  /**
   * Default priority for all routes.
   */
  priority: number | undefined;
  /**
   * Custom XML serialization function.
   */
  serialize: undefined | XmlSerializer;
  /**
   * Path to the sitemap definition file.
   */
  sitemapFile: string | undefined;
  /**
   * Transform function applied to each route.
   */
  transform: RouteTransformer | undefined;
}

/**
 * Function to transform routes before XML generation.
 * Return null to exclude the route from the sitemap.
 *
 * @callback RouteTransformer
 * @param {Route} route - Route to transform
 * @returns {Route | null | Promise<Route | null>} Transformed route, null to exclude, or promise
 * @since 0.1.0
 */
export type RouteTransformer = (route: Route) => null | Promise<null | Route> | Route;

/**
 * Custom XML serializer function.
 * Receives all routes and returns the complete XML string.
 *
 * @callback XmlSerializer
 * @param {Route[]} routes - Array of routes to serialize
 * @returns {string | Promise<string>} Complete XML string or promise
 * @since 0.1.0
 */
export type XmlSerializer = (routes: Route[]) => Promise<string> | string;

/**
 * Default plugin options.
 * Used when user doesn't provide specific configuration values.
 *
 * @constant
 * @since 0.1.0
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
 * Merges user-provided options with default values to create a fully resolved configuration.
 *
 * @param {PluginOptions} options - User-provided plugin options
 * @param {string} outDir - Default output directory (typically from Vite's build.outDir)
 * @returns {ResolvedPluginOptions} Fully resolved options with all defaults applied
 *
 * @example
 * const userOptions = { hostname: 'https://example.com', generateRobotsTxt: true };
 * const resolved = resolveOptions(userOptions, 'dist');
 * console.log(resolved.filename); // 'sitemap.xml' (default)
 * console.log(resolved.hostname); // 'https://example.com'
 *
 * @since 0.1.0
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
