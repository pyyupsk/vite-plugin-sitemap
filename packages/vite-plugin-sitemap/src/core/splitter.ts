/**
 * Sitemap splitter module.
 * Handles auto-splitting large sitemaps and generating sitemap index.
 * @module
 */

import type { Route } from "../types/sitemap";

import { getCurrentW3CDate } from "../validation/date";
import { buildSitemapIndexXml, buildSitemapXml, calculateByteSize } from "../xml/builder";

/**
 * Maximum URLs per sitemap per Google's specification.
 *
 * @constant {number}
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export const MAX_URLS_PER_SITEMAP = 50000;

/**
 * Maximum size per sitemap file (45MB to stay under 50MB limit with buffer).
 * Using 45MB instead of 50MB provides safety margin for encoding variations.
 *
 * @constant {number}
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export const MAX_BYTES_PER_SITEMAP = 45 * 1024 * 1024;

/**
 * A single sitemap chunk.
 *
 * @interface SitemapChunk
 * @since 0.1.0
 */
export interface SitemapChunk {
  /**
   * Byte size of the XML (UTF-8 encoded).
   */
  byteSize: number;
  /**
   * Filename for this chunk (e.g., "sitemap-0.xml").
   */
  filename: string;
  /**
   * Chunk index (0-based).
   */
  index: number;
  /**
   * Routes included in this chunk.
   */
  routes: Route[];
  /**
   * Generated XML content.
   */
  xml: string;
}

/**
 * Options for splitting sitemaps.
 *
 * @interface SplitOptions
 * @since 0.1.0
 */
export interface SplitOptions {
  /**
   * Base filename (without extension).
   * @default "sitemap"
   */
  baseFilename?: string;
  /**
   * Hostname for sitemap index URLs.
   * @example "https://example.com"
   */
  hostname?: string;
  /**
   * Maximum bytes per sitemap.
   * @default MAX_BYTES_PER_SITEMAP (45MB)
   */
  maxBytes?: number;
  /**
   * Maximum URLs per sitemap.
   * @default MAX_URLS_PER_SITEMAP (50,000)
   */
  maxUrls?: number;
}

/**
 * Result of splitting routes into multiple sitemaps.
 *
 * @interface SplitResult
 * @since 0.1.0
 */
export interface SplitResult {
  /**
   * Sitemap index XML (only present if wasSplit is true).
   */
  indexXml?: string;
  /**
   * Individual sitemap chunks.
   */
  sitemaps: SitemapChunk[];
  /**
   * Whether splitting was required.
   */
  wasSplit: boolean;
}

/**
 * Estimate total output size for routes.
 * Useful for progress reporting and determining if splitting will be needed.
 *
 * @param {Route[]} routes - Array of routes to estimate size for
 * @returns {{ estimatedBytes: number, estimatedChunks: number, needsSplit: boolean }} Object containing size estimates
 * @returns {number} .estimatedBytes - Estimated total size in bytes
 * @returns {number} .estimatedChunks - Estimated number of chunks needed
 * @returns {boolean} .needsSplit - Whether splitting will be required
 *
 * @example
 * const routes = [{ url: 'https://example.com' }, { url: 'https://example.com/about' }];
 * const { estimatedBytes, estimatedChunks, needsSplit } = estimateTotalSize(routes);
 * console.log(`Estimated ${estimatedBytes} bytes in ${estimatedChunks} chunk(s)`);
 *
 * @since 0.1.0
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
 * Constructs the filename for a sitemap index file based on the base filename.
 *
 * @param {string} [baseFilename="sitemap"] - Base filename without extension
 * @returns {string} Index filename with "-index.xml" suffix
 *
 * @example
 * getSitemapIndexFilename(); // Returns "sitemap-index.xml"
 * getSitemapIndexFilename("pages"); // Returns "pages-index.xml"
 *
 * @since 0.1.0
 */
export function getSitemapIndexFilename(baseFilename = "sitemap"): string {
  return `${baseFilename}-index.xml`;
}

/**
 * Split routes into multiple sitemaps if needed.
 *
 * Splitting occurs when:
 * - More than 50,000 URLs (per sitemap protocol limit)
 * - Single sitemap exceeds 45MB (below 50MB limit with buffer)
 *
 * @param {Route[]} routes - All routes to include. Empty array returns single empty sitemap.
 * @param {SplitOptions} [options={}] - Split options for customizing behavior
 * @returns {SplitResult} Split result with chunks and optional sitemap index
 *
 * @example
 * const routes = [...]; // Array of 100,000 routes
 * const result = splitRoutes(routes, { hostname: 'https://example.com' });
 * if (result.wasSplit) {
 *   console.log(`Split into ${result.sitemaps.length} sitemaps`);
 *   console.log('Index:', result.indexXml);
 * }
 *
 * @since 0.1.0
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
 * Creates an XML sitemap index that references all individual sitemap chunks.
 *
 * @param {SitemapChunk[]} sitemaps - Array of sitemap chunks to include in the index
 * @param {string} [hostname] - Optional hostname to prepend to sitemap locations
 * @returns {string} Complete sitemap index XML string
 *
 * @see https://www.sitemaps.org/protocol.html#index
 * @since 0.1.0
 * @private
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
 * Calculates the size of XML declaration and empty urlset tags.
 *
 * @returns {number} Size in bytes of an empty sitemap XML
 *
 * @since 0.1.0
 * @private
 */
function getBaseXmlSize(): number {
  const emptyXml = buildSitemapXml([]);
  return calculateByteSize(emptyXml);
}

/**
 * Split routes into chunks respecting both URL count and byte size limits.
 *
 * Uses an incremental approach: iterates through routes and starts a new chunk
 * when adding the next route would exceed either limit.
 *
 * @param {Route[]} routes - Routes to split into chunks
 * @param {number} maxUrls - Maximum number of URLs per chunk
 * @param {number} maxBytes - Maximum byte size per chunk
 * @returns {Route[][]} Array of route chunks, each respecting the limits
 *
 * @example
 * const routes = [...]; // Array of 100,000 routes
 * const chunks = splitByUrlsAndSize(routes, 50000, 45 * 1024 * 1024);
 * console.log(`Split into ${chunks.length} chunks`);
 *
 * @since 0.1.0
 * @private
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
