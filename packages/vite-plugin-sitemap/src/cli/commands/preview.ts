/**
 * CLI preview command.
 * Preview generated sitemap XML without writing files.
 * @module
 */

import type { Command } from "commander";

import { generateSitemap } from "../../core/generator";
import { formatResultForConsole } from "../../validation/errors";
import { colors, formatBytes, formatDuration, loadRoutesFromSitemap, logger } from "../utils";

/**
 * Register the preview command.
 * Adds the 'preview' command to the CLI program for previewing sitemap XML.
 *
 * @param {Command} program - Commander program instance
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
    .action(async (options) => {
      const startTime = Date.now();

      try {
        logger.info("Loading sitemap configuration...\n");

        // Load routes
        const result = await loadRoutesFromSitemap({
          root: options.root,
          sitemapFile: options.sitemap,
          verbose: options.verbose,
        });

        if (!result) {
          process.exit(1);
        }

        const { pluginOptions, routes, server } = result;

        // Use hostname from CLI option, or fall back to vite.config
        const hostname = options.hostname ?? pluginOptions?.hostname;

        try {
          // Filter to specific named export if requested
          const filteredRoutes = options.name
            ? routes.filter((r) => r.name === options.name)
            : routes;

          if (filteredRoutes.length === 0) {
            logger.error(
              options.name ? `No export named '${options.name}' found.` : "No routes found.",
            );
            process.exit(1);
          }

          for (const { name, routes: routeList } of filteredRoutes) {
            logger.info(
              `Preview: ${colors.cyan(name)} ${colors.dim(`(${routeList.length} routes)`)}\n`,
            );

            const genResult = await generateSitemap(routeList, {
              enableSplitting: false, // Don't split for preview
              hostname,
            });

            if (!genResult.success) {
              logger.error(`Generation failed for '${name}':`);
              console.log(formatResultForConsole(genResult.validation));
              continue;
            }

            // Display XML output
            const xml = genResult.xml ?? "";
            const lines = xml.split("\n");
            const limit = options.full ? lines.length : Number.parseInt(options.limit, 10);

            console.log(colors.dim("─".repeat(60)));
            console.log(lines.slice(0, limit).join("\n"));

            if (!options.full && lines.length > limit) {
              console.log(
                colors.dim(`\n... ${lines.length - limit} more lines (use --full to see all)`),
              );
            }
            console.log(colors.dim("─".repeat(60)));

            // Show stats
            console.log(
              `\n${colors.bold("Size:")} ${colors.green(formatBytes(genResult.byteSize ?? 0))}`,
            );
            console.log(`${colors.bold("Routes:")} ${colors.green(String(genResult.routeCount))}`);

            // Show warnings
            if (genResult.warnings.length > 0) {
              console.log("\nWarnings:");
              for (const warning of genResult.warnings) {
                logger.warn(warning);
              }
            }

            console.log("");
          }

          const elapsed = formatDuration(Date.now() - startTime);
          logger.success(
            `Preview complete ${colors.dim(`in ${colors.reset(colors.bold(elapsed))}`)}`,
          );
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
