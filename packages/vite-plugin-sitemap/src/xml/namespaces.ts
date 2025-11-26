/**
 * XML namespace definitions for sitemap protocol and extensions.
 */

/**
 * Core sitemap namespace (sitemaps.org protocol).
 */
export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/**
 * Google Image sitemap extension namespace.
 */
export const IMAGE_NS = "http://www.google.com/schemas/sitemap-image/1.1";

/**
 * Google Video sitemap extension namespace.
 */
export const VIDEO_NS = "http://www.google.com/schemas/sitemap-video/1.1";

/**
 * Google News sitemap extension namespace.
 */
export const NEWS_NS = "http://www.google.com/schemas/sitemap-news/0.9";

/**
 * XHTML namespace for hreflang links.
 */
export const XHTML_NS = "http://www.w3.org/1999/xhtml";

/**
 * XML declaration header.
 */
export const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>';

/**
 * Build namespace attributes string for urlset element.
 * Only includes namespaces that are actually used.
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
 */
export function buildSitemapIndexNsAttr(): string {
  return `xmlns="${SITEMAP_NS}"`;
}
