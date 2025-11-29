/**
 * Sitemap splitter module.
 * Handles auto-splitting large sitemaps and generating sitemap index.
 */

import type { Route } from "../types/sitemap";

import { getCurrentW3CDate } from "../validation/date";
import { buildSitemapIndexXml, buildSitemapXml, calculateByteSize } from "../xml/builder";

/**
 * Maximum URLs per sitemap per Google's specification.
 */
export const MAX_URLS_PER_SITEMAP = 50000;

/**
 * Maximum size per sitemap file (45MB to stay under 50MB limit with buffer).
 */
export const MAX_BYTES_PER_SITEMAP = 45 * 1024 * 1024;

/**
 * A single sitemap chunk.
 */
export interface SitemapChunk {
  /** Byte size of the XML */
  byteSize: number;
  /** Filename for this chunk */
  filename: string;
  /** Chunk index (0-based) */
  index: number;
  /** Routes in this chunk */
  routes: Route[];
  /** Generated XML content */
  xml: string;
}

/**
 * Options for splitting sitemaps.
 */
export interface SplitOptions {
  /** Base filename (without extension) */
  baseFilename?: string;
  /** Hostname for sitemap index URLs */
  hostname?: string;
  /** Maximum bytes per sitemap */
  maxBytes?: number;
  /** Maximum URLs per sitemap */
  maxUrls?: number;
}

/**
 * Result of splitting routes into multiple sitemaps.
 */
export interface SplitResult {
  /** Sitemap index XML (only if wasSplit is true) */
  indexXml?: string;
  /** Individual sitemap chunks */
  sitemaps: SitemapChunk[];
  /** Whether splitting was required */
  wasSplit: boolean;
}

/**
 * Estimate total output size for routes.
 * Useful for progress reporting.
 */
export function estimateTotalSize(routes: Route[]): {
  estimatedBytes: number;
  estimatedChunks: number;
  needsSplit: boolean;
} {
  // Quick estimate: build XML for a sample and extrapolate
  const sampleSize = Math.min(routes.length, 100);
  const sample = routes.slice(0, sampleSize);
  const sampleXml = buildSitemapXml(sample);
  const sampleBytes = calculateByteSize(sampleXml);

  // Average bytes per route (excluding base XML)
  const baseSize = getBaseXmlSize();
  const bytesPerRoute = (sampleBytes - baseSize) / Math.max(sampleSize, 1);

  const estimatedBytes = baseSize + bytesPerRoute * routes.length;
  const needsSplit = routes.length > MAX_URLS_PER_SITEMAP || estimatedBytes > MAX_BYTES_PER_SITEMAP;

  // Estimate chunks based on limiting factor
  let estimatedChunks: number;
  if (needsSplit) {
    const chunksByUrls = Math.ceil(routes.length / MAX_URLS_PER_SITEMAP);
    const chunksBySize = Math.ceil(estimatedBytes / MAX_BYTES_PER_SITEMAP);
    estimatedChunks = Math.max(chunksByUrls, chunksBySize);
  } else {
    estimatedChunks = 1;
  }

  return {
    estimatedBytes: Math.round(estimatedBytes),
    estimatedChunks,
    needsSplit,
  };
}

/**
 * Get the sitemap index filename.
 */
export function getSitemapIndexFilename(baseFilename = "sitemap"): string {
  return `${baseFilename}-index.xml`;
}

/**
 * Split routes into multiple sitemaps if needed.
 *
 * Splitting occurs when:
 * - More than 50,000 URLs
 * - Single sitemap exceeds 45MB
 *
 * @param routes All routes to include. Empty array returns single empty sitemap.
 * @param options Split options
 * @returns Split result with chunks and optional index
 */
export function splitRoutes(routes: Route[], options: SplitOptions = {}): SplitResult {
  const {
    baseFilename = "sitemap",
    hostname,
    maxBytes = MAX_BYTES_PER_SITEMAP,
    maxUrls = MAX_URLS_PER_SITEMAP,
  } = options;

  // Handle empty routes case explicitly
  if (routes.length === 0) {
    const xml = buildSitemapXml([]);
    return {
      sitemaps: [
        {
          byteSize: calculateByteSize(xml),
          filename: `${baseFilename}.xml`,
          index: 0,
          routes: [],
          xml,
        },
      ],
      wasSplit: false,
    };
  }

  // If under URL limit, try generating a single sitemap
  if (routes.length <= maxUrls) {
    const xml = buildSitemapXml(routes);
    const byteSize = calculateByteSize(xml);

    // If under size limit too, return single sitemap
    if (byteSize <= maxBytes) {
      return {
        sitemaps: [
          {
            byteSize,
            filename: `${baseFilename}.xml`,
            index: 0,
            routes,
            xml,
          },
        ],
        wasSplit: false,
      };
    }
  }

  // Need to split - use incremental approach to handle size limits
  const chunks = splitByUrlsAndSize(routes, maxUrls, maxBytes);
  const sitemaps: SitemapChunk[] = chunks.map((chunk, index) => {
    const xml = buildSitemapXml(chunk);
    return {
      byteSize: calculateByteSize(xml),
      filename: `${baseFilename}-${index}.xml`,
      index,
      routes: chunk,
      xml,
    };
  });

  // Generate sitemap index
  const indexXml = generateSitemapIndex(sitemaps, hostname);

  return {
    indexXml,
    sitemaps,
    wasSplit: true,
  };
}

/**
 * Generate a sitemap index XML from chunks.
 */
function generateSitemapIndex(sitemaps: SitemapChunk[], hostname?: string): string {
  const lastmod = getCurrentW3CDate();

  const entries = sitemaps.map((sitemap) => ({
    lastmod,
    loc: hostname ? `${hostname.replace(/\/$/, "")}/${sitemap.filename}` : sitemap.filename,
  }));

  return buildSitemapIndexXml(entries);
}

/**
 * Get the base size of an empty sitemap XML structure.
 */
function getBaseXmlSize(): number {
  const emptyXml = buildSitemapXml([]);
  return calculateByteSize(emptyXml);
}

/**
 * Split routes by URL count and byte size limits.
 */
function splitByUrlsAndSize(routes: Route[], maxUrls: number, maxBytes: number): Route[][] {
  const chunks: Route[][] = [];
  let currentChunk: Route[] = [];
  let currentSize = getBaseXmlSize();

  for (const route of routes) {
    // Estimate size of this route's XML
    const routeXml = buildSitemapXml([route]);
    const routeSize = calculateByteSize(routeXml) - getBaseXmlSize();

    // Check if adding this route would exceed limits
    const wouldExceedUrls = currentChunk.length >= maxUrls;
    const wouldExceedSize = currentSize + routeSize > maxBytes;

    if (wouldExceedUrls || wouldExceedSize) {
      // Start new chunk if current has routes
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = getBaseXmlSize();
      }
    }

    currentChunk.push(route);
    currentSize += routeSize;
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
