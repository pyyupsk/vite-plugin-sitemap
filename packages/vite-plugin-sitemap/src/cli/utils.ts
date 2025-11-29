/**
 * CLI utility functions for config loading, logging, and error formatting.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import picocolors from "picocolors";
import { createServer, loadConfigFromFile, type ViteDevServer } from "vite";

/**
 * Re-export picocolors for use in CLI commands.
 */
export const colors = picocolors;

import type { PluginOptions } from "../types/config";
export { formatBytes } from "../utils/format";

import { discoverSitemapFile, formatNotFoundError } from "../core/discovery";
import { loadSitemapFile, type ResolvedRoutes, resolveRoutes } from "../core/loader";
import { getPluginOptions, PLUGIN_NAME } from "../plugin";

/**
 * CLI logger with colored output.
 */
export const logger = {
  dim(message: string): void {
    console.log(colors.dim(message));
  },
  error(message: string): void {
    console.error(`${colors.red("✗")} ${message}`);
  },
  info(message: string): void {
    console.log(`${colors.cyan("➜")} ${message}`);
  },
  success(message: string): void {
    console.log(`${colors.green("✓")} ${message}`);
  },
  warn(message: string): void {
    console.log(`${colors.yellow("⚠")} ${message}`);
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
 * Format a duration in milliseconds.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Load plugin options from vite.config using Vite's config loader.
 */
export async function loadPluginOptions(root: string): Promise<null | PluginOptions> {
  try {
    const configResult = await loadConfigFromFile(
      { command: "build", mode: "production" },
      undefined,
      root,
    );

    if (!configResult?.config.plugins) {
      return null;
    }

    // Flatten plugins array (handles nested arrays from plugin presets)
    const plugins = configResult.config.plugins.flat(2);

    // Try to find the sitemap plugin in the plugins array
    for (const plugin of plugins) {
      if (plugin && typeof plugin === "object" && "name" in plugin && plugin.name === PLUGIN_NAME) {
        return getPluginOptions(plugin) ?? {};
      }
    }

    return null;
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
}): Promise<null | {
  pluginOptions: null | PluginOptions;
  routes: ResolvedRoutes[];
  server: ViteDevServer;
}> {
  const root = options.root ?? process.cwd();

  // Load plugin options from vite.config
  const pluginOptions = await loadPluginOptions(root);

  if (options.verbose && pluginOptions) {
    logger.info("Loaded plugin options from vite.config");
  }

  // Discover sitemap file
  const discovery = discoverSitemapFile({
    root,
    ...(options.sitemapFile && { sitemapFile: options.sitemapFile }),
    ...(pluginOptions?.sitemapFile &&
      !options.sitemapFile && { sitemapFile: pluginOptions.sitemapFile }),
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

    return { pluginOptions, routes, server };
  } catch (error) {
    await server.close();
    throw error;
  }
}

/**
 * Print a table of routes summary.
 */
export function printRoutesSummary(routes: ResolvedRoutes[]): void {
  console.log(`\n${colors.bold("Routes Summary:")}`);
  console.log(colors.dim("─".repeat(50)));

  let totalUrls = 0;

  for (const { name, routes: routeList } of routes) {
    console.log(`  ${colors.cyan(name)}: ${colors.bold(String(routeList.length))} URLs`);
    totalUrls += routeList.length;
  }

  console.log(colors.dim("─".repeat(50)));
  console.log(`  ${colors.bold("Total")}: ${colors.green(colors.bold(String(totalUrls)))} URLs`);
}
