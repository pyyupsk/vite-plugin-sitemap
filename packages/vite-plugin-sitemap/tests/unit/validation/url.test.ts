/**
 * URL validation tests.
 * Tests for url.ts module functions.
 */

import { describe, expect, it } from "vitest";

import {
  isValidUrl,
  matchesExcludePattern,
  MAX_URL_LENGTH,
  validateUrl,
} from "../../../src/validation/url";

describe("isValidUrl", () => {
  describe("valid URLs", () => {
    it("should return true for valid https URL", () => {
      expect(isValidUrl("https://example.com/")).toBe(true);
    });

    it("should return true for valid http URL", () => {
      expect(isValidUrl("http://example.com/")).toBe(true);
    });

    it("should return true for URL with path", () => {
      expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
    });

    it("should return true for URL with query string", () => {
      expect(isValidUrl("https://example.com/page?q=search&lang=en")).toBe(true);
    });

    it("should return true for URL with port", () => {
      expect(isValidUrl("https://example.com:8080/")).toBe(true);
    });

    it("should return true for URL with subdomain", () => {
      expect(isValidUrl("https://www.example.com/")).toBe(true);
    });

    it("should return true for URL with encoded characters", () => {
      expect(isValidUrl("https://example.com/path%20with%20spaces")).toBe(true);
    });
  });

  describe("invalid URLs", () => {
    it("should return false for URL without protocol", () => {
      expect(isValidUrl("example.com")).toBe(false);
    });

    it("should return false for URL with invalid protocol", () => {
      expect(isValidUrl("ftp://example.com/file")).toBe(false);
    });

    it("should return false for URL with fragment/hash", () => {
      expect(isValidUrl("https://example.com/page#section")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidUrl("")).toBe(false);
    });

    it("should return false for null/undefined", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(null)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(undefined)).toBe(false);
    });

    it("should return false for non-string input", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(123)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidUrl({})).toBe(false);
    });

    it("should return false for relative URL", () => {
      expect(isValidUrl("/relative/path")).toBe(false);
    });

    it("should return false for URL exceeding max length", () => {
      const longUrl = "https://example.com/" + "x".repeat(MAX_URL_LENGTH);
      expect(isValidUrl(longUrl)).toBe(false);
    });

    it("should return false for malformed URL", () => {
      expect(isValidUrl("https://")).toBe(false);
      expect(isValidUrl("https:///")).toBe(false);
    });
  });
});

describe("validateUrl", () => {
  describe("valid URLs", () => {
    it("should return valid result with normalized URL", () => {
      const result = validateUrl("https://example.com/page");
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe("https://example.com/page");
      expect(result.error).toBeUndefined();
    });

    it("should normalize URL with trailing slash", () => {
      const result = validateUrl("https://example.com");
      expect(result.valid).toBe(true);
      expect(result.normalizedUrl).toBe("https://example.com/");
    });
  });

  describe("invalid URLs with suggestions", () => {
    it("should return error for empty URL with suggestion", () => {
      const result = validateUrl("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("URL is required and must be a string");
      expect(result.suggestion).toContain("valid absolute URL");
    });

    it("should return error for URL without protocol with suggestion", () => {
      const result = validateUrl("example.com/page");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid URL format");
      expect(result.suggestion).toContain("valid absolute URL");
    });

    it("should return error for invalid protocol with suggestion", () => {
      const result = validateUrl("ftp://example.com/file");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid protocol");
      expect(result.suggestion).toContain("https://");
    });

    it("should return error for URL with fragment with suggestion", () => {
      const result = validateUrl("https://example.com/page#section");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("fragment");
      expect(result.suggestion).toContain("Remove the fragment");
    });

    it("should return error for URL exceeding max length with suggestion", () => {
      const longUrl = "https://example.com/" + "x".repeat(MAX_URL_LENGTH);
      const result = validateUrl(longUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum length");
      expect(result.suggestion).toContain("Shorten");
    });
  });
});

describe("matchesExcludePattern", () => {
  describe("string patterns (glob-style)", () => {
    it("should match exact URL", () => {
      expect(
        matchesExcludePattern("https://example.com/admin", ["https://example.com/admin"]),
      ).toBe(true);
    });

    it("should match URL with wildcard", () => {
      expect(
        matchesExcludePattern("https://example.com/admin/users", ["https://example.com/admin/*"]),
      ).toBe(true);
    });

    it("should match URL with double wildcard", () => {
      expect(
        matchesExcludePattern("https://example.com/admin/users/123", [
          "https://example.com/admin/**",
        ]),
      ).toBe(true);
    });

    it("should match URL with ? wildcard", () => {
      expect(
        matchesExcludePattern("https://example.com/page1", ["https://example.com/page?"]),
      ).toBe(true);
    });

    it("should not match non-matching URL", () => {
      expect(
        matchesExcludePattern("https://example.com/public", ["https://example.com/admin/*"]),
      ).toBe(false);
    });
  });

  describe("RegExp patterns", () => {
    it("should match URL with regex pattern", () => {
      expect(matchesExcludePattern("https://example.com/admin/users", [/\/admin\//])).toBe(true);
    });

    it("should match URL with complex regex", () => {
      expect(matchesExcludePattern("https://example.com/page123", [/\/page\d+$/])).toBe(true);
    });

    it("should not match non-matching regex", () => {
      expect(matchesExcludePattern("https://example.com/public", [/\/admin\//])).toBe(false);
    });
  });

  describe("multiple patterns", () => {
    it("should match if any pattern matches", () => {
      expect(
        matchesExcludePattern("https://example.com/admin", [
          "https://example.com/private/*",
          "https://example.com/admin",
        ]),
      ).toBe(true);
    });

    it("should not match if no patterns match", () => {
      expect(
        matchesExcludePattern("https://example.com/public", [
          "https://example.com/private/*",
          "https://example.com/admin/*",
        ]),
      ).toBe(false);
    });

    it("should handle mixed string and regex patterns", () => {
      expect(
        matchesExcludePattern("https://example.com/api/v1/users", [
          "https://example.com/admin/*",
          /\/api\/v\d+\//,
        ]),
      ).toBe(true);
    });
  });

  describe("empty patterns", () => {
    it("should return false for empty patterns array", () => {
      expect(matchesExcludePattern("https://example.com/page", [])).toBe(false);
    });
  });
});

describe("MAX_URL_LENGTH", () => {
  it("should be 2048 as per sitemap protocol", () => {
    expect(MAX_URL_LENGTH).toBe(2048);
  });
});
