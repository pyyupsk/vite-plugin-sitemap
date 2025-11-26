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

// Main plugin export
export { sitemapPlugin, sitemapPlugin as default, PLUGIN_NAME } from "./plugin";

// Type exports for user sitemap files
export type { Route, ChangeFrequency } from "./types/sitemap";

export type {
  Image,
  Video,
  VideoRestriction,
  VideoPlatform,
  VideoUploader,
  News,
  NewsPublication,
  Alternate,
} from "./types/extensions";

export type {
  PluginOptions,
  RouteTransformer,
  XmlSerializer,
} from "./types/config";

// Validation exports for advanced usage
export type { ValidationError, ValidationResult } from "./validation/errors";

export {
  formatResultForConsole,
  formatErrorsForConsole,
} from "./validation/errors";

// Generator exports for programmatic usage
export { generateSitemap, validateRoutes } from "./core/generator";

export type { GenerationResult, GenerationOptions } from "./core/generator";

// XML builder exports for custom serialization
export {
  buildSitemapXml,
  buildSitemapIndexXml,
  buildUrlElement,
  calculateByteSize,
} from "./xml/builder";
