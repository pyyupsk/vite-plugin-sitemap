/**
 * Zod schemas for sitemap validation.
 * Provides runtime validation with type inference for all sitemap elements.
 *
 * @module
 */

import { z } from "zod";

import { isValidW3CDatetime } from "./date";
import { isValidUrl, MAX_URL_LENGTH } from "./url";

/**
 * Change frequency enum schema.
 * Validates changefreq values per the sitemap protocol specification.
 *
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export const changeFrequencySchema = z.enum([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

/**
 * URL schema with sitemap protocol validation.
 * Validates that URLs are absolute, use http(s) protocol, and meet length requirements.
 *
 * @see {@link https://www.sitemaps.org/protocol.html#escaping}
 * @since 0.1.0
 */
export const urlSchema = z
  .string()
  .max(MAX_URL_LENGTH, `URL must not exceed ${MAX_URL_LENGTH} characters`)
  .refine(isValidUrl, {
    message: "Must be a valid absolute URL with http(s) protocol",
  });

/**
 * W3C Datetime schema.
 * Validates dates in W3C Datetime format (ISO 8601 subset).
 *
 * @see {@link https://www.w3.org/TR/NOTE-datetime}
 * @since 0.1.0
 */
export const w3cDatetimeSchema = z.string().refine(isValidW3CDatetime, {
  message: "Must be a valid W3C Datetime format (e.g., 2024-01-15)",
});

/**
 * Priority schema (0.0 to 1.0).
 * Validates priority values within the sitemap protocol range.
 *
 * @since 0.1.0
 */
export const prioritySchema = z
  .number()
  .min(0, "Priority must be at least 0.0")
  .max(1, "Priority must be at most 1.0");

/**
 * Image schema for Google Image sitemap extension.
 * Validates image elements with required loc and optional metadata.
 *
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps}
 * @since 0.1.0
 */
export const imageSchema = z.object({
  caption: z.string().max(2048).optional(),
  geo_location: z.string().optional(),
  license: urlSchema.optional(),
  loc: urlSchema,
  title: z.string().max(2048).optional(),
});

/**
 * Video restriction schema.
 * Validates geographic restrictions for video playback using ISO 3166-1 country codes.
 *
 * @since 0.1.0
 */
export const videoRestrictionSchema = z.object({
  countries: z.array(z.string().length(2)),
  relationship: z.enum(["allow", "deny"]),
});

/**
 * Video platform schema.
 * Validates platform restrictions for video playback (web, mobile, tv).
 *
 * @since 0.1.0
 */
export const videoPlatformSchema = z.object({
  platforms: z.array(z.enum(["web", "mobile", "tv"])),
  relationship: z.enum(["allow", "deny"]),
});

/**
 * Video uploader schema.
 * Validates video uploader information with name and optional info URL.
 *
 * @since 0.1.0
 */
export const videoUploaderSchema = z.object({
  info: urlSchema.optional(),
  name: z.string(),
});

/**
 * Video schema for Google Video sitemap extension.
 * Validates video elements with required fields and optional metadata.
 * Enforces that either content_loc or player_loc must be provided.
 *
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps}
 * @since 0.1.0
 */
export const videoSchema = z
  .object({
    content_loc: urlSchema.optional(),
    description: z.string().max(2048, "Video description must not exceed 2048 characters"),
    duration: z
      .number()
      .int()
      .min(1)
      .max(28800, "Duration must be between 1 and 28800 seconds")
      .optional(),
    expiration_date: w3cDatetimeSchema.optional(),
    family_friendly: z.boolean().optional(),
    live: z.boolean().optional(),
    platform: videoPlatformSchema.optional(),
    player_loc: urlSchema.optional(),
    publication_date: w3cDatetimeSchema.optional(),
    rating: z.number().min(0).max(5, "Rating must be between 0.0 and 5.0").optional(),
    requires_subscription: z.boolean().optional(),
    restriction: videoRestrictionSchema.optional(),
    tag: z.array(z.string()).max(32, "Maximum 32 tags allowed").optional(),
    thumbnail_loc: urlSchema,
    title: z.string().max(100, "Video title must not exceed 100 characters"),
    uploader: videoUploaderSchema.optional(),
    view_count: z.number().int().nonnegative().optional(),
  })
  .refine((video) => video.content_loc ?? video.player_loc, {
    message: "Either content_loc or player_loc must be provided",
  });

/**
 * News publication schema.
 * Validates news publication information with name and ISO 639-1 language code.
 *
 * @since 0.1.0
 */
export const newsPublicationSchema = z.object({
  language: z.string().min(2).max(5, "Language must be an ISO 639-1 code (e.g., 'en')"),
  name: z.string(),
});

/**
 * News schema for Google News sitemap extension.
 * Validates news article elements with publication info, date, and title.
 *
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap}
 * @since 0.1.0
 */
export const newsSchema = z.object({
  keywords: z.string().optional(),
  publication: newsPublicationSchema,
  publication_date: w3cDatetimeSchema,
  stock_tickers: z
    .string()
    .refine((val) => !val || val.split(",").length <= 5, {
      message: "Maximum 5 stock tickers allowed",
    })
    .optional(),
  title: z.string().max(2048, "News title must not exceed 2048 characters"),
});

/**
 * Alternate (hreflang) schema.
 * Validates alternate language links for internationalized sitemaps.
 *
 * @see {@link https://support.google.com/webmasters/answer/189077}
 * @since 0.1.0
 */
export const alternateSchema = z.object({
  href: urlSchema,
  hreflang: z.string().min(2, "hreflang must be at least 2 characters"),
});

/**
 * Route schema - a single URL entry in the sitemap.
 * Validates complete route objects with URL, metadata, and extensions.
 *
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export const routeSchema = z.object({
  alternates: z.array(alternateSchema).optional(),
  changefreq: changeFrequencySchema.optional(),
  images: z.array(imageSchema).max(1000, "Maximum 1000 images per URL").optional(),
  lastmod: w3cDatetimeSchema.optional(),
  news: newsSchema.optional(),
  priority: prioritySchema.optional(),
  url: urlSchema,
  videos: z.array(videoSchema).optional(),
});

/**
 * Plugin options schema.
 * Validates plugin configuration options provided by users.
 *
 * @since 0.1.0
 */
export const pluginOptionsSchema = z.object({
  changefreq: changeFrequencySchema.optional(),
  exclude: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  filename: z.string().optional(),
  generateRobotsTxt: z.boolean().optional(),
  hostname: z.url().optional(),
  lastmod: w3cDatetimeSchema.optional(),
  outDir: z.string().optional(),
  priority: prioritySchema.optional(),
  serialize: z.function().optional(),
  sitemapFile: z.string().optional(),
  transform: z.function().optional(),
});

/**
 * Alternate input type inferred from alternateSchema.
 *
 * @since 0.1.0
 */
export type AlternateInput = z.input<typeof alternateSchema>;

/**
 * Image input type inferred from imageSchema.
 *
 * @since 0.1.0
 */
export type ImageInput = z.input<typeof imageSchema>;

/**
 * News input type inferred from newsSchema.
 *
 * @since 0.1.0
 */
export type NewsInput = z.input<typeof newsSchema>;

/**
 * Plugin options input type inferred from pluginOptionsSchema.
 *
 * @since 0.1.0
 */
export type PluginOptionsInput = z.input<typeof pluginOptionsSchema>;

/**
 * Route input type inferred from routeSchema.
 * Represents the raw input before validation.
 *
 * @since 0.1.0
 */
export type RouteInput = z.input<typeof routeSchema>;

/**
 * Route output type inferred from routeSchema.
 * Represents the validated and transformed output.
 *
 * @since 0.1.0
 */
export type RouteOutput = z.output<typeof routeSchema>;

/**
 * Video input type inferred from videoSchema.
 *
 * @since 0.1.0
 */
export type VideoInput = z.input<typeof videoSchema>;
