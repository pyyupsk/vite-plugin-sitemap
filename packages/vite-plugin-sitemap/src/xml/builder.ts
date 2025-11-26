/**
 * XML string builder for sitemap elements.
 * Generates well-formed XML strings without external dependencies.
 */

import type { Route } from "../types/sitemap";
import type { Image, Video, News, Alternate } from "../types/extensions";
import { escapeXml, encodeUrl } from "./escape";
import {
  XML_DECLARATION,
  buildNamespaceAttrs,
  buildSitemapIndexNsAttr,
} from "./namespaces";

/**
 * Build a complete sitemap XML document.
 */
export function buildSitemapXml(routes: Route[]): string {
  const hasImages = routes.some((r) => r.images && r.images.length > 0);
  const hasVideos = routes.some((r) => r.videos && r.videos.length > 0);
  const hasNews = routes.some((r) => r.news);
  const hasAlternates = routes.some(
    (r) => r.alternates && r.alternates.length > 0,
  );

  const nsAttrs = buildNamespaceAttrs({
    hasImages,
    hasVideos,
    hasNews,
    hasAlternates,
  });

  const urls = routes.map((route) => buildUrlElement(route)).join("\n");

  return `${XML_DECLARATION}
<urlset ${nsAttrs}>
${urls}
</urlset>`;
}

/**
 * Build a single <url> element.
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
    parts.push(`  <priority>${route.priority.toFixed(1)}</priority>`);
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
 * Build an <image:image> element.
 */
export function buildImageElement(image: Image): string {
  const parts: string[] = [];
  parts.push(`    <image:loc>${encodeUrl(image.loc)}</image:loc>`);

  if (image.caption) {
    parts.push(
      `    <image:caption>${escapeXml(image.caption)}</image:caption>`,
    );
  }
  if (image.title) {
    parts.push(`    <image:title>${escapeXml(image.title)}</image:title>`);
  }
  if (image.geo_location) {
    parts.push(
      `    <image:geo_location>${escapeXml(image.geo_location)}</image:geo_location>`,
    );
  }
  if (image.license) {
    parts.push(
      `    <image:license>${encodeUrl(image.license)}</image:license>`,
    );
  }

  return `  <image:image>\n${parts.join("\n")}\n  </image:image>`;
}

/**
 * Build a <video:video> element.
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
    parts.push(
      `    <video:content_loc>${encodeUrl(video.content_loc)}</video:content_loc>`,
    );
  }
  if (video.player_loc) {
    parts.push(
      `    <video:player_loc>${encodeUrl(video.player_loc)}</video:player_loc>`,
    );
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
    const infoAttr = video.uploader.info
      ? ` info="${encodeUrl(video.uploader.info)}"`
      : "";
    parts.push(
      `    <video:uploader${infoAttr}>${escapeXml(video.uploader.name)}</video:uploader>`,
    );
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
 * Build a <news:news> element.
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
    parts.push(
      `    <news:keywords>${escapeXml(news.keywords)}</news:keywords>`,
    );
  }
  if (news.stock_tickers) {
    parts.push(
      `    <news:stock_tickers>${escapeXml(news.stock_tickers)}</news:stock_tickers>`,
    );
  }

  return `  <news:news>\n${parts.join("\n")}\n  </news:news>`;
}

/**
 * Build an <xhtml:link> element for hreflang.
 */
export function buildAlternateElement(alternate: Alternate): string {
  return `  <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${encodeUrl(alternate.href)}"/>`;
}

/**
 * Build a sitemap index XML document.
 */
export function buildSitemapIndexXml(
  sitemaps: Array<{ loc: string; lastmod?: string }>,
): string {
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
 * Calculate approximate byte size of an XML string (UTF-8).
 */
export function calculateByteSize(xml: string): number {
  return new TextEncoder().encode(xml).length;
}
