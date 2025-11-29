/**
 * CLI utility functions for config loading, logging, and error formatting.
 * @module
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import picocolors from "picocolors";
import { createServer, loadConfigFromFile, type ViteDevServer } from "vite";

/**
 * Re-export picocolors for use in CLI commands.
 * Provides terminal color and formatting utilities.
 *
 * @constant
 * @since 0.1.0
 */
export const colors = picocolors;

import type { PluginOptions } from "../types/config";
export { formatBytes } from "../utils/format";

import { discoverSitemapFile, formatNotFoundError } from "../core/discovery";
import { loadSitemapFile, type ResolvedRoutes, resolveRoutes } from "../core/loader";
import { getPluginOptions, PLUGIN_NAME } from "../plugin";

/**
 * CLI logger with colored output.
 * Provides consistent logging methods with appropriate icons and colors.
 *
 * @example
 * logger.info('Processing files...');
 * logger.success('Build complete!');
 * logger.warn('No routes found');
 * logger.error('Build failed');
 * logger.dim('Additional details...');
 *
 * @since 0.1.0
 */
export const logger = {
  /**
   * Log a dimmed message.
   * Used for secondary or less important information.
   *
   * @param {string} message - Message to log
   * @since 0.1.0
   */
  dim(message: string): void {
    console.log(colors.dim(message));
  },

  /**
   * Log an error message with red "✗" prefix.
   * Outputs to stderr.
   *
   * @param {string} message - Error message to log
   * @since 0.1.0
   */
  error(message: string): void {
    console.error(`${colors.red("✗")} ${message}`);
  },

  /**
   * Log an info message with cyan "➜" prefix.
   * Used for general progress information.
   *
   * @param {string} message - Info message to log
   * @since 0.1.0
   */
  info(message: string): void {
    console.log(`${colors.cyan("➜")} ${message}`);
  },

  /**
   * Log a success message with green "✓" prefix.
   * Used for completion notifications.
   *
   * @param {string} message - Success message to log
   * @since 0.1.0
   */
  success(message: string): void {
    console.log(`${colors.green("✓")} ${message}`);
  },

  /**
   * Log a warning message with yellow "⚠" prefix.
   * Used for non-fatal issues that should be addressed.
   *
   * @param {string} message - Warning message to log
   * @since 0.1.0
   */
  warn(message: string): void {
    console.log(`${colors.yellow("⚠")} ${message}`);
  },
};

/**
 * Find vite.config file in the project.
 * Searches for common Vite config file names in priority order.
 *
 * @param {string} root - Project root directory
 * @returns {string | null} Path to config file or null if not found
 *
 * @example
 * const configPath = findViteConfig(process.cwd());
 * if (configPath) {
 *   console.log('Found config:', configPath);
 * }
 *
 * @since 0.1.0
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
 * Converts milliseconds to a human-readable format.
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., '150ms' or '1.23s')
 *
 * @example
 * formatDuration(150); // '150ms'
 * formatDuration(1500); // '1.50s'
 *
 * @since 0.1.0
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Load plugin options from vite.config using Vite's config loader.
 * Finds and extracts the sitemap plugin configuration from vite.config.
 *
 * @param {string} root - Project root directory
 * @returns {Promise<PluginOptions | null>} Plugin options or null if not found
 *
 * @example
 * const options = await loadPluginOptions(process.cwd());
 * if (options?.hostname) {
 *   console.log('Hostname:', options.hostname);
 * }
 *
 * @since 0.1.0
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
 * Handles discovery, loading, and resolution of routes with Vite server.
 *
 * @param {Object} options - Load options
 * @param {string} [options.root] - Project root directory
 * @param {string} [options.sitemapFile] - Custom sitemap file path
 * @param {boolean} [options.verbose] - Enable verbose logging
 * @returns {Promise<Object | null>} Object with routes, server, and options, or null on error
 * @returns {ResolvedRoutes[]} .routes - Resolved routes array
 * @returns {ViteDevServer} .server - Vite dev server instance (must be closed by caller)
 * @returns {PluginOptions | null} .pluginOptions - Plugin options from vite.config
 *
 * @example
 * const result = await loadRoutesFromSitemap({ root: process.cwd(), verbose: true });
 * if (result) {
 *   console.log(`Loaded ${result.routes.length} route sets`);
 *   await result.server.close(); // Don't forget to close!
 * }
 *
 * @since 0.1.0
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
 * Displays a formatted summary of routes grouped by export name.
 *
 * @param {ResolvedRoutes[]} routes - Array of resolved route sets
 *
 * @example
 * const routes = [
 *   { name: 'default', routes: [...] },
 *   { name: 'blog', routes: [...] }
 * ];
 * printRoutesSummary(routes);
 * // Outputs formatted table with route counts
 *
 * @since 0.1.0
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
