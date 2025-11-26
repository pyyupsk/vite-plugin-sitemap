/**
 * CLI preview command.
 * Preview generated sitemap XML without writing files.
 */

import type { Command } from "commander";

import { generateSitemap } from "../../core/generator";
import { formatResultForConsole } from "../../validation/errors";
import { formatBytes, formatDuration, loadRoutesFromSitemap, logger } from "../utils";

/**
 * Register the preview command.
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

        const { routes, server } = result;

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
            logger.info(`Preview: ${name} (${routeList.length} routes)\n`);

            const genResult = await generateSitemap(routeList, {
              enableSplitting: false, // Don't split for preview
              hostname: options.hostname,
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

            console.log("─".repeat(60));
            console.log(lines.slice(0, limit).join("\n"));

            if (!options.full && lines.length > limit) {
              console.log(
                `\n\x1b[2m... ${lines.length - limit} more lines (use --full to see all)\x1b[0m`,
              );
            }
            console.log("─".repeat(60));

            // Show stats
            console.log(`\nSize: ${formatBytes(genResult.byteSize ?? 0)}`);
            console.log(`Routes: ${genResult.routeCount}`);

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
          logger.success(`Preview complete in ${elapsed}`);
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
