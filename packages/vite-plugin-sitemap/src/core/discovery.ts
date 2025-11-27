/**
 * Sitemap file discovery module.
 * Discovers sitemap configuration files in the project source directory.
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Supported sitemap file extensions in priority order.
 */
export const SITEMAP_EXTENSIONS = [".ts", ".js", ".mts", ".mjs"] as const;

/**
 * Default sitemap file name (without extension).
 */
export const SITEMAP_FILENAME = "sitemap";

/**
 * Default source directory to search for sitemap files.
 */
export const DEFAULT_SRC_DIR = "src";

/**
 * Options for sitemap file discovery.
 */
export interface DiscoveryOptions {
  /** Root directory of the project (defaults to process.cwd()) */
  root?: string;
  /** Custom sitemap file path (overrides automatic discovery) */
  sitemapFile?: string;
  /** Source directory to search in (defaults to 'src') */
  srcDir?: string;
}

/**
 * Result of sitemap file discovery.
 */
export interface DiscoveryResult {
  /** Extension of the discovered file */
  extension?: string;
  /** Whether a sitemap file was found */
  found: boolean;
  /** Absolute path to the discovered file */
  path?: string;
}

/**
 * Discover the sitemap configuration file.
 *
 * Search order:
 * 1. If sitemapFile option is provided, use that path directly
 * 2. Search in srcDir for sitemap.{ts,js,mts,mjs}
 * 3. Search in root for sitemap.{ts,js,mts,mjs}
 *
 * @param options Discovery options
 * @returns Discovery result with found status and path
 */
/**
 * Type for existsSync function.
 */
type ExistsSyncFn = (_path: string) => boolean;

/**
 * Type for resolve function.
 */
type ResolveFn = (..._paths: string[]) => string;

export function discoverSitemapFile(options: DiscoveryOptions = {}): DiscoveryResult {
  return discoverSitemapFileWithFs(existsSync, resolve, options);
}

/**
 * Discover the sitemap configuration file with injected fs functions.
 * This version allows passing custom existsSync and resolve functions,
 * which is useful for avoiding module caching issues in build contexts.
 *
 * @param options Discovery options
 * @param existsSyncFn Function to check if a path exists
 * @param resolveFn Function to resolve paths
 * @returns Discovery result with found status and path
 */
export function discoverSitemapFileWithFs(
  existsSyncFn: ExistsSyncFn,
  resolveFn: ResolveFn,
  options: DiscoveryOptions = {},
): DiscoveryResult {
  const root = options.root ?? process.cwd();
  const srcDir = options.srcDir ?? DEFAULT_SRC_DIR;

  // If custom path provided, check if it exists
  if (options.sitemapFile) {
    const customPath = resolveFn(root, options.sitemapFile);
    if (existsSyncFn(customPath)) {
      const ext = getExtension(customPath);
      return {
        extension: ext,
        found: true,
        path: customPath,
      };
    }
    return { found: false };
  }

  // Search in src directory first
  const srcResult = searchInDirectoryWithFs(join(root, srcDir), existsSyncFn);
  if (srcResult.found) {
    return srcResult;
  }

  // Fall back to root directory
  return searchInDirectoryWithFs(root, existsSyncFn);
}

/**
 * Format a helpful error message when no sitemap file is found.
 */
export function formatNotFoundError(options: DiscoveryOptions = {}): string {
  const paths = getPossiblePaths(options);
  const srcDir = options.srcDir ?? DEFAULT_SRC_DIR;

  return `No sitemap file found. Expected one of:
  - ${srcDir}/${SITEMAP_FILENAME}.ts (recommended)
  - ${srcDir}/${SITEMAP_FILENAME}.js
  - ${srcDir}/${SITEMAP_FILENAME}.mts
  - ${srcDir}/${SITEMAP_FILENAME}.mjs
  - ${SITEMAP_FILENAME}.ts (in project root)

Create a sitemap file to define your routes:

  // ${srcDir}/${SITEMAP_FILENAME}.ts
  import type { Route } from '@pyyupsk/vite-plugin-sitemap';

  export default [
    { url: 'https://example.com/' },
    { url: 'https://example.com/about' },
  ] satisfies Route[];

Searched paths:
${paths.map((p) => `  - ${p}`).join("\n")}`;
}

/**
 * Get all possible sitemap file paths for a given root.
 * Useful for error messages showing where we searched.
 */
export function getPossiblePaths(options: DiscoveryOptions = {}): string[] {
  const root = options.root ?? process.cwd();
  const srcDir = options.srcDir ?? DEFAULT_SRC_DIR;
  const paths: string[] = [];

  // Add src directory paths
  for (const ext of SITEMAP_EXTENSIONS) {
    paths.push(join(root, srcDir, `${SITEMAP_FILENAME}${ext}`));
  }

  // Add root directory paths
  for (const ext of SITEMAP_EXTENSIONS) {
    paths.push(join(root, `${SITEMAP_FILENAME}${ext}`));
  }

  return paths;
}

/**
 * Inline discovery function to avoid module caching issues in Vite build context.
 * This duplicates the logic from core/discovery.ts but uses dynamically imported fs functions.
 */
export async function inlineDiscoverSitemapFile(
  root: string,
  sitemapFile: string | undefined,
  existsSyncFn: (_path: string) => boolean,
  resolveFn: (..._paths: string[]) => string,
): Promise<{ extension?: string; found: boolean; path?: string }> {
  // If custom path provided, check if it exists
  if (sitemapFile) {
    const customPath = resolveFn(root, sitemapFile);
    if (existsSyncFn(customPath)) {
      const ext = new RegExp(/\.[^.]+$/).exec(customPath)?.[0] ?? "";
      return { extension: ext, found: true, path: customPath };
    }
    return { found: false };
  }

  // Search in src directory first
  const srcDir = join(root, DEFAULT_SRC_DIR);
  for (const ext of SITEMAP_EXTENSIONS) {
    const filePath = join(srcDir, `${SITEMAP_FILENAME}${ext}`);
    if (existsSyncFn(filePath)) {
      return { extension: ext, found: true, path: filePath };
    }
  }

  // Fall back to root directory
  for (const ext of SITEMAP_EXTENSIONS) {
    const filePath = join(root, `${SITEMAP_FILENAME}${ext}`);
    if (existsSyncFn(filePath)) {
      return { extension: ext, found: true, path: filePath };
    }
  }

  return { found: false };
}

/**
 * Get file extension from path.
 */
function getExtension(filePath: string): string {
  const match = new RegExp(/\.[^.]+$/).exec(filePath);
  return match ? match[0] : "";
}

/**
 * Search for sitemap file in a specific directory with injected existsSync function.
 */
function searchInDirectoryWithFs(directory: string, existsSyncFn: ExistsSyncFn): DiscoveryResult {
  for (const ext of SITEMAP_EXTENSIONS) {
    const filePath = join(directory, `${SITEMAP_FILENAME}${ext}`);
    if (existsSyncFn(filePath)) {
      return {
        extension: ext,
        found: true,
        path: filePath,
      };
    }
  }
  return { found: false };
}
