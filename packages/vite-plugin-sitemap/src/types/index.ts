/**
 * Type definitions for @pyyupsk/vite-plugin-sitemap.
 * Re-exports all public types from the plugin.
 * @module
 */

// Core sitemap types
export type {
  ChangeFrequency,
  Route,
  RouteGenerator,
  SitemapDefaultExport,
  SitemapNamedExports,
  SitemapModule,
  Sitemap,
  SitemapReference,
  SitemapIndex,
} from "./sitemap";

// Extension types (Google sitemaps)
export type {
  Image,
  Video,
  VideoRestriction,
  VideoPlatform,
  VideoUploader,
  News,
  NewsPublication,
  Alternate,
} from "./extensions";

// Configuration types
export type {
  RouteTransformer,
  XmlSerializer,
  PluginOptions,
  ResolvedPluginOptions,
} from "./config";

export { defaultOptions, resolveOptions } from "./config";
