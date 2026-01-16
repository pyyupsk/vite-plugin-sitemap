/**
 * CLI preview command.
 * Preview generated sitemap XML without writing files.
 *
 * @module
 */

import type { Command } from "commander";

import type { GenerationResult } from "../../core/generator";
import type { Route } from "../../types/sitemap";

import { generateSitemap } from "../../core/generator";
import { formatResultForConsole } from "../../validation/errors";
import { colors, formatBytes, formatDuration, loadRoutesFromSitemap, logger } from "../utils";

/**
 * Preview options from CLI.
 */
interface PreviewOptions {
  full?: boolean;
  hostname?: string;
  limit: string;
  name?: string;
  root: string;
  sitemap?: string;
  verbose?: boolean;
}

/**
 * Register the preview command.
 * Adds the 'preview' command to the CLI program for previewing sitemap XML.
 *
 * @param program - Commander program instance
 *
 * @example
 * import { Command } from 'commander';
 * const program = new Command();
 * registerPreviewCommand(program);
 * program.parse();
 *
 * @since 0.1.0
 */
export function registerPreviewCommand(program: Command): void {
  program
    .command("preview")
    .description("Preview sitemap XML without generating files")
    .option("-r, --root <path>", "Project root directory", process.cwd())
    .option("-s, --sitemap <path>", "Path to sitemap file")
    .option("-h, --hostname <url>", "Hostname to prepend to URLs")
    .option("-n, --name <name>", "Preview specific named export (default: all)")
    .option("-l, --limit <number>", "Limit output to first N lines", "50")
    .option("-f, --full", "Show full XML output (no truncation)")
    .option("-v, --verbose", "Show detailed output")
    .action(async (options: PreviewOptions) => {
      const startTime = Date.now();

      try {
        logger.info("Loading sitemap configuration...\n");

        const result = await loadRoutesFromSitemap({
          root: options.root,
          ...(options.sitemap && { sitemapFile: options.sitemap }),
          ...(options.verbose && { verbose: options.verbose }),
        });

        if (!result) {
          process.exit(1);
        }

        const { pluginOptions, routes, server } = result;
        const hostname = options.hostname ?? pluginOptions?.hostname;

        try {
          const filteredRoutes = options.name
            ? routes.filter((r) => r.name === options.name)
            : routes;

          if (filteredRoutes.length === 0) {
            const msg = options.name
              ? `No export named '${options.name}' found.`
              : "No routes found.";
            logger.error(msg);
            process.exit(1);
          }

          for (const { name, routes: routeList } of filteredRoutes) {
            await previewRouteSet(name, routeList, hostname, options);
          }

          const elapsed = formatDuration(Date.now() - startTime);
          const elapsedFormatted = colors.reset(colors.bold(elapsed));
          const timing = `in ${elapsedFormatted}`;
          logger.success(`Preview complete ${colors.dim(timing)}`);
        } finally {
          await server.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Preview error: ${message}`);
        process.exit(1);
      }
    });
}

/**
 * Display stats for a generation result.
 *
 * @param genResult - Generation result containing stats
 *
 * @since 0.2.2
 */
function displayStats(genResult: GenerationResult): void {
  console.log(`\n${colors.bold("Size:")} ${colors.green(formatBytes(genResult.byteSize ?? 0))}`);
  console.log(`${colors.bold("Routes:")} ${colors.green(String(genResult.routeCount))}`);

  if (genResult.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of genResult.warnings) {
      logger.warn(warning);
    }
  }

  console.log("");
}

/**
 * Display XML output with optional truncation.
 *
 * @param xml - XML content to display
 * @param options - Preview options
 *
 * @since 0.2.2
 */
function displayXmlOutput(xml: string, options: PreviewOptions): void {
  const lines = xml.split("\n");
  const limit = options.full ? lines.length : Number.parseInt(options.limit, 10);

  console.log(colors.dim("─".repeat(60)));
  console.log(lines.slice(0, limit).join("\n"));

  if (!options.full && lines.length > limit) {
    console.log(colors.dim(`\n... ${lines.length - limit} more lines (use --full to see all)`));
  }
  console.log(colors.dim("─".repeat(60)));
}

/**
 * Preview a single route set.
 *
 * @param name - Route set name
 * @param routeList - Array of routes
 * @param hostname - Site hostname
 * @param options - Preview options
 *
 * @since 0.2.2
 */
async function previewRouteSet(
  name: string,
  routeList: Route[],
  hostname: string | undefined,
  options: PreviewOptions,
): Promise<void> {
  const routeInfo = `(${routeList.length} routes)`;
  logger.info(`Preview: ${colors.cyan(name)} ${colors.dim(routeInfo)}\n`);

  const genResult = await generateSitemap(routeList, {
    enableSplitting: false,
    hostname,
  });

  if (!genResult.success) {
    logger.error(`Generation failed for '${name}':`);
    console.log(formatResultForConsole(genResult.validation));
    return;
  }

  displayXmlOutput(genResult.xml ?? "", options);
  displayStats(genResult);
}
