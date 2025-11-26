/**
 * Sitemap generator module.
 * Orchestrates route validation, transformation, and XML generation.
 */

import type { Route } from "../types/sitemap";
import type { PluginOptions, ResolvedPluginOptions } from "../types/config";
import type { ValidationResult, ValidationError } from "../validation/errors";
import { routeSchema } from "../validation/schemas";
import {
  formatZodErrors,
  createSuccessResult,
  createFailedResult,
} from "../validation/errors";
import { matchesExcludePattern } from "../validation/url";
import { isFutureDate } from "../validation/date";
import { buildSitemapXml, calculateByteSize } from "../xml/builder";
import { splitRoutes } from "./splitter";
import type { SplitResult } from "./splitter";

/**
 * Result of sitemap generation.
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated XML content (single sitemap, or first chunk if split) */
  xml?: string;
  /** Byte size of the generated XML */
  byteSize?: number;
  /** Number of routes in the sitemap */
  routeCount?: number;
  /** Validation result */
  validation: ValidationResult;
  /** Warnings (non-fatal issues) */
  warnings: string[];
  /** Split result if sitemap was split into multiple files */
  splitResult?: SplitResult;
}

/**
 * Options for the generation pipeline.
 */
export interface GenerationOptions {
  /** Plugin options (for defaults and exclusions) */
  pluginOptions?: PluginOptions | ResolvedPluginOptions;
  /** Whether to skip validation (not recommended) */
  skipValidation?: boolean;
  /** Custom hostname to prepend to relative URLs */
  hostname?: string | undefined;
  /** Base filename for sitemaps (without extension) */
  baseFilename?: string;
  /** Enable auto-splitting for large sitemaps */
  enableSplitting?: boolean;
}

/**
 * Generate a sitemap from routes.
 *
 * Pipeline:
 * 1. Apply exclusion filters
 * 2. Apply transformations
 * 3. Apply defaults (changefreq, priority, lastmod)
 * 4. Validate all routes
 * 5. Deduplicate by URL
 * 6. Generate XML
 *
 * @param routes Input routes
 * @param options Generation options
 * @returns Generation result with XML and validation info
 */
export async function generateSitemap(
  routes: Route[],
  options: GenerationOptions = {},
): Promise<GenerationResult> {
  const warnings: string[] = [];
  const { pluginOptions = {} } = options;

  // Step 1: Filter excluded routes
  let processedRoutes = filterExcludedRoutes(
    routes,
    pluginOptions.exclude ?? [],
  );
  if (processedRoutes.length < routes.length) {
    const excluded = routes.length - processedRoutes.length;
    warnings.push(`${excluded} routes excluded by filter patterns`);
  }

  // Step 2: Apply transform function if provided
  if (pluginOptions.transform) {
    processedRoutes = await Promise.all(
      processedRoutes.map(async (route) => {
        const transformed = await pluginOptions.transform!(route);
        return transformed ?? route;
      }),
    );
    // Filter out null/undefined results (routes can be removed by transform)
    processedRoutes = processedRoutes.filter(Boolean);
  }

  // Step 3: Apply defaults
  processedRoutes = applyDefaults(processedRoutes, pluginOptions);

  // Step 4: Prepend hostname to relative URLs if provided
  if (options.hostname || pluginOptions.hostname) {
    const hostname = options.hostname ?? pluginOptions.hostname!;
    processedRoutes = processedRoutes.map((route) =>
      prependHostname(route, hostname),
    );
  }

  // Step 5: Validate routes
  if (!options.skipValidation) {
    const validationResult = validateRoutes(processedRoutes);

    // Check for future dates (warning, not error)
    for (const route of processedRoutes) {
      if (route.lastmod && isFutureDate(route.lastmod)) {
        warnings.push(`Future lastmod date for ${route.url}: ${route.lastmod}`);
      }
    }

    if (!validationResult.valid) {
      return {
        success: false,
        validation: validationResult,
        warnings,
      };
    }
  }

  // Step 6: Deduplicate by URL
  const deduplicatedRoutes = deduplicateRoutes(processedRoutes);
  if (deduplicatedRoutes.length < processedRoutes.length) {
    const dupes = processedRoutes.length - deduplicatedRoutes.length;
    warnings.push(`${dupes} duplicate URLs removed`);
  }

  // Step 7: Check if splitting is needed and enabled
  const enableSplitting = options.enableSplitting !== false; // Default to true

  if (enableSplitting) {
    const hostname = options.hostname ?? pluginOptions.hostname;
    const splitResult = splitRoutes(deduplicatedRoutes, {
      baseFilename: options.baseFilename ?? "sitemap",
      ...(hostname && { hostname }),
    });

    if (splitResult.wasSplit) {
      warnings.push(
        `Sitemap split into ${splitResult.sitemaps.length} files due to size/URL limits`,
      );

      return {
        success: true,
        xml: splitResult.sitemaps[0]!.xml,
        byteSize: splitResult.sitemaps.reduce((sum, s) => sum + s.byteSize, 0),
        routeCount: deduplicatedRoutes.length,
        validation: createSuccessResult(deduplicatedRoutes.length, warnings),
        warnings,
        splitResult,
      };
    }

    // Not split - return the single sitemap from split result
    return {
      success: true,
      xml: splitResult.sitemaps[0]!.xml,
      byteSize: splitResult.sitemaps[0]!.byteSize,
      routeCount: deduplicatedRoutes.length,
      validation: createSuccessResult(deduplicatedRoutes.length, warnings),
      warnings,
    };
  }

  // Step 8: Apply custom serializer or use default XML builder (splitting disabled)
  let xml: string;
  if (pluginOptions.serialize) {
    xml = await pluginOptions.serialize(deduplicatedRoutes);
  } else {
    xml = buildSitemapXml(deduplicatedRoutes);
  }

  const byteSize = calculateByteSize(xml);

  return {
    success: true,
    xml,
    byteSize,
    routeCount: deduplicatedRoutes.length,
    validation: createSuccessResult(deduplicatedRoutes.length, warnings),
    warnings,
  };
}

/**
 * Validate routes against the schema.
 */
export function validateRoutes(routes: Route[]): ValidationResult {
  const errors: ValidationError[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const result = routeSchema.safeParse(route);

    if (!result.success) {
      const routeErrors = formatZodErrors(result.error, `routes[${i}]`);
      errors.push(...routeErrors);
    }
  }

  if (errors.length > 0) {
    return createFailedResult(routes.length, errors);
  }

  return createSuccessResult(routes.length);
}

/**
 * Filter out routes matching exclusion patterns.
 */
export function filterExcludedRoutes(
  routes: Route[],
  patterns: Array<string | RegExp>,
): Route[] {
  if (patterns.length === 0) {
    return routes;
  }

  return routes.filter((route) => !matchesExcludePattern(route.url, patterns));
}

/**
 * Apply default values to routes.
 */
export function applyDefaults(
  routes: Route[],
  options: PluginOptions | ResolvedPluginOptions,
): Route[] {
  return routes.map((route) => {
    const result: Route = { ...route };

    // Only set defaults if the route doesn't have the value and the default is defined
    if (route.changefreq === undefined && options.changefreq !== undefined) {
      result.changefreq = options.changefreq;
    }
    if (route.priority === undefined && options.priority !== undefined) {
      result.priority = options.priority;
    }
    if (route.lastmod === undefined && options.lastmod !== undefined) {
      result.lastmod = options.lastmod;
    }

    return result;
  });
}

/**
 * Prepend hostname to a URL if it's relative.
 */
export function prependHostname(route: Route, hostname: string): Route {
  if (route.url.startsWith("http://") || route.url.startsWith("https://")) {
    return route;
  }

  // Ensure hostname doesn't end with slash and path starts with slash
  const cleanHostname = hostname.replace(/\/$/, "");
  const path = route.url.startsWith("/") ? route.url : `/${route.url}`;

  return {
    ...route,
    url: `${cleanHostname}${path}`,
  };
}

/**
 * Deduplicate routes by URL.
 * First occurrence wins.
 */
export function deduplicateRoutes(routes: Route[]): Route[] {
  const seen = new Set<string>();
  const result: Route[] = [];

  for (const route of routes) {
    if (!seen.has(route.url)) {
      seen.add(route.url);
      result.push(route);
    }
  }

  return result;
}

/**
 * Generate sitemaps for multiple route sets (named exports).
 */
export async function generateMultipleSitemaps(
  routeSets: Array<{ name: string; routes: Route[] }>,
  options: GenerationOptions = {},
): Promise<Map<string, GenerationResult>> {
  const results = new Map<string, GenerationResult>();

  for (const { name, routes } of routeSets) {
    const result = await generateSitemap(routes, options);
    results.set(name, result);
  }

  return results;
}
