/**
 * Vite plugin for sitemap generation.
 * Generates sitemap.xml during build using the closeBundle hook.
 */

import type { Plugin, ResolvedConfig } from "vite";

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
import { formatResultForConsole } from "./validation/errors";

/**
 * Plugin name for identification.
 */
export const PLUGIN_NAME = "vite-plugin-sitemap";

/**
 * Create the Vite sitemap plugin.
 *
 * @param userOptions Plugin options
 * @returns Vite plugin
 */
/**
 * Extended plugin type with options for CLI access.
 */
export interface SitemapPlugin extends Plugin {
  __options: PluginOptions;
}

export function sitemapPlugin(userOptions: PluginOptions = {}): SitemapPlugin {
  let config: ResolvedConfig;
  let resolvedOptions: ReturnType<typeof resolveOptions>;

  return {
    /**
     * Expose plugin options for CLI access.
     */
    __options: userOptions,

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
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      resolvedOptions = resolveOptions(userOptions, config.build.outDir);
    },

    name: PLUGIN_NAME,
  };
}

/**
 * Format bytes as human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Default export for convenience.
 */
export default sitemapPlugin;
