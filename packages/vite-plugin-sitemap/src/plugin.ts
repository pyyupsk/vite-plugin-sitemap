/**
 * Vite plugin for sitemap generation.
 * Generates sitemap.xml during build using the closeBundle hook.
 *
 * @module
 */

import type { ResolvedConfig, ViteDevServer } from "vite";

import { mkdir, writeFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import pc from "picocolors";

import type { GenerationResult } from "./core/generator";
import type { PluginOptions, ResolvedPluginOptions } from "./types/config";
import type { Route } from "./types/sitemap";

import { formatNotFoundError, inlineDiscoverSitemapFile } from "./core/discovery";
import { generateSitemap } from "./core/generator";
import { getSitemapFilename, loadSitemapFile, resolveRoutes } from "./core/loader";
import { buildSitemapUrl, updateRobotsTxt } from "./core/robots";
import { getSitemapIndexFilename } from "./core/splitter";
import { resolveOptions } from "./types/config";
import { formatBytes } from "./utils/format";
import { formatResultForConsole } from "./validation/errors";

/**
 * Context for sitemap generation during build.
 */
interface BuildContext {
  logger: SitemapLogger;
  outputDir: string;
  resolvedOptions: ResolvedPluginOptions;
}

/**
 * Response helpers for dev server.
 */
interface DevResponse {
  end: (_data: string) => void;
  setHeader: (_name: string, _value: string) => void;
}

/**
 * Result of processing all route sets.
 */
interface ProcessRoutesResult {
  anyWasSplit: boolean;
  totalFiles: number;
  totalRoutes: number;
}

/**
 * Logger interface for sitemap generation.
 */
interface SitemapLogger {
  error: (_msg: string) => void;
  info: (_msg: string) => void;
  warn: (_msg: string) => void;
}

/**
 * Handle robots.txt generation.
 *
 * @param outputDir - Directory to write robots.txt
 * @param resolvedOptions - Resolved plugin options
 * @param anyWasSplit - Whether any sitemap was split
 * @param logger - Logger instance
 *
 * @since 0.2.2
 */
async function handleRobotsTxt(
  outputDir: string,
  resolvedOptions: ResolvedPluginOptions,
  anyWasSplit: boolean,
  logger: SitemapLogger,
): Promise<void> {
  if (!resolvedOptions.generateRobotsTxt) return;

  if (!resolvedOptions.hostname) {
    logger.warn(`${pc.yellow("⚠")} Cannot generate robots.txt: hostname option is required`);
    return;
  }

  const primarySitemapFilename = anyWasSplit ? "sitemap-index.xml" : resolvedOptions.filename;
  const sitemapUrl = buildSitemapUrl(resolvedOptions.hostname, primarySitemapFilename);
  const robotsResult = await updateRobotsTxt(outputDir, sitemapUrl);

  if (robotsResult.success) {
    if (robotsResult.action === "created") {
      logger.info(`${pc.cyan("robots.txt")} ${pc.dim("created with Sitemap directive")}`);
    } else if (robotsResult.action === "updated") {
      logger.info(`${pc.cyan("robots.txt")} ${pc.dim("updated with Sitemap directive")}`);
    }
  } else {
    logger.warn(`${pc.yellow("⚠")} ${robotsResult.error}`);
  }
}

/**
 * Log warnings from generation result.
 *
 * @param warnings - Array of warning messages
 * @param logger - Logger instance
 *
 * @since 0.2.2
 */
function logWarnings(warnings: string[], logger: SitemapLogger): void {
  for (const warning of warnings) {
    logger.warn(`${pc.yellow("⚠")} ${warning}`);
  }
}

/**
 * Process all route sets and write sitemaps.
 *
 * @param resolvedRoutes - Array of route sets with names
 * @param ctx - Build context
 * @returns Processing result with totals
 *
 * @since 0.2.2
 */
async function processRouteSets(
  resolvedRoutes: Array<{ name: string; routes: Route[] }>,
  ctx: BuildContext,
): Promise<ProcessRoutesResult> {
  const { logger, resolvedOptions } = ctx;
  let totalRoutes = 0;
  let totalFiles = 0;
  let anyWasSplit = false;

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

    if (result.splitResult?.wasSplit) {
      anyWasSplit = true;
      const written = await writeSplitSitemap(result, baseFilename, name, ctx);
      if (written) {
        totalFiles += written.files;
        totalRoutes += written.routes;
      }
    } else {
      const written = await writeSingleSitemap(result, name, ctx);
      totalFiles += written.files;
      totalRoutes += written.routes;
    }

    logWarnings(result.warnings, logger);
  }

  return { anyWasSplit, totalFiles, totalRoutes };
}

/**
 * Send XML response in dev server.
 *
 * @param res - Response object
 * @param xml - XML content to send
 *
 * @since 0.2.2
 */
function sendXmlResponse(res: DevResponse, xml: string): void {
  res.setHeader("Content-Type", "application/xml");
  res.end(xml);
}

/**
 * Serve a sitemap request in dev mode.
 *
 * @param url - Request URL
 * @param root - Project root directory
 * @param resolvedOptions - Resolved plugin options
 * @param viteServer - Vite dev server instance
 * @param res - Response object
 * @returns Whether the request was served
 *
 * @since 0.2.2
 */
async function serveSitemapRequest(
  url: string,
  root: string,
  resolvedOptions: ResolvedPluginOptions,
  viteServer: ViteDevServer,
  res: DevResponse,
): Promise<boolean> {
  const { existsSync } = await import("node:fs");
  const { resolve: pathResolve } = await import("node:path");

  const discovery = await inlineDiscoverSitemapFile(
    root,
    resolvedOptions.sitemapFile,
    existsSync,
    pathResolve,
  );

  if (!discovery.found || !discovery.path) {
    return false;
  }

  const loadResult = await loadSitemapFile(discovery.path, viteServer);
  const resolvedRoutes = await resolveRoutes(loadResult);

  if (resolvedRoutes.length === 0) {
    return false;
  }

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

    const servedSplit = tryServeSplitSitemap(result, baseFilename, requestedFile, res);
    if (servedSplit) return true;

    const servedSingle = tryServeSingleSitemap(result, name, requestedFile, resolvedOptions, res);
    if (servedSingle) return true;
  }

  return false;
}

/**
 * Try to serve a single sitemap result.
 *
 * @param result - Generation result
 * @param name - Route set name
 * @param requestedFile - Requested filename
 * @param resolvedOptions - Resolved plugin options
 * @param res - Response object
 * @returns Whether the sitemap was served
 *
 * @since 0.2.2
 */
function tryServeSingleSitemap(
  result: GenerationResult,
  name: string,
  requestedFile: string,
  resolvedOptions: ResolvedPluginOptions,
  res: DevResponse,
): boolean {
  const filename =
    name === "default"
      ? (resolvedOptions.filename ?? getSitemapFilename(name))
      : getSitemapFilename(name);

  if (requestedFile === filename && result.xml) {
    sendXmlResponse(res, result.xml);
    return true;
  }

  return false;
}

/**
 * Try to serve a split sitemap result.
 *
 * @param result - Generation result
 * @param baseFilename - Base filename for sitemaps
 * @param requestedFile - Requested filename
 * @param res - Response object
 * @returns Whether the sitemap was served
 *
 * @since 0.2.2
 */
function tryServeSplitSitemap(
  result: GenerationResult,
  baseFilename: string,
  requestedFile: string,
  res: DevResponse,
): boolean {
  if (!result.splitResult?.wasSplit) return false;

  const indexFilename = getSitemapIndexFilename(baseFilename);
  if (requestedFile === indexFilename && result.splitResult.indexXml) {
    sendXmlResponse(res, result.splitResult.indexXml);
    return true;
  }

  for (const chunk of result.splitResult.sitemaps) {
    if (requestedFile === chunk.filename) {
      sendXmlResponse(res, chunk.xml);
      return true;
    }
  }

  return false;
}

/**
 * Write a single sitemap result to disk.
 *
 * @param result - Generation result
 * @param name - Route set name
 * @param ctx - Build context
 * @returns File and route counts
 *
 * @since 0.2.2
 */
async function writeSingleSitemap(
  result: GenerationResult,
  name: string,
  ctx: BuildContext,
): Promise<{ files: number; routes: number }> {
  const { logger, outputDir, resolvedOptions } = ctx;

  const filename =
    name === "default"
      ? (resolvedOptions.filename ?? getSitemapFilename(name))
      : getSitemapFilename(name);
  const outputPath = join(outputDir, filename);

  await writeFile(outputPath, result.xml!, "utf-8");

  const fileInfo = `(${result.routeCount} URLs, ${formatBytes(result.byteSize ?? 0)})`;
  logger.info(`${pc.cyan(filename)} ${pc.dim(fileInfo)}`);

  return { files: 1, routes: result.routeCount ?? 0 };
}

/**
 * Write a split sitemap result to disk.
 *
 * @param result - Generation result
 * @param baseFilename - Base filename for sitemaps
 * @param name - Route set name
 * @param ctx - Build context
 * @returns File and route counts, or null on failure
 *
 * @since 0.2.2
 */
async function writeSplitSitemap(
  result: GenerationResult,
  baseFilename: string,
  name: string,
  ctx: BuildContext,
): Promise<null | { files: number; routes: number }> {
  const { logger, outputDir } = ctx;

  if (!result.splitResult) return null;

  let files = 0;

  // Write all sitemap chunks
  for (const chunk of result.splitResult.sitemaps) {
    const outputPath = join(outputDir, chunk.filename);
    await writeFile(outputPath, chunk.xml, "utf-8");
    files++;

    const chunkInfo = `(${chunk.routes.length} URLs, ${formatBytes(chunk.byteSize)})`;
    logger.info(`${pc.cyan(chunk.filename)} ${pc.dim(chunkInfo)}`);
  }

  // Write sitemap index
  const indexFilename = getSitemapIndexFilename(baseFilename);
  const indexPath = join(outputDir, indexFilename);
  if (!result.splitResult.indexXml) {
    logger.error(`${pc.red("✗")} Index XML was not generated for split sitemap '${name}'`);
    return null;
  }
  await writeFile(indexPath, result.splitResult.indexXml, "utf-8");
  files++;

  const indexInfo = `(index for ${result.splitResult.sitemaps.length} sitemaps)`;
  logger.info(`${pc.cyan(indexFilename)} ${pc.dim(indexInfo)}`);

  return { files, routes: result.routeCount ?? 0 };
}

/**
 * Plugin name for identification.
 * Used for Vite plugin registry and debugging.
 *
 * @since 0.1.0
 */
export const PLUGIN_NAME = "vite-plugin-sitemap";

/**
 * Symbol key for storing plugin options.
 * Uses Symbol.for() to ensure the same symbol is used across module boundaries
 * (e.g., when CLI loads vite.config.ts in a separate context).
 *
 * @since 0.1.0
 */
const PLUGIN_OPTIONS_KEY = Symbol.for("vite-plugin-sitemap:options");

/**
 * Vite plugin return type without exposing Vite's internal types.
 * This prevents type conflicts when users have different Vite versions.
 *
 * @since 0.2.1
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
 * @param plugin - Plugin instance
 * @returns Plugin options or undefined
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
 * @param [userOptions] - Plugin configuration options
 * @returns Configured Vite plugin instance
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
        const { existsSync } = await import("node:fs");
        const { resolve: pathResolve } = await import("node:path");

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
          await mkdir(outputDir, { recursive: true });

          const ctx: BuildContext = { logger, outputDir, resolvedOptions };
          const { anyWasSplit, totalFiles, totalRoutes } = await processRouteSets(
            resolvedRoutes,
            ctx,
          );

          // Step 5: Generate robots.txt if enabled
          await handleRobotsTxt(outputDir, resolvedOptions, anyWasSplit, logger);

          const elapsed = Date.now() - startTime;
          const elapsedFormatted = pc.reset(pc.bold(`${elapsed}ms`));
          const timing = `in ${elapsedFormatted}`;
          logger.info(
            `${pc.green("✓")} ${pc.bold(String(totalFiles))} sitemap(s) with ${pc.bold(String(totalRoutes))} URLs ${pc.dim(timing)}`,
          );
        } finally {
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
          const served = await serveSitemapRequest(
            url,
            config.root,
            resolvedOptions,
            viteServer,
            res,
          );
          if (!served) {
            next();
          }
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
