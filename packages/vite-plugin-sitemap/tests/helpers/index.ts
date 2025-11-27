/**
 * Test helper utilities.
 * Provides common utilities for test setup and assertions.
 */

import { join } from "node:path";

/**
 * Create a long URL for testing length limits.
 *
 * @param length Target length of the URL
 * @returns URL string of approximately the specified length
 */
export function createLongUrl(length: number): string {
  const base = "https://example.com/";
  const remaining = Math.max(0, length - base.length);
  return base + "x".repeat(remaining);
}

/**
 * Parse XML to extract loc values from a sitemap.
 * Simple regex-based extraction for testing.
 *
 * @param xml Sitemap XML string
 * @returns Array of URLs found in <loc> elements
 */
export function extractLocValues(xml: string): string[] {
  const regex = /<loc>([^<]+)<\/loc>/g;
  const matches: string[] = [];
  let match: null | RegExpExecArray;

  while ((match = regex.exec(xml)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }

  return matches;
}

/**
 * Generate routes for testing large sitemaps.
 *
 * @param count Number of routes to generate
 * @param hostname Optional hostname prefix (default: "https://example.com")
 * @returns Array of route objects
 */
export function generateRoutes(
  count: number,
  hostname = "https://example.com",
): Array<{ url: string }> {
  return Array.from({ length: count }, (_, i) => ({
    url: `${hostname}/page-${i}`,
  }));
}

/**
 * Get the absolute path to a fixture file.
 *
 * @param type "valid" or "invalid"
 * @param name Fixture filename without extension (e.g., "basic-sitemap")
 * @returns Absolute path to the fixture file
 */
export function getFixturePath(type: "invalid" | "valid", name: string): string {
  return join(__dirname, "..", "fixtures", type, `${name}.ts`);
}

/**
 * Load a fixture module dynamically.
 *
 * @param type "valid" or "invalid"
 * @param name Fixture filename without extension
 * @returns The default export from the fixture
 */
export async function loadFixture<T>(type: "invalid" | "valid", name: string): Promise<T> {
  const path = getFixturePath(type, name);
  const module = await import(path);
  return module.default as T;
}

/**
 * Normalize XML for comparison by removing whitespace differences.
 *
 * @param xml XML string to normalize
 * @returns Normalized XML string
 */
export function normalizeXml(xml: string): string {
  return xml
    .replaceAll(/>\s+</g, "><") // Remove whitespace between tags
    .replaceAll(/\s+/g, " ") // Normalize internal whitespace
    .trim();
}

/**
 * Assert that XML contains expected elements.
 *
 * @param xml XML string to check
 * @param elements Array of element names or patterns
 * @returns true if all elements are found
 */
export function xmlContains(xml: string, elements: string[]): boolean {
  return elements.every((el) => xml.includes(el));
}

export { type CliResult, runCli } from "./cli";

// Re-export other helpers
export { cleanupTempDir, createTempDir } from "./temp-dir";
export { createViteProject, type ViteProjectContext } from "./vite-project";
