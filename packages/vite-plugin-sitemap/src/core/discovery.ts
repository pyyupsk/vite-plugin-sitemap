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
 * Result of sitemap file discovery.
 */
export interface DiscoveryResult {
  /** Whether a sitemap file was found */
  found: boolean;
  /** Absolute path to the discovered file */
  path?: string;
  /** Extension of the discovered file */
  extension?: string;
}

/**
 * Options for sitemap file discovery.
 */
export interface DiscoveryOptions {
  /** Root directory of the project (defaults to process.cwd()) */
  root?: string;
  /** Source directory to search in (defaults to 'src') */
  srcDir?: string;
  /** Custom sitemap file path (overrides automatic discovery) */
  sitemapFile?: string;
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
export function discoverSitemapFile(
  options: DiscoveryOptions = {},
): DiscoveryResult {
  const root = options.root ?? process.cwd();
  const srcDir = options.srcDir ?? DEFAULT_SRC_DIR;

  // If custom path provided, check if it exists
  if (options.sitemapFile) {
    const customPath = resolve(root, options.sitemapFile);
    if (existsSync(customPath)) {
      const ext = getExtension(customPath);
      return {
        found: true,
        path: customPath,
        extension: ext,
      };
    }
    return { found: false };
  }

  // Search in src directory first
  const srcResult = searchInDirectory(join(root, srcDir));
  if (srcResult.found) {
    return srcResult;
  }

  // Fall back to root directory
  return searchInDirectory(root);
}

/**
 * Search for sitemap file in a specific directory.
 */
function searchInDirectory(directory: string): DiscoveryResult {
  for (const ext of SITEMAP_EXTENSIONS) {
    const filePath = join(directory, `${SITEMAP_FILENAME}${ext}`);
    if (existsSync(filePath)) {
      return {
        found: true,
        path: filePath,
        extension: ext,
      };
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
