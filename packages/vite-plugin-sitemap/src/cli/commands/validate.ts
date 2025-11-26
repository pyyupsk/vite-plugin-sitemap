/**
 * CLI validate command.
 * Validates sitemap configuration without generating output.
 */

import type { Command } from "commander";

import { validateRoutes } from "../../core/generator";
import { formatResultForConsole } from "../../validation/errors";
import { formatDuration, loadRoutesFromSitemap, logger, printRoutesSummary } from "../utils";

/**
 * Register the validate command.
 */
export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate sitemap configuration and routes")
    .option("-r, --root <path>", "Project root directory", process.cwd())
    .option("-s, --sitemap <path>", "Path to sitemap file")
    .option("-v, --verbose", "Show detailed output")
    .action(async (options) => {
      const startTime = Date.now();

      try {
        logger.info("Validating sitemap configuration...\n");

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
          let hasErrors = false;
          let totalRoutes = 0;

          for (const { name, routes: routeList } of routes) {
            if (options.verbose) {
              logger.info(`Validating '${name}' (${routeList.length} routes)...`);
            }

            const validationResult = validateRoutes(routeList);
            totalRoutes += routeList.length;

            if (!validationResult.valid) {
              hasErrors = true;
              logger.error(`Validation failed for '${name}':`);
              console.log(formatResultForConsole(validationResult));
            } else if (options.verbose) {
              logger.success(`'${name}' validation passed (${routeList.length} routes)`);
            }
          }

          if (options.verbose) {
            printRoutesSummary(routes);
          }

          const elapsed = formatDuration(Date.now() - startTime);

          if (hasErrors) {
            logger.error(`\nValidation failed in ${elapsed}`);
            process.exit(1);
          } else {
            logger.success(`\nValidation passed! ${totalRoutes} routes validated in ${elapsed}`);
          }
        } finally {
          await server.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Validation error: ${message}`);
        process.exit(1);
      }
    });
}
