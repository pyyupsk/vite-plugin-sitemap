/**
 * Sitemap file discovery module.
 * Discovers sitemap configuration files in the project source directory.
 * @module
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Supported sitemap file extensions in priority order.
 * TypeScript files are preferred, followed by JavaScript variants.
 *
 * @constant {readonly string[]}
 * @since 0.1.0
 */
export const SITEMAP_EXTENSIONS = [".ts", ".js", ".mts", ".mjs"] as const;

/**
 * Default sitemap file name (without extension).
 * Used when searching for sitemap configuration files.
 *
 * @constant {string}
 * @since 0.1.0
 */
export const SITEMAP_FILENAME = "sitemap";

/**
 * Default source directory to search for sitemap files.
 * Sitemap files are first searched in this directory before falling back to root.
 *
 * @constant {string}
 * @since 0.1.0
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
 * Type for existsSync function.
 * Allows injection of custom file existence checking for testing.
 *
 * @callback ExistsSyncFn
 * @param {string} _path - Path to check for existence
 * @returns {boolean} True if the path exists
 * @since 0.1.0
 * @private
 */
type ExistsSyncFn = (_path: string) => boolean;

/**
 * Type for resolve function.
 * Allows injection of custom path resolution for testing.
 *
 * @callback ResolveFn
 * @param {...string} _paths - Path segments to resolve
 * @returns {string} Resolved absolute path
 * @since 0.1.0
 * @private
 */
type ResolveFn = (..._paths: string[]) => string;

/**
 * Discover the sitemap configuration file.
 * Searches for sitemap files in standard locations with configurable options.
 *
 * Search order:
 * 1. If sitemapFile option is provided, use that path directly
 * 2. Search in srcDir for sitemap.{ts,js,mts,mjs}
 * 3. Search in root for sitemap.{ts,js,mts,mjs}
 *
 * @param {DiscoveryOptions} [options={}] - Discovery options
 * @returns {DiscoveryResult} Discovery result with found status and path
 *
 * @example
 * const result = discoverSitemapFile({ root: '/path/to/project' });
 * if (result.found) {
 *   console.log('Found sitemap at:', result.path);
 * }
 *
 * @since 0.1.0
 */
export function discoverSitemapFile(options: DiscoveryOptions = {}): DiscoveryResult {
  return discoverSitemapFileWithFs(existsSync, resolve, options);
}

/**
 * Discover the sitemap configuration file with injected fs functions.
 * This version allows passing custom existsSync and resolve functions,
 * which is useful for avoiding module caching issues in build contexts.
 *
 * @param {ExistsSyncFn} existsSyncFn - Function to check if a path exists
 * @param {ResolveFn} resolveFn - Function to resolve paths
 * @param {DiscoveryOptions} [options={}] - Discovery options
 * @returns {DiscoveryResult} Discovery result with found status and path
 *
 * @example
 * import { existsSync } from 'node:fs';
 * import { resolve } from 'node:path';
 *
 * const result = discoverSitemapFileWithFs(existsSync, resolve, { root: '/project' });
 *
 * @since 0.1.0
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
 * Provides guidance on where to create a sitemap file and shows the paths that were searched.
 *
 * @param {DiscoveryOptions} [options={}] - Discovery options used during the search
 * @returns {string} Formatted error message with instructions
 *
 * @example
 * const result = discoverSitemapFile({ root: '/project' });
 * if (!result.found) {
 *   console.error(formatNotFoundError({ root: '/project' }));
 * }
 *
 * @since 0.1.0
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
 * Generates a list of all paths that would be searched during discovery.
 * Useful for error messages showing where we searched.
 *
 * @param {DiscoveryOptions} [options={}] - Discovery options
 * @returns {string[]} Array of absolute paths that would be searched
 *
 * @example
 * const paths = getPossiblePaths({ root: '/project' });
 * // Returns: ['/project/src/sitemap.ts', '/project/src/sitemap.js', ...]
 *
 * @since 0.1.0
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
 * This duplicates the discovery logic but uses dynamically imported fs functions,
 * which prevents stale module state during Vite builds.
 *
 * @param {string} root - Project root directory
 * @param {string | undefined} sitemapFile - Optional custom sitemap file path
 * @param {function} existsSyncFn - Function to check if a path exists
 * @param {function} resolveFn - Function to resolve paths
 * @returns {Promise<{ extension?: string, found: boolean, path?: string }>} Discovery result
 *
 * @example
 * const { existsSync } = await import('node:fs');
 * const { resolve } = await import('node:path');
 * const result = await inlineDiscoverSitemapFile(root, undefined, existsSync, resolve);
 *
 * @since 0.1.0
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
 * Extracts the file extension including the dot (e.g., '.ts', '.js').
 *
 * @param {string} filePath - Path to extract extension from
 * @returns {string} File extension with dot, or empty string if none found
 *
 * @example
 * getExtension('/path/to/sitemap.ts'); // Returns '.ts'
 * getExtension('/path/to/file'); // Returns ''
 *
 * @since 0.1.0
 * @private
 */
function getExtension(filePath: string): string {
  const match = new RegExp(/\.[^.]+$/).exec(filePath);
  return match ? match[0] : "";
}

/**
 * Search for sitemap file in a specific directory with injected existsSync function.
 * Tries each supported extension in priority order.
 *
 * @param {string} directory - Directory to search in
 * @param {ExistsSyncFn} existsSyncFn - Function to check if file exists
 * @returns {DiscoveryResult} Discovery result with found status and path
 *
 * @since 0.1.0
 * @private
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
