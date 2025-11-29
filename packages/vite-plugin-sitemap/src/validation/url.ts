/**
 * URL validation utilities for sitemap protocol compliance.
 * URLs must be absolute and use http(s) protocol per RFC 3986.
 */

import picomatch from "picomatch";

/**
 * Maximum URL length per sitemap protocol.
 */
export const MAX_URL_LENGTH = 2048;

/**
 * URL validation result.
 */
export interface UrlValidationResult {
  error?: string;
  normalizedUrl?: string;
  suggestion?: string;
  valid: boolean;
}

/**
 * Validate a URL for sitemap compliance.
 * @returns true if valid, false otherwise
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
 * Supports glob patterns (*, **, ?) and RegExp.
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
