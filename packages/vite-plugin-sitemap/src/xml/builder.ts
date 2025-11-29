/**
 * XML string builder for sitemap elements.
 * Generates well-formed XML strings without external dependencies.
 * @module
 */

import type { Alternate, Image, News, Video } from "../types/extensions";
import type { Route } from "../types/sitemap";

import { encodeUrl, escapeXml } from "./escape";
import { buildNamespaceAttrs, buildSitemapIndexNsAttr, XML_DECLARATION } from "./namespaces";

/**
 * Build an <xhtml:link> element for hreflang.
 * Creates an alternate link element for multi-language sitemap support.
 *
 * @param {Alternate} alternate - Alternate link data
 * @returns {string} XML string for xhtml:link element
 *
 * @example
 * const alt = { href: 'https://example.com/fr', hreflang: 'fr' };
 * const xml = buildAlternateElement(alt);
 *
 * @see {@link https://support.google.com/webmasters/answer/189077}
 * @since 0.1.0
 */
export function buildAlternateElement(alternate: Alternate): string {
  return `  <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${encodeUrl(alternate.href)}"/>`;
}

/**
 * Build an <image:image> element.
 * Creates an image element for Google Image sitemap extension.
 *
 * @param {Image} image - Image data
 * @returns {string} XML string for image:image element
 *
 * @example
 * const image = {
 *   loc: 'https://example.com/image.jpg',
 *   title: 'Example Image',
 *   caption: 'An example'
 * };
 * const xml = buildImageElement(image);
 *
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps}
 * @since 0.1.0
 */
export function buildImageElement(image: Image): string {
  const parts: string[] = [];
  parts.push(`    <image:loc>${encodeUrl(image.loc)}</image:loc>`);

  if (image.caption) {
    parts.push(`    <image:caption>${escapeXml(image.caption)}</image:caption>`);
  }
  if (image.title) {
    parts.push(`    <image:title>${escapeXml(image.title)}</image:title>`);
  }
  if (image.geo_location) {
    parts.push(`    <image:geo_location>${escapeXml(image.geo_location)}</image:geo_location>`);
  }
  if (image.license) {
    parts.push(`    <image:license>${encodeUrl(image.license)}</image:license>`);
  }

  return `  <image:image>\n${parts.join("\n")}\n  </image:image>`;
}

/**
 * Build a <news:news> element.
 * Creates a news element for Google News sitemap extension.
 *
 * @param {News} news - News data
 * @returns {string} XML string for news:news element
 *
 * @example
 * const news = {
 *   publication: { name: 'Example News', language: 'en' },
 *   publication_date: '2024-01-15',
 *   title: 'Breaking News'
 * };
 * const xml = buildNewsElement(news);
 *
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/news-sitemap}
 * @since 0.1.0
 */
export function buildNewsElement(news: News): string {
  const parts: string[] = [];

  parts.push(
    // Publication info
    "    <news:publication>",
    `      <news:name>${escapeXml(news.publication.name)}</news:name>`,
    `      <news:language>${escapeXml(news.publication.language)}</news:language>`,
    "    </news:publication>",

    // Required fields
    `    <news:publication_date>${escapeXml(news.publication_date)}</news:publication_date>`,
    `    <news:title>${escapeXml(news.title)}</news:title>`,
  );

  // Optional fields
  if (news.keywords) {
    parts.push(`    <news:keywords>${escapeXml(news.keywords)}</news:keywords>`);
  }
  if (news.stock_tickers) {
    parts.push(`    <news:stock_tickers>${escapeXml(news.stock_tickers)}</news:stock_tickers>`);
  }

  return `  <news:news>\n${parts.join("\n")}\n  </news:news>`;
}

/**
 * Build a sitemap index XML document.
 * Creates a sitemap index that references multiple sitemap files.
 *
 * @param {Array<{ lastmod?: string, loc: string }>} sitemaps - Array of sitemap references
 * @returns {string} Complete sitemap index XML document
 *
 * @example
 * const sitemaps = [
 *   { loc: 'https://example.com/sitemap-0.xml', lastmod: '2024-01-15' },
 *   { loc: 'https://example.com/sitemap-1.xml', lastmod: '2024-01-15' }
 * ];
 * const xml = buildSitemapIndexXml(sitemaps);
 *
 * @see {@link https://www.sitemaps.org/protocol.html#index}
 * @since 0.1.0
 */
export function buildSitemapIndexXml(sitemaps: Array<{ lastmod?: string; loc: string }>): string {
  const entries = sitemaps
    .map((sitemap) => {
      const parts: string[] = [];
      parts.push(`  <loc>${encodeUrl(sitemap.loc)}</loc>`);
      if (sitemap.lastmod) {
        parts.push(`  <lastmod>${escapeXml(sitemap.lastmod)}</lastmod>`);
      }
      return `<sitemap>\n${parts.join("\n")}\n</sitemap>`;
    })
    .join("\n");

  return `${XML_DECLARATION}
<sitemapindex ${buildSitemapIndexNsAttr()}>
${entries}
</sitemapindex>`;
}

/**
 * Build a complete sitemap XML document.
 * Generates a complete sitemap with proper namespaces and URL entries.
 *
 * @param {Route[]} routes - Array of routes to include in sitemap
 * @returns {string} Complete sitemap XML document
 *
 * @example
 * const routes = [
 *   { url: 'https://example.com' },
 *   { url: 'https://example.com/about', priority: 0.8 }
 * ];
 * const xml = buildSitemapXml(routes);
 *
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export function buildSitemapXml(routes: Route[]): string {
  const hasImages = routes.some((r) => r.images && r.images.length > 0);
  const hasVideos = routes.some((r) => r.videos && r.videos.length > 0);
  const hasNews = routes.some((r) => r.news);
  const hasAlternates = routes.some((r) => r.alternates && r.alternates.length > 0);

  const nsAttrs = buildNamespaceAttrs({
    hasAlternates,
    hasImages,
    hasNews,
    hasVideos,
  });

  const urls = routes.map((route) => buildUrlElement(route)).join("\n");

  return `${XML_DECLARATION}
<urlset ${nsAttrs}>
${urls}
</urlset>`;
}

/**
 * Build a single <url> element.
 * Creates a URL entry with all optional elements (lastmod, changefreq, priority, etc.).
 *
 * @param {Route} route - Route data
 * @returns {string} XML string for url element
 *
 * @example
 * const route = {
 *   url: 'https://example.com/page',
 *   lastmod: '2024-01-15',
 *   changefreq: 'weekly',
 *   priority: 0.8
 * };
 * const xml = buildUrlElement(route);
 *
 * @since 0.1.0
 */
export function buildUrlElement(route: Route): string {
  const parts: string[] = [];

  // Required: loc
  parts.push(`  <loc>${encodeUrl(route.url)}</loc>`);

  // Optional: lastmod
  if (route.lastmod) {
    parts.push(`  <lastmod>${escapeXml(route.lastmod)}</lastmod>`);
  }

  // Optional: changefreq
  if (route.changefreq) {
    parts.push(`  <changefreq>${route.changefreq}</changefreq>`);
  }

  // Optional: priority
  if (route.priority !== undefined) {
    // Keep original precision, but ensure at least one decimal for whole numbers
    const priorityStr =
      route.priority % 1 === 0 ? route.priority.toFixed(1) : String(route.priority);
    parts.push(`  <priority>${priorityStr}</priority>`);
  }

  // Images extension
  if (route.images && route.images.length > 0) {
    for (const image of route.images) {
      parts.push(buildImageElement(image));
    }
  }

  // Videos extension
  if (route.videos && route.videos.length > 0) {
    for (const video of route.videos) {
      parts.push(buildVideoElement(video));
    }
  }

  // News extension
  if (route.news) {
    parts.push(buildNewsElement(route.news));
  }

  // Alternates (hreflang)
  if (route.alternates && route.alternates.length > 0) {
    for (const alt of route.alternates) {
      parts.push(buildAlternateElement(alt));
    }
  }

  return `<url>\n${parts.join("\n")}\n</url>`;
}

/**
 * Build a <video:video> element.
 * Creates a video element for Google Video sitemap extension.
 *
 * @param {Video} video - Video data
 * @returns {string} XML string for video:video element
 *
 * @example
 * const video = {
 *   thumbnail_loc: 'https://example.com/thumb.jpg',
 *   title: 'Example Video',
 *   description: 'A video example',
 *   content_loc: 'https://example.com/video.mp4'
 * };
 * const xml = buildVideoElement(video);
 *
 * @see {@link https://developers.google.com/search/docs/advanced/sitemaps/video-sitemaps}
 * @since 0.1.0
 */
export function buildVideoElement(video: Video): string {
  const parts: string[] = [];

  // Required fields
  parts.push(
    `    <video:thumbnail_loc>${encodeUrl(video.thumbnail_loc)}</video:thumbnail_loc>`,
    `    <video:title>${escapeXml(video.title)}</video:title>`,
    `    <video:description>${escapeXml(video.description)}</video:description>`,
  );

  // Content location (at least one of content_loc or player_loc required)
  if (video.content_loc) {
    parts.push(`    <video:content_loc>${encodeUrl(video.content_loc)}</video:content_loc>`);
  }
  if (video.player_loc) {
    parts.push(`    <video:player_loc>${encodeUrl(video.player_loc)}</video:player_loc>`);
  }

  // Optional fields
  if (video.duration !== undefined) {
    parts.push(`    <video:duration>${video.duration}</video:duration>`);
  }
  if (video.expiration_date) {
    parts.push(
      `    <video:expiration_date>${escapeXml(video.expiration_date)}</video:expiration_date>`,
    );
  }
  if (video.rating !== undefined) {
    parts.push(`    <video:rating>${video.rating.toFixed(1)}</video:rating>`);
  }
  if (video.view_count !== undefined) {
    parts.push(`    <video:view_count>${video.view_count}</video:view_count>`);
  }
  if (video.publication_date) {
    parts.push(
      `    <video:publication_date>${escapeXml(video.publication_date)}</video:publication_date>`,
    );
  }
  if (video.family_friendly !== undefined) {
    parts.push(
      `    <video:family_friendly>${video.family_friendly ? "yes" : "no"}</video:family_friendly>`,
    );
  }
  if (video.restriction) {
    parts.push(
      `    <video:restriction relationship="${video.restriction.relationship}">${video.restriction.countries.join(" ")}</video:restriction>`,
    );
  }
  if (video.platform) {
    parts.push(
      `    <video:platform relationship="${video.platform.relationship}">${video.platform.platforms.join(" ")}</video:platform>`,
    );
  }
  if (video.requires_subscription !== undefined) {
    parts.push(
      `    <video:requires_subscription>${video.requires_subscription ? "yes" : "no"}</video:requires_subscription>`,
    );
  }
  if (video.uploader) {
    const infoAttr = video.uploader.info ? ` info="${encodeUrl(video.uploader.info)}"` : "";
    parts.push(`    <video:uploader${infoAttr}>${escapeXml(video.uploader.name)}</video:uploader>`);
  }
  if (video.live !== undefined) {
    parts.push(`    <video:live>${video.live ? "yes" : "no"}</video:live>`);
  }
  if (video.tag && video.tag.length > 0) {
    for (const tag of video.tag) {
      parts.push(`    <video:tag>${escapeXml(tag)}</video:tag>`);
    }
  }

  return `  <video:video>\n${parts.join("\n")}\n  </video:video>`;
}

/**
 * Calculate approximate byte size of an XML string (UTF-8).
 * Used to ensure sitemaps stay under the 50MB size limit.
 *
 * @param {string} xml - XML string to measure
 * @returns {number} Size in bytes (UTF-8 encoding)
 *
 * @example
 * const xml = buildSitemapXml(routes);
 * const size = calculateByteSize(xml);
 * console.log(`Sitemap size: ${size} bytes`);
 *
 * @since 0.1.0
 */
export function calculateByteSize(xml: string): number {
  return new TextEncoder().encode(xml).length;
}
