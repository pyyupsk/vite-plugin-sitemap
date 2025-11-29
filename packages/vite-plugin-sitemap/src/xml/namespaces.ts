/**
 * XML namespace definitions for sitemap protocol and extensions.
 * @module
 */

/**
 * Core sitemap namespace (sitemaps.org protocol).
 * @constant {string}
 * @see {@link https://www.sitemaps.org/schemas/sitemap/0.9}
 * @since 0.1.0
 */
export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/**
 * Google Image sitemap extension namespace.
 * @constant {string}
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps}
 * @since 0.1.0
 */
export const IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";

/**
 * Google Video sitemap extension namespace.
 * @constant {string}
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/video-sitemaps}
 * @since 0.1.0
 */
export const VIDEO_NS = "http://www.google.com/schemas/sitemap-video/1.1";

/**
 * Google News sitemap extension namespace.
 * @constant {string}
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/news-sitemap}
 * @since 0.1.0
 */
export const NEWS_NS = "http://www.google.com/schemas/sitemap-news/0.9";

/**
 * XHTML namespace for hreflang links.
 * Used for alternate language annotations in sitemaps.
 * @constant {string}
 * @see {@link https://support.google.com/webmasters/answer/189077}
 * @since 0.1.0
 */
export const XHTML_NS = "http://www.w3.org/1999/xhtml";

/**
 * XML declaration header.
 * Standard XML 1.0 declaration with UTF-8 encoding.
 * @constant {string}
 * @since 0.1.0
 */
export const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

/**
 * Build namespace attributes string for urlset element.
 * Only includes namespaces that are actually used, minimizing XML output size.
 *
 * @param {Object} options - Options indicating which extensions are used
 * @param {boolean} [options.hasImages] - Include image namespace
 * @param {boolean} [options.hasVideos] - Include video namespace
 * @param {boolean} [options.hasNews] - Include news namespace
 * @param {boolean} [options.hasAlternates] - Include xhtml namespace for hreflang
 * @returns {string} Space-separated namespace attributes string
 *
 * @example
 * const attrs = buildNamespaceAttrs({ hasImages: true, hasAlternates: true });
 * // Returns: 'xmlns="http://..." xmlns:image="http://..." xmlns:xhtml="http://..."'
 *
 * @since 0.1.0
 */
export function buildNamespaceAttrs(options: {
  hasAlternates?: boolean;
  hasImages?: boolean;
  hasNews?: boolean;
  hasVideos?: boolean;
}): string {
  const attrs: string[] = [`xmlns="${SITEMAP_NS}"`];

  if (options.hasImages) {
    attrs.push(`xmlns:image="${IMAGE_NS}"`);
  }
  if (options.hasVideos) {
    attrs.push(`xmlns:video="${VIDEO_NS}"`);
  }
  if (options.hasNews) {
    attrs.push(`xmlns:news="${NEWS_NS}"`);
  }
  if (options.hasAlternates) {
    attrs.push(`xmlns:xhtml="${XHTML_NS}"`);
  }

  return attrs.join(" ");
}

/**
 * Build sitemap index namespace attribute.
 * Returns the xmlns attribute for sitemapindex elements.
 *
 * @returns {string} Namespace attribute string
 *
 * @example
 * const attr = buildSitemapIndexNsAttr();
 * const xml = `<sitemapindex ${attr}>...</sitemapindex>`;
 *
 * @since 0.1.0
 */
export function buildSitemapIndexNsAttr(): string {
  return `xmlns="${SITEMAP_NS}"`;
}
