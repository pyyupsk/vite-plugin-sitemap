/**
 * Sitemap extension type definitions.
 * @module
 */

/**
 * Alternate language version of a URL for hreflang annotations.
 *
 * @interface Alternate
 * @see {@link https://support.google.com/webmasters/answer/189077}
 * @since 0.1.0
 */
export interface Alternate {
  /**
   * The URL of the alternate language version.
   */
  href: string;

  /**
   * The language/region code. ISO 639-1 or 'x-default'.
   * Examples: 'en', 'en-US', 'fr-CA', 'x-default'
   */
  hreflang: string;
}

/**
 * Image metadata for Google Image sitemap extension.
 *
 * @interface Image
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps}
 * @since 0.1.0
 */
export interface Image {
  /**
   * A caption for the image.
   */
  caption?: string;

  /**
   * The geographic location of the image.
   * Example: 'Limerick, Ireland'
   */
  geo_location?: string;

  /**
   * A URL to the license of the image.
   */
  license?: string;

  /**
   * The URL of the image. Must be an absolute URL.
   */
  loc: string;

  /**
   * The title of the image.
   */
  title?: string;
}

/**
 * News article metadata for Google News sitemap extension.
 *
 * @interface News
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap}
 * @since 0.1.0
 */
export interface News {
  /**
   * Comma-separated list of keywords.
   */
  keywords?: string;

  /**
   * Information about the publication.
   */
  publication: NewsPublication;

  /**
   * The article publication date. W3C Datetime format.
   */
  publication_date: string;

  /**
   * Comma-separated list of stock tickers. Maximum 5.
   */
  stock_tickers?: string;

  /**
   * The title of the news article. Maximum 2,048 characters.
   */
  title: string;
}

/**
 * Information about the news publication.
 *
 * @interface NewsPublication
 * @since 0.1.0
 */
export interface NewsPublication {
  /**
   * The language of the publication. ISO 639-1 code.
   */
  language: string;

  /**
   * The name of the news publication.
   */
  name: string;
}

/**
 * Video metadata for Google Video sitemap extension.
 *
 * @interface Video
 * @see {@link https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps}
 * @since 0.1.0
 */
export interface Video {
  /**
   * A URL pointing to the actual video media file.
   * Either content_loc or player_loc must be specified.
   */
  content_loc?: string;

  /**
   * A description of the video. Maximum 2,048 characters.
   */
  description: string;

  /**
   * The duration of the video in seconds. Value must be from 1 to 28800.
   */
  duration?: number;

  /**
   * The date after which the video will no longer be available.
   * W3C Datetime format.
   */
  expiration_date?: string;

  /**
   * Whether the video is suitable for viewing by children.
   */
  family_friendly?: boolean;

  /**
   * Whether the video is a live stream.
   */
  live?: boolean;

  /**
   * Platform restrictions for video playback.
   */
  platform?: VideoPlatform;

  /**
   * A URL pointing to a player for the video.
   * Either content_loc or player_loc must be specified.
   */
  player_loc?: string;

  /**
   * The date the video was first published. W3C Datetime format.
   */
  publication_date?: string;

  /**
   * The rating of the video. Value must be from 0.0 to 5.0.
   */
  rating?: number;

  /**
   * Whether a subscription is required to view the video.
   */
  requires_subscription?: boolean;

  /**
   * Geographic restrictions for video playback.
   */
  restriction?: VideoRestriction;

  /**
   * Tags associated with the video. Maximum 32 tags.
   */
  tag?: string[];

  /**
   * A URL pointing to the video thumbnail image file.
   */
  thumbnail_loc: string;

  /**
   * The title of the video. Maximum 100 characters.
   */
  title: string;

  /**
   * Information about the uploader of the video.
   */
  uploader?: VideoUploader;

  /**
   * The number of times the video has been viewed.
   */
  view_count?: number;
}

/**
 * Platform restrictions for video playback.
 *
 * @interface VideoPlatform
 * @since 0.1.0
 */
export interface VideoPlatform {
  /**
   * Platforms where the video can be played.
   */
  platforms: Array<"mobile" | "tv" | "web">;

  /**
   * Whether the platforms listed are allowed or denied.
   */
  relationship: "allow" | "deny";
}

/**
 * Geographic restrictions for video playback.
 *
 * @interface VideoRestriction
 * @since 0.1.0
 */
export interface VideoRestriction {
  /**
   * ISO 3166-1 alpha-2 country codes.
   */
  countries: string[];

  /**
   * Whether the countries listed are allowed or denied.
   */
  relationship: "allow" | "deny";
}

/**
 * Information about the video uploader.
 *
 * @interface VideoUploader
 * @since 0.1.0
 */
export interface VideoUploader {
  /**
   * A URL with more information about the uploader.
   */
  info?: string;

  /**
   * The name of the uploader.
   */
  name: string;
}
