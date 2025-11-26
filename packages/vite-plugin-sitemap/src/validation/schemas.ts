/**
 * Zod schemas for sitemap validation.
 * Provides runtime validation with type inference.
 */

import { z } from "zod";

import { isValidW3CDatetime } from "./date";
import { isValidUrl, MAX_URL_LENGTH } from "./url";

/**
 * Change frequency enum schema.
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
 */
export const urlSchema = z
  .string()
  .max(MAX_URL_LENGTH, `URL must not exceed ${MAX_URL_LENGTH} characters`)
  .refine(isValidUrl, {
    message: "Must be a valid absolute URL with http(s) protocol",
  });

/**
 * W3C Datetime schema.
 */
export const w3cDatetimeSchema = z.string().refine(isValidW3CDatetime, {
  message: "Must be a valid W3C Datetime format (e.g., 2024-01-15)",
});

/**
 * Priority schema (0.0 to 1.0).
 */
export const prioritySchema = z
  .number()
  .min(0, "Priority must be at least 0.0")
  .max(1, "Priority must be at most 1.0");

/**
 * Image schema for Google Image sitemap extension.
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
 */
export const videoRestrictionSchema = z.object({
  countries: z.array(z.string().length(2)),
  relationship: z.enum(["allow", "deny"]),
});

/**
 * Video platform schema.
 */
export const videoPlatformSchema = z.object({
  platforms: z.array(z.enum(["web", "mobile", "tv"])),
  relationship: z.enum(["allow", "deny"]),
});

/**
 * Video uploader schema.
 */
export const videoUploaderSchema = z.object({
  info: urlSchema.optional(),
  name: z.string(),
});

/**
 * Video schema for Google Video sitemap extension.
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
 */
export const newsPublicationSchema = z.object({
  language: z.string().min(2).max(5, "Language must be an ISO 639-1 code (e.g., 'en')"),
  name: z.string(),
});

/**
 * News schema for Google News sitemap extension.
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
 */
export const alternateSchema = z.object({
  href: urlSchema,
  hreflang: z.string().min(2, "hreflang must be at least 2 characters"),
});

/**
 * Route schema - a single URL entry in the sitemap.
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

export type AlternateInput = z.input<typeof alternateSchema>;
export type ImageInput = z.input<typeof imageSchema>;
export type NewsInput = z.input<typeof newsSchema>;
export type PluginOptionsInput = z.input<typeof pluginOptionsSchema>;
/**
 * Type exports inferred from schemas.
 */
export type RouteInput = z.input<typeof routeSchema>;
export type RouteOutput = z.output<typeof routeSchema>;
export type VideoInput = z.input<typeof videoSchema>;
