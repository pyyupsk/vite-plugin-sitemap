/**
 * robots.txt generation and management utilities.
 * Handles reading, updating, and creating robots.txt files with Sitemap directives.
 *
 * @module
 */

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Result of robots.txt update operation.
 */
export interface RobotsTxtResult {
  /** Action taken: 'created', 'updated', 'unchanged' */
  action: "created" | "unchanged" | "updated";
  /** Error message if operation failed */
  error?: string;
  /** Path to the robots.txt file */
  path: string;
  /** Whether the operation was successful */
  success: boolean;
}

/**
 * Append a Sitemap directive to robots.txt content.
 * Ensures proper formatting with newlines and preserves existing content.
 *
 * @param content - Current robots.txt content (may be empty)
 * @param sitemapUrl - URL of the sitemap to add
 * @returns Updated robots.txt content with Sitemap directive appended
 *
 * @example
 * const content = 'User-agent: *\nAllow: /\n';
 * const updated = appendSitemapDirective(content, 'https://example.com/sitemap.xml');
 * // Result: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n'
 *
 * @since 0.1.0
 */
export function appendSitemapDirective(content: string, sitemapUrl: string): string {
  const directive = `Sitemap: ${sitemapUrl}`;

  // If content is empty, just return the directive with newline
  if (!content.trim()) {
    return `${directive}\n`;
  }

  // Ensure content ends with newline before adding directive
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;

  return `${normalizedContent}${directive}\n`;
}

/**
 * Build the absolute sitemap URL from hostname and filename.
 * Handles trailing slashes and leading slashes to produce a valid URL.
 *
 * @param hostname - Base hostname (e.g., 'https://example.com')
 * @param filename - Sitemap filename (e.g., 'sitemap.xml' or 'sitemap-index.xml')
 * @returns Absolute sitemap URL
 *
 * @example
 * buildSitemapUrl('https://example.com', 'sitemap.xml');
 * // Returns: 'https://example.com/sitemap.xml'
 *
 * buildSitemapUrl('https://example.com/', '/sitemap-index.xml');
 * // Returns: 'https://example.com/sitemap-index.xml'
 *
 * @since 0.1.0
 */
export function buildSitemapUrl(hostname: string, filename: string): string {
  // Ensure hostname doesn't end with slash
  const normalizedHostname = hostname.replace(/\/+$/, "");

  // Ensure filename doesn't start with slash
  const normalizedFilename = filename.replace(/^\/+/, "");

  return `${normalizedHostname}/${normalizedFilename}`;
}

/**
 * Create a minimal robots.txt with Sitemap directive.
 * Includes a default User-agent: * rule allowing all crawlers.
 *
 * @param sitemapUrl - Absolute URL of the sitemap
 * @returns Complete robots.txt content with User-agent rule and Sitemap directive
 *
 * @example
 * const content = createMinimalRobotsTxt('https://example.com/sitemap.xml');
 * // Returns:
 * // User-agent: *
 * // Allow: /
 * //
 * // Sitemap: https://example.com/sitemap.xml
 *
 * @since 0.1.0
 */
export function createMinimalRobotsTxt(sitemapUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

/**
 * Extract all Sitemap URLs from robots.txt content.
 * Parses the content line by line to find all Sitemap directives.
 *
 * @param content - robots.txt content to parse
 * @returns Array of sitemap URLs found in the content
 *
 * @example
 * const content = 'User-agent: *\nSitemap: https://example.com/sitemap.xml\n';
 * const urls = extractSitemapUrls(content);
 * // Returns: ['https://example.com/sitemap.xml']
 *
 * @since 0.1.0
 */
export function extractSitemapUrls(content: string): string[] {
  const urls: string[] = [];
  const lines = content.split(/\r?\n/);
  const sitemapRegex = /^\s*sitemap\s*:\s*(.+?)\s*$/i;

  for (const line of lines) {
    const match = sitemapRegex.exec(line);
    if (match?.[1]) {
      urls.push(match[1].trim());
    }
  }

  return urls;
}

/**
 * Check if robots.txt contains a Sitemap directive for the given URL.
 * Performs case-insensitive matching per the robots.txt specification.
 *
 * @param content - Current robots.txt content
 * @param sitemapUrl - URL of the sitemap to check for
 * @returns True if the sitemap URL is already present
 *
 * @example
 * const content = 'Sitemap: https://example.com/sitemap.xml\n';
 * hasSitemapDirective(content, 'https://example.com/sitemap.xml'); // true
 * hasSitemapDirective(content, 'https://example.com/other.xml'); // false
 *
 * @since 0.1.0
 */
export function hasSitemapDirective(content: string, sitemapUrl: string): boolean {
  // Normalize the URL for comparison (trim whitespace)
  const normalizedUrl = sitemapUrl.trim();

  // Split into lines and check each one
  const lines = content.split(/\r?\n/);

  const sitemapRegex = /^\s*sitemap\s*:\s*(.+?)\s*$/i;

  for (const line of lines) {
    // Match "Sitemap:" directive (case-insensitive per robots.txt spec)
    const match = sitemapRegex.exec(line);
    if (match?.[1]) {
      const existingUrl = match[1].trim();
      if (existingUrl === normalizedUrl) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Update or create robots.txt with a Sitemap directive.
 * Reads existing robots.txt, checks for existing directive, and updates or creates as needed.
 *
 * @param outDir - Output directory where robots.txt should be written
 * @param sitemapUrl - Absolute URL of the sitemap
 * @param [options] - Optional configuration
 * @param [options.createIfMissing] - If true, create a minimal robots.txt if one doesn't exist
 * @returns Result of the operation with action taken
 *
 * @example
 * const result = await updateRobotsTxt('/dist', 'https://example.com/sitemap.xml');
 * if (result.success) {
 *   console.log(`Action: ${result.action}`); // 'created', 'updated', or 'unchanged'
 * }
 *
 * @since 0.1.0
 */
export async function updateRobotsTxt(
  outDir: string,
  sitemapUrl: string,
  options: {
    /** If true, create a minimal robots.txt if one doesn't exist. Default: true */
    createIfMissing?: boolean;
  } = {},
): Promise<RobotsTxtResult> {
  const { createIfMissing = true } = options;
  const robotsPath = join(outDir, "robots.txt");

  try {
    // Check if robots.txt exists
    if (existsSync(robotsPath)) {
      // Read existing content
      const content = await readFile(robotsPath, "utf-8");

      // Check if sitemap directive already exists
      if (hasSitemapDirective(content, sitemapUrl)) {
        return {
          action: "unchanged",
          path: robotsPath,
          success: true,
        };
      }

      // Append sitemap directive
      const updatedContent = appendSitemapDirective(content, sitemapUrl);
      await writeFile(robotsPath, updatedContent, "utf-8");

      return {
        action: "updated",
        path: robotsPath,
        success: true,
      };
    }

    // robots.txt doesn't exist
    if (createIfMissing) {
      // Create minimal robots.txt
      const content = createMinimalRobotsTxt(sitemapUrl);
      await writeFile(robotsPath, content, "utf-8");

      return {
        action: "created",
        path: robotsPath,
        success: true,
      };
    }

    // Don't create if not requested
    return {
      action: "unchanged",
      path: robotsPath,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      action: "unchanged",
      error: `Failed to update robots.txt: ${message}`,
      path: robotsPath,
      success: false,
    };
  }
}
