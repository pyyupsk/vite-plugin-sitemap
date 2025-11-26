/**
 * Image metadata for Google Image sitemap extension.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */
export interface Image {
  /**
   * The URL of the image. Must be an absolute URL.
   */
  loc: string;

  /**
   * A caption for the image.
   */
  caption?: string;

  /**
   * The title of the image.
   */
  title?: string;

  /**
   * The geographic location of the image.
   * Example: 'Limerick, Ireland'
   */
  geo_location?: string;

  /**
   * A URL to the license of the image.
   */
  license?: string;
}

/**
 * Video metadata for Google Video sitemap extension.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 */
export interface Video {
  /**
   * A URL pointing to the video thumbnail image file.
   */
  thumbnail_loc: string;

  /**
   * The title of the video. Maximum 100 characters.
   */
  title: string;

  /**
   * A description of the video. Maximum 2,048 characters.
   */
  description: string;

  /**
   * A URL pointing to the actual video media file.
   * Either content_loc or player_loc must be specified.
   */
  content_loc?: string;

  /**
   * A URL pointing to a player for the video.
   * Either content_loc or player_loc must be specified.
   */
  player_loc?: string;

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
   * The rating of the video. Value must be from 0.0 to 5.0.
   */
  rating?: number;

  /**
   * The number of times the video has been viewed.
   */
  view_count?: number;

  /**
   * The date the video was first published. W3C Datetime format.
   */
  publication_date?: string;

  /**
   * Whether the video is suitable for viewing by children.
   */
  family_friendly?: boolean;

  /**
   * Geographic restrictions for video playback.
   */
  restriction?: VideoRestriction;

  /**
   * Platform restrictions for video playback.
   */
  platform?: VideoPlatform;

  /**
   * Whether a subscription is required to view the video.
   */
  requires_subscription?: boolean;

  /**
   * Information about the uploader of the video.
   */
  uploader?: VideoUploader;

  /**
   * Whether the video is a live stream.
   */
  live?: boolean;

  /**
   * Tags associated with the video. Maximum 32 tags.
   */
  tag?: string[];
}

/**
 * Geographic restrictions for video playback.
 */
export interface VideoRestriction {
  /**
   * Whether the countries listed are allowed or denied.
   */
  relationship: "allow" | "deny";

  /**
   * ISO 3166-1 alpha-2 country codes.
   */
  countries: string[];
}

/**
 * Platform restrictions for video playback.
 */
export interface VideoPlatform {
  /**
   * Whether the platforms listed are allowed or denied.
   */
  relationship: "allow" | "deny";

  /**
   * Platforms where the video can be played.
   */
  platforms: Array<"web" | "mobile" | "tv">;
}

/**
 * Information about the video uploader.
 */
export interface VideoUploader {
  /**
   * The name of the uploader.
   */
  name: string;

  /**
   * A URL with more information about the uploader.
   */
  info?: string;
}

/**
 * News article metadata for Google News sitemap extension.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */
export interface News {
  /**
   * Information about the publication.
   */
  publication: NewsPublication;

  /**
   * The article publication date. W3C Datetime format.
   */
  publication_date: string;

  /**
   * The title of the news article. Maximum 2,048 characters.
   */
  title: string;

  /**
   * Comma-separated list of keywords.
   */
  keywords?: string;

  /**
   * Comma-separated list of stock tickers. Maximum 5.
   */
  stock_tickers?: string;
}

/**
 * Information about the news publication.
 */
export interface NewsPublication {
  /**
   * The name of the news publication.
   */
  name: string;

  /**
   * The language of the publication. ISO 639-1 code.
   */
  language: string;
}

/**
 * Alternate language version of a URL for hreflang annotations.
 */
export interface Alternate {
  /**
   * The language/region code. ISO 639-1 or 'x-default'.
   * Examples: 'en', 'en-US', 'fr-CA', 'x-default'
   */
  hreflang: string;

  /**
   * The URL of the alternate language version.
   */
  href: string;
}
