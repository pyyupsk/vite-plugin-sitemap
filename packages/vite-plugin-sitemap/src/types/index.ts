/**
 * Type definitions for @pyyupsk/vite-plugin-sitemap.
 * Re-exports all public types from the plugin.
 * @module
 */

// Configuration types
export type {
  PluginOptions,
  ResolvedPluginOptions,
  RouteTransformer,
  XmlSerializer,
} from "./config";

export { defaultOptions, resolveOptions } from "./config";

// Extension types (Google sitemaps)
export type {
  Alternate,
  Image,
  News,
  NewsPublication,
  Video,
  VideoPlatform,
  VideoRestriction,
  VideoUploader,
} from "./extensions";

// Core sitemap types
export type {
  ChangeFrequency,
  Route,
  RouteGenerator,
  Sitemap,
  SitemapDefaultExport,
  SitemapIndex,
  SitemapModule,
  SitemapNamedExports,
  SitemapReference,
} from "./sitemap";
