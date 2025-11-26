/**
 * Zod schemas for sitemap validation.
 * Provides runtime validation with type inference.
 */

import { z } from "zod";
import { isValidUrl, MAX_URL_LENGTH } from "./url";
import { isValidW3CDatetime } from "./date";

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
  loc: urlSchema,
  caption: z.string().max(2048).optional(),
  title: z.string().max(2048).optional(),
  geo_location: z.string().optional(),
  license: urlSchema.optional(),
});

/**
 * Video restriction schema.
 */
export const videoRestrictionSchema = z.object({
  relationship: z.enum(["allow", "deny"]),
  countries: z.array(z.string().length(2)),
});

/**
 * Video platform schema.
 */
export const videoPlatformSchema = z.object({
  relationship: z.enum(["allow", "deny"]),
  platforms: z.array(z.enum(["web", "mobile", "tv"])),
});

/**
 * Video uploader schema.
 */
export const videoUploaderSchema = z.object({
  name: z.string(),
  info: urlSchema.optional(),
});

/**
 * Video schema for Google Video sitemap extension.
 */
export const videoSchema = z
  .object({
    thumbnail_loc: urlSchema,
    title: z.string().max(100, "Video title must not exceed 100 characters"),
    description: z
      .string()
      .max(2048, "Video description must not exceed 2048 characters"),
    content_loc: urlSchema.optional(),
    player_loc: urlSchema.optional(),
    duration: z
      .number()
      .int()
      .min(1)
      .max(28800, "Duration must be between 1 and 28800 seconds")
      .optional(),
    expiration_date: w3cDatetimeSchema.optional(),
    rating: z
      .number()
      .min(0)
      .max(5, "Rating must be between 0.0 and 5.0")
      .optional(),
    view_count: z.number().int().nonnegative().optional(),
    publication_date: w3cDatetimeSchema.optional(),
    family_friendly: z.boolean().optional(),
    restriction: videoRestrictionSchema.optional(),
    platform: videoPlatformSchema.optional(),
    requires_subscription: z.boolean().optional(),
    uploader: videoUploaderSchema.optional(),
    live: z.boolean().optional(),
    tag: z.array(z.string()).max(32, "Maximum 32 tags allowed").optional(),
  })
  .refine((video) => video.content_loc ?? video.player_loc, {
    message: "Either content_loc or player_loc must be provided",
  });

/**
 * News publication schema.
 */
export const newsPublicationSchema = z.object({
  name: z.string(),
  language: z
    .string()
    .min(2)
    .max(5, "Language must be an ISO 639-1 code (e.g., 'en')"),
});

/**
 * News schema for Google News sitemap extension.
 */
export const newsSchema = z.object({
  publication: newsPublicationSchema,
  publication_date: w3cDatetimeSchema,
  title: z.string().max(2048, "News title must not exceed 2048 characters"),
  keywords: z.string().optional(),
  stock_tickers: z
    .string()
    .refine((val) => !val || val.split(",").length <= 5, {
      message: "Maximum 5 stock tickers allowed",
    })
    .optional(),
});

/**
 * Alternate (hreflang) schema.
 */
export const alternateSchema = z.object({
  hreflang: z.string().min(2, "hreflang must be at least 2 characters"),
  href: urlSchema,
});

/**
 * Route schema - a single URL entry in the sitemap.
 */
export const routeSchema = z.object({
  url: urlSchema,
  lastmod: w3cDatetimeSchema.optional(),
  changefreq: changeFrequencySchema.optional(),
  priority: prioritySchema.optional(),
  images: z
    .array(imageSchema)
    .max(1000, "Maximum 1000 images per URL")
    .optional(),
  videos: z.array(videoSchema).optional(),
  news: newsSchema.optional(),
  alternates: z.array(alternateSchema).optional(),
});

/**
 * Plugin options schema.
 */
export const pluginOptionsSchema = z.object({
  hostname: z.url().optional(),
  sitemapFile: z.string().optional(),
  outDir: z.string().optional(),
  filename: z.string().optional(),
  generateRobotsTxt: z.boolean().optional(),
  changefreq: changeFrequencySchema.optional(),
  priority: prioritySchema.optional(),
  lastmod: w3cDatetimeSchema.optional(),
  exclude: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  transform: z.function().optional(),
  serialize: z.function().optional(),
});

/**
 * Type exports inferred from schemas.
 */
export type RouteInput = z.input<typeof routeSchema>;
export type RouteOutput = z.output<typeof routeSchema>;
export type ImageInput = z.input<typeof imageSchema>;
export type VideoInput = z.input<typeof videoSchema>;
export type NewsInput = z.input<typeof newsSchema>;
export type AlternateInput = z.input<typeof alternateSchema>;
export type PluginOptionsInput = z.input<typeof pluginOptionsSchema>;
