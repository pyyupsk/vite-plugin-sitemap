/**
 * Sitemap file loader module.
 * Loads and resolves exports from sitemap configuration files.
 * @module
 */

import type { ViteDevServer } from "vite";

import type { Route } from "../types/sitemap";

/**
 * Result of loading a sitemap file.
 */
export interface LoadResult {
  /** All route sources combined */
  allSources: Array<{
    name: string;
    routes: (() => Promise<Route[]> | Route[]) | Route[];
  }>;
  /** Default export routes (if any) */
  defaultRoutes: (() => Promise<Route[]> | Route[]) | Route[] | undefined;
  /** Named exports as separate sitemaps */
  namedExports: Map<string, (() => Promise<Route[]> | Route[]) | Route[]>;
}

/**
 * Resolved routes after async resolution.
 */
export interface ResolvedRoutes {
  /** Name of the sitemap (default or named export) */
  name: string;
  /** Resolved routes array */
  routes: Route[];
}

/**
 * Get the sitemap filename for a named export.
 * Generates a standardized filename based on the export name and optional index.
 *
 * @param {string} name - Export name ('default' for main sitemap, or custom name)
 * @param {number} [index] - Optional index for multiple sitemaps with same name
 * @returns {string} Filename like 'sitemap.xml', 'sitemap-pages.xml', etc.
 *
 * @example
 * getSitemapFilename('default'); // 'sitemap.xml'
 * getSitemapFilename('blog'); // 'sitemap-blog.xml'
 * getSitemapFilename('default', 1); // 'sitemap-1.xml'
 *
 * @since 0.1.0
 */
export function getSitemapFilename(name: string, index?: number): string {
  const suffix = index === undefined ? "" : `-${index}`;

  if (name === "default") {
    return `sitemap${suffix}.xml`;
  }

  return `sitemap-${name}${suffix}.xml`;
}

/**
 * Load a sitemap file using Vite's SSR module loader.
 * Uses Vite's ssrLoadModule for TypeScript support and proper module resolution.
 *
 * @param {string} filePath - Absolute path to the sitemap file
 * @param {ViteDevServer} server - Vite dev server instance (for ssrLoadModule)
 * @returns {Promise<LoadResult>} Load result with default and named exports
 *
 * @example
 * const server = await createServer({ server: { middlewareMode: true } });
 * const loadResult = await loadSitemapFile('/path/to/sitemap.ts', server);
 * console.log('Default routes:', loadResult.defaultRoutes);
 * console.log('Named exports:', loadResult.namedExports.size);
 *
 * @since 0.1.0
 */
export async function loadSitemapFile(
  filePath: string,
  server: ViteDevServer,
): Promise<LoadResult> {
  // Use Vite's ssrLoadModule for TypeScript support and proper module resolution
  const module = await server.ssrLoadModule(filePath);

  const namedExports = new Map<string, (() => Promise<Route[]> | Route[]) | Route[]>();
  const allSources: LoadResult["allSources"] = [];

  let defaultRoutes: LoadResult["defaultRoutes"];

  // Process exports
  for (const [key, value] of Object.entries(module)) {
    if (key === "default") {
      // Default export
      if (isRoutesOrFunction(value)) {
        defaultRoutes = value;
        allSources.push({ name: "default", routes: value });
      }
    } else if (isRoutesOrFunction(value)) {
      // Named export (for multiple sitemaps)
      namedExports.set(key, value);
      allSources.push({ name: key, routes: value });
    }
  }

  return {
    allSources,
    defaultRoutes,
    namedExports,
  };
}

/**
 * Load a sitemap file without Vite server (for CLI usage).
 * Uses dynamic import directly. Best suited for compiled JavaScript files
 * or when running with a TypeScript runtime like tsx or ts-node.
 *
 * @param {string} filePath - Absolute path to the sitemap file
 * @returns {Promise<LoadResult>} Load result with default and named exports
 *
 * @example
 * const loadResult = await loadSitemapFileDirect('/path/to/sitemap.js');
 * console.log('All sources:', loadResult.allSources.length);
 *
 * @since 0.1.0
 */
export async function loadSitemapFileDirect(filePath: string): Promise<LoadResult> {
  // For .ts files, we need tsx or ts-node
  // This function is primarily for compiled JS or when using a runtime with TS support
  const module = await import(filePath);

  const namedExports = new Map<string, (() => Promise<Route[]> | Route[]) | Route[]>();
  const allSources: LoadResult["allSources"] = [];

  let defaultRoutes: LoadResult["defaultRoutes"];

  for (const [key, value] of Object.entries(module)) {
    if (key === "default") {
      if (isRoutesOrFunction(value)) {
        defaultRoutes = value;
        allSources.push({ name: "default", routes: value });
      }
    } else if (isRoutesOrFunction(value)) {
      namedExports.set(key, value);
      allSources.push({ name: key, routes: value });
    }
  }

  return {
    allSources,
    defaultRoutes,
    namedExports,
  };
}

/**
 * Merge multiple route arrays, deduplicating by URL.
 * First occurrence wins when duplicate URLs are encountered.
 *
 * @param {...Route[][]} routeArrays - Arrays of routes to merge
 * @returns {Route[]} Merged and deduplicated routes
 *
 * @example
 * const pages = [{ url: 'https://example.com' }, { url: 'https://example.com/about' }];
 * const blog = [{ url: 'https://example.com/blog' }, { url: 'https://example.com' }];
 * const merged = mergeRoutes(pages, blog);
 * // Result: 3 routes (duplicate 'https://example.com' is removed)
 *
 * @since 0.1.0
 */
export function mergeRoutes(...routeArrays: Route[][]): Route[] {
  const seen = new Set<string>();
  const merged: Route[] = [];

  for (const routes of routeArrays) {
    for (const route of routes) {
      if (!seen.has(route.url)) {
        seen.add(route.url);
        merged.push(route);
      }
    }
  }

  return merged;
}

/**
 * Resolve all routes from a load result.
 * Handles both synchronous arrays and async generator functions,
 * invoking functions and awaiting their results as needed.
 *
 * @param {LoadResult} loadResult - Result from loadSitemapFile or loadSitemapFileDirect
 * @returns {Promise<ResolvedRoutes[]>} Array of resolved routes with their export names
 *
 * @example
 * const loadResult = await loadSitemapFile(path, server);
 * const resolved = await resolveRoutes(loadResult);
 * for (const { name, routes } of resolved) {
 *   console.log(`Export '${name}' has ${routes.length} routes`);
 * }
 *
 * @since 0.1.0
 */
export async function resolveRoutes(loadResult: LoadResult): Promise<ResolvedRoutes[]> {
  const resolved: ResolvedRoutes[] = [];

  for (const source of loadResult.allSources) {
    const routes = await resolveRoutesValue(source.routes);
    resolved.push({
      name: source.name,
      routes,
    });
  }

  return resolved;
}

/**
 * Type guard to check if a value is routes array or a function returning routes.
 * Validates that the value is either an array of route objects or a function.
 *
 * @param {unknown} value - Value to check
 * @returns {boolean} True if value is routes array or function returning routes
 *
 * @since 0.1.0
 * @private
 */
function isRoutesOrFunction(value: unknown): value is (() => Promise<Route[]> | Route[]) | Route[] {
  // Check if it's an array
  if (Array.isArray(value)) {
    // Basic check: if empty array or first element has 'url' property
    if (value.length === 0) return true;
    return typeof value[0] === "object" && value[0] !== null && "url" in value[0];
  }

  // Check if it's a function
  if (typeof value === "function") {
    return true;
  }

  return false;
}

/**
 * Resolve a single routes value (array or function).
 * If the value is a function, calls it and awaits the result.
 * If it's already an array, returns it directly.
 *
 * @param {(() => Promise<Route[]> | Route[]) | Route[]} value - Routes value to resolve
 * @returns {Promise<Route[]>} Resolved routes array
 *
 * @since 0.1.0
 * @private
 */
async function resolveRoutesValue(
  value: (() => Promise<Route[]> | Route[]) | Route[],
): Promise<Route[]> {
  if (typeof value === "function") {
    return await value();
  }
  return value;
}
