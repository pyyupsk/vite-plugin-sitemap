/**
 * Vite plugin for sitemap generation.
 * Generates sitemap.xml during build using the closeBundle hook.
 * @module
 */

import type { ResolvedConfig, ViteDevServer } from "vite";

import { mkdir, writeFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import pc from "picocolors";

import type { PluginOptions } from "./types/config";

import { formatNotFoundError, inlineDiscoverSitemapFile } from "./core/discovery";
import { generateSitemap } from "./core/generator";
import { getSitemapFilename, loadSitemapFile, resolveRoutes } from "./core/loader";
import { buildSitemapUrl, updateRobotsTxt } from "./core/robots";
import { getSitemapIndexFilename } from "./core/splitter";
import { resolveOptions } from "./types/config";
import { formatBytes } from "./utils/format";
import { formatResultForConsole } from "./validation/errors";

/**
 * Plugin name for identification.
 * Used for Vite plugin registry and debugging.
 *
 * @constant {string}
 * @since 0.1.0
 */
export const PLUGIN_NAME = "vite-plugin-sitemap";

/**
 * Symbol key for storing plugin options.
 * Uses Symbol.for() to ensure the same symbol is used across module boundaries
 * (e.g., when CLI loads vite.config.ts in a separate context).
 *
 * @constant {symbol}
 * @since 0.1.0
 * @private
 */
const PLUGIN_OPTIONS_KEY = Symbol.for("vite-plugin-sitemap:options");

/**
 * Vite plugin return type without exposing Vite's internal types.
 * This prevents type conflicts when users have different Vite versions.
 *
 * @interface SitemapPlugin
 * @since 0.3.0
 */
export interface SitemapPlugin {
  /**
   * Called after the bundle is fully generated.
   * Generates sitemap files at this point.
   *
   * @since 0.1.0
   */
  closeBundle: () => Promise<void>;
  /**
   * Called when Vite config is resolved.
   * Stores resolved config for later use.
   *
   * @since 0.1.0
   */
  // eslint-disable-next-line no-unused-vars
  configResolved: (resolvedConfig: unknown) => void;
  /**
   * Called to configure the dev server.
   * Sets up middleware for serving sitemaps in dev mode.
   *
   * @since 0.2.0
   */
  // eslint-disable-next-line no-unused-vars
  configureServer: (server: unknown) => void;
  /**
   * Plugin name for identification.
   */
  name: string;
}

/**
 * Get plugin options from a plugin instance.
 * Used by CLI to read config from vite.config.ts.
 *
 * @param {unknown} plugin - Plugin instance
 * @returns {PluginOptions | undefined} Plugin options or undefined
 *
 * @example
 * const config = await loadConfigFromFile(...);
 * const sitemapPlugin = config.plugins.find(p => p.name === 'vite-plugin-sitemap');
 * const options = getPluginOptions(sitemapPlugin);
 *
 * @since 0.1.0
 */
export function getPluginOptions(plugin: unknown): PluginOptions | undefined {
  if (plugin && typeof plugin === "object" && PLUGIN_OPTIONS_KEY in plugin) {
    return (plugin as Record<symbol, PluginOptions>)[PLUGIN_OPTIONS_KEY];
  }
  return undefined;
}

/**
 * Create the Vite sitemap plugin.
 * Main plugin factory function that integrates sitemap generation into Vite builds.
 *
 * @param {PluginOptions} [userOptions={}] - Plugin configuration options
 * @returns {SitemapPlugin} Configured Vite plugin instance
 *
 * @example
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import sitemap from '@pyyupsk/vite-plugin-sitemap';
 *
 * export default defineConfig({
 *   plugins: [
 *     sitemap({
 *       hostname: 'https://example.com',
 *       generateRobotsTxt: true
 *     })
 *   ]
 * });
 *
 * @since 0.1.0
 */
export function sitemapPlugin(userOptions: PluginOptions = {}): SitemapPlugin {
  let config: ResolvedConfig;
  let resolvedOptions: ReturnType<typeof resolveOptions>;

  const plugin = {
    // Generate sitemap after build completes
    async closeBundle() {
      // Only run in build mode
      if (config.command !== "build") {
        return;
      }

      const startTime = Date.now();
      const logger = config.logger;

      logger.info(`${pc.green("generating sitemap...")}`);

      try {
        // Step 1: Discover sitemap file
        // Use dynamic import to avoid module caching issues in Vite build context
        const { existsSync } = await import("node:fs");
        const { resolve: pathResolve } = await import("node:path");

        // Inline discovery to avoid module caching issues
        const discovery = await inlineDiscoverSitemapFile(
          config.root,
          resolvedOptions.sitemapFile,
          existsSync,
          pathResolve,
        );

        if (!discovery.found || !discovery.path) {
          logger.warn(`${pc.yellow("⚠")} ${formatNotFoundError({ root: config.root })}`);
          return;
        }

        logger.info(`${pc.dim("found")} ${pc.cyan(discovery.path)}`);

        // Step 2: Create a temporary dev server for ssrLoadModule
        // This allows TypeScript file loading during build
        const { createServer } = await import("vite");
        const tempServer = await createServer({
          logLevel: "silent",
          root: config.root,
          server: { middlewareMode: true },
        });

        try {
          // Step 3: Load and resolve routes
          const loadResult = await loadSitemapFile(discovery.path, tempServer);
          const resolvedRoutes = await resolveRoutes(loadResult);

          if (resolvedRoutes.length === 0) {
            logger.warn(
              `${pc.yellow("⚠")} No routes found in sitemap file. Ensure your sitemap.ts exports routes.`,
            );
            return;
          }

          // Step 4: Generate sitemaps
          const outDir = resolvedOptions.outDir;
          const outputDir = isAbsolute(outDir) ? outDir : join(config.root, outDir);

          // Ensure output directory exists
          await mkdir(outputDir, { recursive: true });

          let totalRoutes = 0;
          let totalFiles = 0;

          for (const { name, routes } of resolvedRoutes) {
            const baseFilename = name === "default" ? "sitemap" : `sitemap-${name}`;
            const result = await generateSitemap(routes, {
              baseFilename,
              enableSplitting: true,
              hostname: resolvedOptions.hostname,
              pluginOptions: resolvedOptions,
            });

            if (!result.success) {
              logger.error(
                `${pc.red("✗")} Validation failed for ${pc.cyan(name)}:\n${formatResultForConsole(result.validation)}`,
              );
              continue;
            }

            // Handle split sitemaps
            if (result.splitResult?.wasSplit) {
              // Write all sitemap chunks
              for (const chunk of result.splitResult.sitemaps) {
                const outputPath = join(outputDir, chunk.filename);
                await writeFile(outputPath, chunk.xml, "utf-8");
                totalFiles++;

                logger.info(
                  `${pc.cyan(chunk.filename)} ${pc.dim(`(${chunk.routes.length} URLs, ${formatBytes(chunk.byteSize)})`)}`,
                );
              }

              // Write sitemap index
              const indexFilename = getSitemapIndexFilename(baseFilename);
              const indexPath = join(outputDir, indexFilename);
              await writeFile(indexPath, result.splitResult.indexXml!, "utf-8");
              totalFiles++;

              logger.info(
                `${pc.cyan(indexFilename)} ${pc.dim(`(index for ${result.splitResult.sitemaps.length} sitemaps)`)}`,
              );

              totalRoutes += result.routeCount ?? 0;
            } else {
              // Single sitemap file
              const filename = resolvedOptions.filename ?? getSitemapFilename(name);
              const outputPath = join(outputDir, filename);

              await writeFile(outputPath, result.xml!, "utf-8");

              totalRoutes += result.routeCount ?? 0;
              totalFiles++;

              logger.info(
                `${pc.cyan(filename)} ${pc.dim(`(${result.routeCount} URLs, ${formatBytes(result.byteSize ?? 0)})`)}`,
              );
            }

            // Log warnings if any
            if (result.warnings.length > 0) {
              for (const warning of result.warnings) {
                logger.warn(`${pc.yellow("⚠")} ${warning}`);
              }
            }
          }

          // Step 5: Generate robots.txt if enabled
          if (resolvedOptions.generateRobotsTxt && resolvedOptions.hostname) {
            // Determine the primary sitemap filename to reference
            // Use sitemap-index.xml if we have multiple sitemaps, otherwise sitemap.xml
            const primarySitemapFilename =
              totalFiles > 1 ? "sitemap-index.xml" : resolvedOptions.filename;

            const sitemapUrl = buildSitemapUrl(resolvedOptions.hostname, primarySitemapFilename);

            const robotsResult = await updateRobotsTxt(outputDir, sitemapUrl);

            if (robotsResult.success) {
              if (robotsResult.action === "created") {
                logger.info(`${pc.cyan("robots.txt")} ${pc.dim("created with Sitemap directive")}`);
              } else if (robotsResult.action === "updated") {
                logger.info(`${pc.cyan("robots.txt")} ${pc.dim("updated with Sitemap directive")}`);
              }
              // No log for 'unchanged' - sitemap directive already exists
            } else {
              logger.warn(`${pc.yellow("⚠")} ${robotsResult.error}`);
            }
          } else if (resolvedOptions.generateRobotsTxt && !resolvedOptions.hostname) {
            logger.warn(
              `${pc.yellow("⚠")} Cannot generate robots.txt: hostname option is required`,
            );
          }

          const elapsed = Date.now() - startTime;
          logger.info(
            `${pc.green("✓")} ${pc.bold(String(totalFiles))} sitemap(s) with ${pc.bold(String(totalRoutes))} URLs ${pc.dim(`in ${pc.reset(pc.bold(`${elapsed}ms`))}`)}`,
          );
        } finally {
          // Clean up temporary server
          await tempServer.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${pc.red("✗")} Failed to generate sitemap: ${message}`);

        if (error instanceof Error && error.stack) {
          logger.error(pc.dim(error.stack));
        }
      }
    },

    // Store resolved config and resolve options with build.outDir
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configResolved(resolvedConfig: any) {
      config = resolvedConfig as ResolvedConfig;
      resolvedOptions = resolveOptions(userOptions, config.build.outDir);
    },

    // Serve sitemap.xml and robots.txt in dev mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      const viteServer = server as ViteDevServer;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url ?? "";

        // Handle robots.txt
        if (url === "/robots.txt" && resolvedOptions.generateRobotsTxt) {
          const hostname = resolvedOptions.hostname;
          if (hostname) {
            const sitemapUrl = buildSitemapUrl(hostname, resolvedOptions.filename);
            res.setHeader("Content-Type", "text/plain");
            res.end(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`);
            return;
          }
          return next();
        }

        // Only handle sitemap requests
        if (!url.startsWith("/sitemap") || !url.endsWith(".xml")) {
          return next();
        }

        try {
          // Discover sitemap file
          const { existsSync } = await import("node:fs");
          const { resolve: pathResolve } = await import("node:path");

          const discovery = await inlineDiscoverSitemapFile(
            config.root,
            resolvedOptions.sitemapFile,
            existsSync,
            pathResolve,
          );

          if (!discovery.found || !discovery.path) {
            return next();
          }

          // Load and resolve routes
          const loadResult = await loadSitemapFile(discovery.path, viteServer);
          const resolvedRoutes = await resolveRoutes(loadResult);

          if (resolvedRoutes.length === 0) {
            return next();
          }

          // Determine which sitemap to serve based on URL
          const requestedFile = url.slice(1); // Remove leading /

          for (const { name, routes } of resolvedRoutes) {
            const baseFilename = name === "default" ? "sitemap" : `sitemap-${name}`;
            const result = await generateSitemap(routes, {
              baseFilename,
              enableSplitting: true,
              hostname: resolvedOptions.hostname,
              pluginOptions: resolvedOptions,
            });

            if (!result.success) {
              continue;
            }

            // Check if this is a split sitemap request
            if (result.splitResult?.wasSplit) {
              // Check for sitemap index
              const indexFilename = getSitemapIndexFilename(baseFilename);
              if (requestedFile === indexFilename) {
                res.setHeader("Content-Type", "application/xml");
                res.end(result.splitResult.indexXml);
                return;
              }

              // Check for individual sitemap chunks
              for (const chunk of result.splitResult.sitemaps) {
                if (requestedFile === chunk.filename) {
                  res.setHeader("Content-Type", "application/xml");
                  res.end(chunk.xml);
                  return;
                }
              }
            } else {
              // Single sitemap file
              const filename = resolvedOptions.filename ?? getSitemapFilename(name);
              if (requestedFile === filename) {
                res.setHeader("Content-Type", "application/xml");
                res.end(result.xml);
                return;
              }
            }
          }

          // No matching sitemap found
          next();
        } catch (error) {
          config.logger.error(
            `${pc.red("✗")} Failed to generate sitemap: ${error instanceof Error ? error.message : String(error)}`,
          );
          next();
        }
      });
    },

    name: PLUGIN_NAME,

    // Store options for CLI access using a symbol key
    // Symbol.for ensures the same key is used across module boundaries
    [PLUGIN_OPTIONS_KEY]: userOptions,
  };

  return plugin;
}

/**
 * Default export for convenience.
 * Allows importing as `import sitemap from '@pyyupsk/vite-plugin-sitemap'`.
 *
 * @see {@link sitemapPlugin}
 * @since 0.1.0
 */
export default sitemapPlugin;
