/**
 * URL validation utilities for sitemap protocol compliance.
 * URLs must be absolute and use http(s) protocol per RFC 3986.
 *
 * @module
 */

import picomatch from "picomatch";

/**
 * Maximum URL length per sitemap protocol.
 *
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export const MAX_URL_LENGTH = 2048;

/**
 * URL validation result.
 *
 * @since 0.1.0
 */
export interface UrlValidationResult {
  /**
   * Error message if validation failed.
   */
  error?: string;
  /**
   * Normalized URL after parsing.
   */
  normalizedUrl?: string;
  /**
   * Suggestion for fixing the error.
   */
  suggestion?: string;
  /**
   * Whether the URL is valid.
   */
  valid: boolean;
}

/**
 * Validate a URL for sitemap compliance.
 * Checks that URL is absolute, uses http(s) protocol, and meets length requirements.
 *
 * @param url - URL to validate
 * @returns True if valid for sitemap, false otherwise
 *
 * @example
 * isValidUrl('https://example.com'); // true
 * isValidUrl('http://example.com/page'); // true
 * isValidUrl('/relative/path'); // false
 * isValidUrl('ftp://example.com'); // false
 *
 * @see {@link https://www.sitemaps.org/protocol.html#escaping}
 * @since 0.1.0
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Check length limit
  if (url.length > MAX_URL_LENGTH) {
    return false;
  }

  try {
    const parsed = new URL(url);

    // Must be http or https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    // Must not have fragment (hash)
    if (parsed.hash) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a URL matches any exclusion pattern.
 * Supports glob patterns (*, **, ?) and RegExp for flexible URL filtering.
 *
 * @param url - URL to test against patterns
 * @param patterns - Array of glob patterns or RegExp
 * @returns True if URL matches any pattern, false otherwise
 *
 * @example
 * matchesExcludePattern('https://example.com/admin', ['/admin']); // true
 * matchesExcludePattern('https://example.com/api/users', ['/api/*']); // true
 * matchesExcludePattern('https://example.com/page', [/\/admin/]); // false
 *
 * @since 0.1.0
 */
export function matchesExcludePattern(url: string, patterns: Array<RegExp | string>): boolean {
  for (const pattern of patterns) {
    if (typeof pattern === "string") {
      if (picomatch.isMatch(url, pattern)) {
        return true;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(url)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Validate URL and return detailed result.
 * Provides comprehensive validation with helpful error messages and suggestions.
 *
 * @param url - URL to validate
 * @returns Validation result with error details and normalized URL
 *
 * @example
 * const result = validateUrl('https://example.com');
 * if (result.valid) {
 *   console.log('Normalized URL:', result.normalizedUrl);
 * } else {
 *   console.error(result.error);
 *   console.log('Suggestion:', result.suggestion);
 * }
 *
 * @see {@link https://www.sitemaps.org/protocol.html#escaping}
 * @since 0.1.0
 */
export function validateUrl(url: string): UrlValidationResult {
  if (!url || typeof url !== "string") {
    return {
      error: "URL is required and must be a string",
      suggestion: "Provide a valid absolute URL like 'https://example.com/page'",
      valid: false,
    };
  }

  if (url.length > MAX_URL_LENGTH) {
    return {
      error: `URL exceeds maximum length of ${MAX_URL_LENGTH} characters`,
      suggestion: `Shorten the URL to ${MAX_URL_LENGTH} characters or less`,
      valid: false,
    };
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        error: `Invalid protocol '${parsed.protocol}'. Only http: and https: are allowed`,
        suggestion: "Use https:// or http:// as the URL protocol",
        valid: false,
      };
    }

    if (parsed.hash) {
      return {
        error: "URL must not contain a fragment (hash)",
        suggestion: `Remove the fragment '#${parsed.hash.slice(1)}' from the URL`,
        valid: false,
      };
    }

    return { normalizedUrl: parsed.href, valid: true };
  } catch {
    return {
      error: "Invalid URL format",
      suggestion: "Ensure the URL is a valid absolute URL like 'https://example.com/page'",
      valid: false,
    };
  }
}
