/**
 * CLI command: vite-sitemap generate
 * Generates sitemap files without running a full Vite build.
 *
 * @module
 */

import type { Command } from "commander";

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { GenerationResult } from "../../core/generator";
import type { PluginOptions, ResolvedPluginOptions } from "../../types/config";
import type { Route } from "../../types/sitemap";

import { generateSitemap } from "../../core/generator";
import { getSitemapFilename } from "../../core/loader";
import { buildSitemapUrl, updateRobotsTxt } from "../../core/robots";
import { getSitemapIndexFilename } from "../../core/splitter";
import { resolveOptions } from "../../types/config";
import { formatResultForConsole } from "../../validation/errors";
import { colors, formatBytes, formatDuration, loadRoutesFromSitemap, logger } from "../utils";

/**
 * Context for CLI sitemap generation.
 */
interface CliContext {
  generatedFiles: string[];
  outputDir: string;
  resolvedOpts: ResolvedPluginOptions;
  verbose: boolean;
}

/**
 * Options for the generate command.
 *
 * @since 0.1.0
 */
interface GenerateOptions {
  /**
   * Base hostname for sitemap URLs.
   */
  hostname?: string;
  /**
   * Output directory for generated files.
   */
  output?: string;
  /**
   * Generate robots.txt with Sitemap directive.
   */
  robotsTxt?: boolean;
  /**
   * Project root directory.
   */
  root?: string;
  /**
   * Path to sitemap file.
   */
  sitemap?: string;
  /**
   * Show detailed output.
   */
  verbose?: boolean;
}

/**
 * Register the generate command.
 * Adds the 'generate' command to the CLI program with all options.
 *
 * @param program - Commander program instance
 *
 * @example
 * import { Command } from 'commander';
 * const program = new Command();
 * registerGenerateCommand(program);
 * program.parse();
 *
 * @since 0.1.0
 */
export function registerGenerateCommand(program: Command): void {
  program
    .command("generate")
    .description("Generate sitemap files without running a full Vite build")
    .option("-r, --root <path>", "Project root directory", process.cwd())
    .option("-s, --sitemap <path>", "Path to sitemap file")
    .option("-o, --output <dir>", "Output directory for generated files", "dist")
    .option("-h, --hostname <url>", "Base hostname for sitemap URLs")
    .option("-v, --verbose", "Show detailed output")
    .option("--robots-txt", "Generate robots.txt with Sitemap directive")
    .action(async function (this: Command, options: GenerateOptions) {
      const globalOpts = getGlobalOptions(this);
      const verbose = options.verbose ?? globalOpts.verbose ?? false;

      await executeGenerate({
        ...options,
        verbose,
      });
    });
}

/**
 * Execute the generate command.
 * Generates sitemap files and optionally robots.txt without a full Vite build.
 *
 * @param options - Command options
 * @throws {Error} If sitemap generation fails
 *
 * @since 0.1.0
 */
async function executeGenerate(options: GenerateOptions): Promise<void> {
  const startTime = Date.now();
  const root = options.root ?? process.cwd();

  logger.info("Generating sitemap...");

  if (options.verbose) {
    logger.dim(`Working directory: ${root}`);
    logger.dim(`Output directory: ${options.output ?? "dist"}`);
  }

  // Load routes from sitemap file
  const result = await loadRoutesFromSitemap({
    root,
    ...(options.sitemap && { sitemapFile: options.sitemap }),
    ...(options.verbose && { verbose: options.verbose }),
  });

  if (!result) {
    process.exit(1);
  }

  const { pluginOptions: configOptions, routes: resolvedRoutes, server } = result;

  // Use hostname from CLI option, or fall back to vite.config
  const hostname = options.hostname ?? configOptions?.hostname;

  try {
    // Resolve options with defaults, merging CLI options with config options
    const outputDir = resolve(root, options.output ?? configOptions?.outDir ?? "dist");
    const pluginOptions: PluginOptions = {
      ...configOptions,
      ...(hostname && { hostname }),
      generateRobotsTxt: options.robotsTxt ?? configOptions?.generateRobotsTxt ?? false,
      outDir: options.output ?? configOptions?.outDir ?? "dist",
    };

    const resolvedOpts: ResolvedPluginOptions = resolveOptions(pluginOptions, outputDir);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    const generatedFiles: string[] = [];
    const ctx: CliContext = {
      generatedFiles,
      outputDir,
      resolvedOpts,
      verbose: options.verbose ?? false,
    };

    const { anyWasSplit, totalFiles, totalRoutes } = await processRouteSetsCli(resolvedRoutes, ctx);

    // Generate robots.txt if enabled
    const shouldGenerateRobots = options.robotsTxt ?? configOptions?.generateRobotsTxt;
    await handleRobotsTxtCli(
      outputDir,
      hostname,
      shouldGenerateRobots,
      anyWasSplit,
      generatedFiles,
    );

    const elapsed = Date.now() - startTime;

    // Print summary
    console.log("\n" + colors.dim("─".repeat(50)));
    const elapsedFormatted = colors.reset(colors.bold(formatDuration(elapsed)));
    const timing = `in ${elapsedFormatted}`;
    logger.success(
      `${colors.bold("built")} ${colors.green(colors.bold(String(totalFiles)))} sitemap(s) with ${colors.green(colors.bold(String(totalRoutes)))} URLs ${colors.dim(timing)}`,
    );

    console.log(`\n${colors.bold("Generated files:")}`);
    for (const file of generatedFiles) {
      console.log(
        `  ${colors.green("➜")}  ${colors.dim(join(options.output ?? "dist", "/"))}${colors.cyan(file)}`,
      );
    }
  } finally {
    // Clean up Vite server
    await server.close();
  }
}

/**
 * Get CLI options from parent command.
 * Extracts global options like --verbose from parent command.
 *
 * @param cmd - Commander command instance
 * @returns Global options
 *
 * @since 0.1.0
 */
function getGlobalOptions(cmd: Command): {
  config?: string;
  verbose?: boolean;
} {
  const opts = cmd.parent?.opts() ?? {};
  return {
    config: opts.config,
    verbose: opts.verbose,
  };
}

/**
 * Handle robots.txt generation for CLI.
 *
 * @param outputDir - Output directory path
 * @param hostname - Site hostname
 * @param shouldGenerate - Whether to generate robots.txt
 * @param anyWasSplit - Whether any sitemap was split
 * @param generatedFiles - Array to track generated files
 *
 * @since 0.2.2
 */
async function handleRobotsTxtCli(
  outputDir: string,
  hostname: string | undefined,
  shouldGenerate: boolean | undefined,
  anyWasSplit: boolean,
  generatedFiles: string[],
): Promise<void> {
  if (!shouldGenerate) return;

  if (!hostname) {
    logger.warn("Cannot generate robots.txt: hostname is required");
    return;
  }

  const primarySitemapFilename = anyWasSplit ? "sitemap-index.xml" : "sitemap.xml";
  const sitemapUrl = buildSitemapUrl(hostname, primarySitemapFilename);
  const robotsResult = await updateRobotsTxt(outputDir, sitemapUrl);

  if (robotsResult.success) {
    if (robotsResult.action === "created") {
      logger.success("Created robots.txt with Sitemap directive");
      generatedFiles.push("robots.txt");
    } else if (robotsResult.action === "updated") {
      logger.success("Updated robots.txt with Sitemap directive");
    }
  } else {
    logger.warn(robotsResult.error ?? "Failed to update robots.txt");
  }
}

/**
 * Process all route sets for CLI generation.
 *
 * @param resolvedRoutes - Array of route sets with names
 * @param ctx - CLI context
 * @returns Processing result with totals
 *
 * @since 0.2.2
 */
async function processRouteSetsCli(
  resolvedRoutes: Array<{ name: string; routes: Route[] }>,
  ctx: CliContext,
): Promise<{ anyWasSplit: boolean; totalFiles: number; totalRoutes: number }> {
  const { resolvedOpts } = ctx;
  let totalRoutes = 0;
  let totalFiles = 0;
  let anyWasSplit = false;

  for (const { name, routes } of resolvedRoutes) {
    const baseFilename = name === "default" ? "sitemap" : `sitemap-${name}`;

    const genResult = await generateSitemap(routes, {
      baseFilename,
      enableSplitting: true,
      hostname: resolvedOpts.hostname,
      pluginOptions: resolvedOpts,
    });

    if (!genResult.success) {
      logger.error(
        `Validation failed for '${name}':\n${formatResultForConsole(genResult.validation)}`,
      );
      continue;
    }

    if (genResult.splitResult?.wasSplit) {
      anyWasSplit = true;
      const written = await writeSplitSitemapCli(genResult, baseFilename, name, ctx);
      if (written) {
        totalFiles += written.files;
        totalRoutes += written.routes;
      }
    } else {
      const written = await writeSingleSitemapCli(genResult, name, ctx);
      totalFiles += written.files;
      totalRoutes += written.routes;
    }

    for (const warning of genResult.warnings) {
      logger.warn(warning);
    }
  }

  return { anyWasSplit, totalFiles, totalRoutes };
}

/**
 * Write a single sitemap result for CLI.
 *
 * @param result - Generation result
 * @param name - Route set name
 * @param ctx - CLI context
 * @returns File and route counts
 *
 * @since 0.2.2
 */
async function writeSingleSitemapCli(
  result: GenerationResult,
  name: string,
  ctx: CliContext,
): Promise<{ files: number; routes: number }> {
  const { generatedFiles, outputDir, verbose } = ctx;

  const filename = getSitemapFilename(name);
  const outputPath = join(outputDir, filename);

  await writeFile(outputPath, result.xml!, "utf-8");
  generatedFiles.push(filename);

  if (verbose) {
    const fileInfo = `(${result.routeCount} URLs, ${formatBytes(result.byteSize ?? 0)})`;
    logger.info(`${colors.cyan(filename)} ${colors.dim(fileInfo)}`);
  }

  return { files: 1, routes: result.routeCount ?? 0 };
}

/**
 * Write a split sitemap result for CLI.
 *
 * @param result - Generation result
 * @param baseFilename - Base filename for sitemaps
 * @param name - Route set name
 * @param ctx - CLI context
 * @returns File and route counts, or null on failure
 *
 * @since 0.2.2
 */
async function writeSplitSitemapCli(
  result: GenerationResult,
  baseFilename: string,
  name: string,
  ctx: CliContext,
): Promise<null | { files: number; routes: number }> {
  const { generatedFiles, outputDir, verbose } = ctx;

  if (!result.splitResult) return null;

  let files = 0;

  for (const chunk of result.splitResult.sitemaps) {
    const outputPath = join(outputDir, chunk.filename);
    await writeFile(outputPath, chunk.xml, "utf-8");
    files++;
    generatedFiles.push(chunk.filename);

    if (verbose) {
      const chunkInfo = `(${chunk.routes.length} URLs, ${formatBytes(chunk.byteSize)})`;
      logger.info(`${colors.cyan(chunk.filename)} ${colors.dim(chunkInfo)}`);
    }
  }

  const indexFilename = getSitemapIndexFilename(baseFilename);
  const indexPath = join(outputDir, indexFilename);
  if (!result.splitResult.indexXml) {
    logger.error(`Index XML was not generated for split sitemap '${name}'`);
    return null;
  }
  await writeFile(indexPath, result.splitResult.indexXml, "utf-8");
  files++;
  generatedFiles.push(indexFilename);

  if (verbose) {
    const indexInfo = `(index for ${result.splitResult.sitemaps.length} sitemaps)`;
    logger.info(`${colors.cyan(indexFilename)} ${colors.dim(indexInfo)}`);
  }

  return { files, routes: result.routeCount ?? 0 };
}
