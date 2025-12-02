/**
 * CLI validate command.
 * Validates sitemap configuration without generating output.
 *
 * @module
 */

import type { Command } from "commander";

import type { Route } from "../../types";

import { validateRoutes } from "../../core/generator";
import { formatResultForConsole } from "../../validation/errors";
import {
  colors,
  formatDuration,
  loadRoutesFromSitemap,
  logger,
  printRoutesSummary,
} from "../utils";

/**
 * Register the validate command.
 * Adds the 'validate' command to the CLI program for route validation.
 *
 * @param program - Commander program instance
 *
 * @example
 * import { Command } from 'commander';
 * const program = new Command();
 * registerValidateCommand(program);
 * program.parse();
 *
 * @since 0.1.0
 */
export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate sitemap configuration and routes")
    .option("-r, --root <path>", "Project root directory", process.cwd())
    .option("-s, --sitemap <path>", "Path to sitemap file")
    .option("-h, --hostname <url>", "Hostname to prepend to relative URLs")
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

        const { pluginOptions, routes, server } = result;

        // Use hostname from CLI option, or fall back to vite.config
        const hostname = options.hostname ?? pluginOptions?.hostname;

        try {
          let hasErrors = false;
          let totalRoutes = 0;

          for (const { name, routes: routeList } of routes) {
            if (options.verbose) {
              logger.info(
                `Validating ${colors.cyan(name)} ${colors.dim(`(${routeList.length} routes)`)}...`,
              );
            }

            // Prepend hostname to relative URLs if available
            const processedRoutes = hostname ? prependHostname(routeList, hostname) : routeList;

            const validationResult = validateRoutes(processedRoutes);
            totalRoutes += routeList.length;

            if (!validationResult.valid) {
              hasErrors = true;
              logger.error(`Validation failed for ${colors.cyan(name)}:`);
              console.log(formatResultForConsole(validationResult));
            } else if (options.verbose) {
              logger.success(
                `${colors.cyan(name)} validation passed ${colors.dim(`(${routeList.length} routes)`)}`,
              );
            }
          }

          if (options.verbose) {
            printRoutesSummary(routes);
          }

          const elapsed = formatDuration(Date.now() - startTime);

          if (hasErrors) {
            logger.error(`Validation failed ${colors.dim(`in ${elapsed}`)}`);
            process.exit(1);
          } else {
            logger.success(
              `Validation passed! ${colors.green(colors.bold(String(totalRoutes)))} routes validated ${colors.dim(`in ${colors.reset(colors.bold(elapsed))}`)}`,
            );
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

/**
 * Prepend hostname to relative URLs in routes.
 * Converts relative URLs to absolute URLs for validation.
 *
 * @param routes - Routes to process
 * @param hostname - Hostname to prepend
 * @returns Routes with absolute URLs
 *
 * @since 0.1.0
 */
function prependHostname(routes: Route[], hostname: string): Route[] {
  return routes.map((route) => ({
    ...route,
    url: route.url.startsWith("/") ? `${hostname.replace(/\/$/, "")}${route.url}` : route.url,
  }));
}
