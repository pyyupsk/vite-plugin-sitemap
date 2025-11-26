/**
 * Sitemap file loader module.
 * Loads and resolves exports from sitemap configuration files.
 */

import type { ViteDevServer } from "vite";
import type { Route } from "../types/sitemap";

/**
 * Result of loading a sitemap file.
 */
export interface LoadResult {
  /** Default export routes (if any) */
  defaultRoutes: Route[] | (() => Route[] | Promise<Route[]>) | undefined;
  /** Named exports as separate sitemaps */
  namedExports: Map<string, Route[] | (() => Route[] | Promise<Route[]>)>;
  /** All route sources combined */
  allSources: Array<{
    name: string;
    routes: Route[] | (() => Route[] | Promise<Route[]>);
  }>;
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
 * Load a sitemap file using Vite's SSR module loader.
 *
 * @param filePath Absolute path to the sitemap file
 * @param server Vite dev server instance (for ssrLoadModule)
 * @returns Load result with default and named exports
 */
export async function loadSitemapFile(
  filePath: string,
  server: ViteDevServer,
): Promise<LoadResult> {
  // Use Vite's ssrLoadModule for TypeScript support and proper module resolution
  const module = await server.ssrLoadModule(filePath);

  const namedExports = new Map<
    string,
    Route[] | (() => Route[] | Promise<Route[]>)
  >();
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
    defaultRoutes,
    namedExports,
    allSources,
  };
}

/**
 * Load a sitemap file without Vite server (for CLI usage).
 * Uses dynamic import directly.
 *
 * @param filePath Absolute path to the sitemap file
 * @returns Load result with default and named exports
 */
export async function loadSitemapFileDirect(
  filePath: string,
): Promise<LoadResult> {
  // For .ts files, we need tsx or ts-node
  // This function is primarily for compiled JS or when using a runtime with TS support
  const module = await import(filePath);

  const namedExports = new Map<
    string,
    Route[] | (() => Route[] | Promise<Route[]>)
  >();
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
    defaultRoutes,
    namedExports,
    allSources,
  };
}

/**
 * Resolve all routes from a load result.
 * Handles both sync arrays and async functions.
 *
 * @param loadResult Result from loadSitemapFile
 * @returns Array of resolved routes with their names
 */
export async function resolveRoutes(
  loadResult: LoadResult,
): Promise<ResolvedRoutes[]> {
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
 * Resolve a single routes value (array or function).
 */
async function resolveRoutesValue(
  value: Route[] | (() => Route[] | Promise<Route[]>),
): Promise<Route[]> {
  if (typeof value === "function") {
    return await value();
  }
  return value;
}

/**
 * Type guard to check if a value is routes array or a function returning routes.
 */
function isRoutesOrFunction(
  value: unknown,
): value is Route[] | (() => Route[] | Promise<Route[]>) {
  // Check if it's an array
  if (Array.isArray(value)) {
    // Basic check: if empty array or first element has 'url' property
    if (value.length === 0) return true;
    return (
      typeof value[0] === "object" && value[0] !== null && "url" in value[0]
    );
  }

  // Check if it's a function
  if (typeof value === "function") {
    return true;
  }

  return false;
}

/**
 * Get the sitemap filename for a named export.
 *
 * @param name Export name
 * @param index Index for multiple sitemaps with same name
 * @returns Filename like 'sitemap.xml', 'sitemap-pages.xml', etc.
 */
export function getSitemapFilename(name: string, index?: number): string {
  const suffix = index === undefined ? "" : `-${index}`;

  if (name === "default") {
    return `sitemap${suffix}.xml`;
  }

  return `sitemap-${name}${suffix}.xml`;
}

/**
 * Merge multiple route arrays, deduplicating by URL.
 *
 * @param routeArrays Arrays of routes to merge
 * @returns Merged and deduplicated routes
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
