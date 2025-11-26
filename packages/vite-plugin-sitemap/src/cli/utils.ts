/**
 * CLI utility functions for config loading, logging, and error formatting.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { createServer, type ViteDevServer } from "vite";

import type { PluginOptions } from "../types/config";

import { discoverSitemapFile, formatNotFoundError } from "../core/discovery";
import { loadSitemapFile, type ResolvedRoutes, resolveRoutes } from "../core/loader";

/**
 * CLI logger with colored output.
 */
export const logger = {
  dim(message: string): void {
    console.log(`\x1b[2m${message}\x1b[0m`);
  },
  error(message: string): void {
    console.error(`\x1b[31m✗\x1b[0m ${message}`);
  },
  info(message: string): void {
    console.log(`\x1b[36mℹ\x1b[0m ${message}`);
  },
  success(message: string): void {
    console.log(`\x1b[32m✓\x1b[0m ${message}`);
  },
  warn(message: string): void {
    console.log(`\x1b[33m⚠\x1b[0m ${message}`);
  },
};

/**
 * Find vite.config file in the project.
 */
export function findViteConfig(root: string): null | string {
  const configNames = ["vite.config.ts", "vite.config.js", "vite.config.mts", "vite.config.mjs"];

  for (const name of configNames) {
    const configPath = join(root, name);
    if (existsSync(configPath)) {
      return configPath;
    }
  }

  return null;
}

/**
 * Format bytes as human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format a duration in milliseconds.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Load plugin options from vite.config.
 */
export async function loadPluginOptions(configPath: string): Promise<null | PluginOptions> {
  try {
    // Note: This is a simplified version. In a real implementation,
    // we would use Vite's config loading utilities.
    const module = await import(configPath);
    const config = module.default ?? module;

    // Try to find the sitemap plugin in the plugins array
    if (config.plugins && Array.isArray(config.plugins)) {
      for (const plugin of config.plugins) {
        if (plugin?.name === "vite-plugin-sitemap") {
          // The options would be stored on the plugin instance
          return plugin.__options ?? {};
        }
      }
    }

    return {};
  } catch {
    return null;
  }
}

/**
 * Discover and load routes from sitemap file.
 */
export async function loadRoutesFromSitemap(options: {
  root?: string;
  sitemapFile?: string;
  verbose?: boolean;
}): Promise<null | { routes: ResolvedRoutes[]; server: ViteDevServer }> {
  const root = options.root ?? process.cwd();

  // Discover sitemap file
  const discovery = discoverSitemapFile({
    root,
    ...(options.sitemapFile && { sitemapFile: options.sitemapFile }),
  });

  if (!discovery.found || !discovery.path) {
    logger.error(formatNotFoundError({ root }));
    return null;
  }

  if (options.verbose) {
    logger.info(`Found sitemap file: ${discovery.path}`);
  }

  // Create Vite server for module loading
  const server = await createServer({
    logLevel: "silent",
    root,
    server: { middlewareMode: true },
  });

  try {
    // Load and resolve routes
    const loadResult = await loadSitemapFile(discovery.path, server);
    const routes = await resolveRoutes(loadResult);

    if (routes.length === 0) {
      logger.warn("No routes found in sitemap file.");
      await server.close();
      return null;
    }

    return { routes, server };
  } catch (error) {
    await server.close();
    throw error;
  }
}

/**
 * Print a table of routes summary.
 */
export function printRoutesSummary(routes: ResolvedRoutes[]): void {
  console.log("\nRoutes Summary:");
  console.log("─".repeat(50));

  let totalUrls = 0;

  for (const { name, routes: routeList } of routes) {
    console.log(`  ${name}: ${routeList.length} URLs`);
    totalUrls += routeList.length;
  }

  console.log("─".repeat(50));
  console.log(`  Total: ${totalUrls} URLs`);
}
