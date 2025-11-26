/**
 * @pyyupsk/vite-plugin-sitemap
 *
 * A Vite plugin for generating XML sitemaps from file-based conventions.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import sitemap from '@pyyupsk/vite-plugin-sitemap';
 *
 * export default defineConfig({
 *   plugins: [
 *     sitemap({
 *       hostname: 'https://example.com',
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```ts
 * // src/sitemap.ts
 * import type { Route } from '@pyyupsk/vite-plugin-sitemap';
 *
 * export default [
 *   { url: 'https://example.com/' },
 *   { url: 'https://example.com/about' },
 *   {
 *     url: 'https://example.com/blog',
 *     lastmod: '2024-01-15',
 *     changefreq: 'weekly',
 *     priority: 0.8,
 *   },
 * ] satisfies Route[];
 * ```
 *
 * @packageDocumentation
 */

// Generator exports for programmatic usage
export { generateSitemap, validateRoutes } from "./core/generator";

export type { GenerationOptions, GenerationResult } from "./core/generator";

// Main plugin export
export { sitemapPlugin as default, PLUGIN_NAME, sitemapPlugin } from "./plugin";

export type { PluginOptions, RouteTransformer, XmlSerializer } from "./types/config";

export type {
  Alternate,
  Image,
  News,
  NewsPublication,
  Video,
  VideoPlatform,
  VideoRestriction,
  VideoUploader,
} from "./types/extensions";

// Type exports for user sitemap files
export type { ChangeFrequency, Route } from "./types/sitemap";

// Validation exports for advanced usage
export type { ValidationError, ValidationResult } from "./validation/errors";

export { formatErrorsForConsole, formatResultForConsole } from "./validation/errors";

// XML builder exports for custom serialization
export {
  buildSitemapIndexXml,
  buildSitemapXml,
  buildUrlElement,
  calculateByteSize,
} from "./xml/builder";
