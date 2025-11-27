/**
 * Invalid input edge case tests.
 * Tests handling of malformed, invalid, or unexpected input.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../src/types/sitemap";

import { generateSitemap, validateRoutes } from "../../src/core/generator";
import { isValidW3CDatetime, validateW3CDatetime } from "../../src/validation/date";
import { isValidUrl, validateUrl } from "../../src/validation/url";

describe("invalid input handling", () => {
  describe("URL validation edge cases", () => {
    it("should reject null as URL", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(null)).toBe(false);
    });

    it("should reject undefined as URL", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(undefined)).toBe(false);
    });

    it("should reject number as URL", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl(123)).toBe(false);
    });

    it("should reject object as URL", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl({})).toBe(false);
    });

    it("should reject array as URL", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidUrl([])).toBe(false);
    });

    it("should reject URL with only spaces", () => {
      expect(isValidUrl("   ")).toBe(false);
    });

    it("should reject URL with only protocol", () => {
      expect(isValidUrl("https://")).toBe(false);
    });

    it("should reject URL with invalid protocol", () => {
      expect(isValidUrl("ftp://example.com")).toBe(false);
    });

    it("should reject URL with fragment", () => {
      expect(isValidUrl("https://example.com/#section")).toBe(false);
    });

    it("should provide helpful error for empty URL", () => {
      const result = validateUrl("");

      expect(result.valid).toBe(false);
      expect(result.suggestion).toBeDefined();
    });

    it("should provide helpful error for missing protocol", () => {
      const result = validateUrl("example.com");

      expect(result.valid).toBe(false);
      expect(result.suggestion).toContain("https://");
    });
  });

  describe("date validation edge cases", () => {
    it("should reject null as date", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(null)).toBe(false);
    });

    it("should reject undefined as date", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(undefined)).toBe(false);
    });

    it("should reject number as date", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(20240115)).toBe(false);
    });

    it("should reject date with slashes", () => {
      expect(isValidW3CDatetime("2024/01/15")).toBe(false);
    });

    it("should reject invalid month 13", () => {
      expect(isValidW3CDatetime("2024-13-01")).toBe(false);
    });

    it("should reject invalid month 00", () => {
      expect(isValidW3CDatetime("2024-00-01")).toBe(false);
    });

    it("should reject invalid day 32", () => {
      expect(isValidW3CDatetime("2024-01-32")).toBe(false);
    });

    it("should reject invalid day 00", () => {
      expect(isValidW3CDatetime("2024-01-00")).toBe(false);
    });

    it("should reject February 30", () => {
      expect(isValidW3CDatetime("2024-02-30")).toBe(false);
    });

    it("should reject Feb 29 in non-leap year", () => {
      expect(isValidW3CDatetime("2023-02-29")).toBe(false);
    });

    it("should provide helpful error for invalid format", () => {
      const result = validateW3CDatetime("2024/01/15");

      expect(result.valid).toBe(false);
      expect(result.examples).toBeDefined();
    });
  });

  describe("route validation edge cases", () => {
    it("should reject route without URL", () => {
      const routes = [{}] as Route[];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });

    it("should reject route with invalid priority type", () => {
      const routes: Route[] = [
        // @ts-expect-error - testing invalid input
        { priority: "high", url: "https://example.com/" },
      ];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });

    it("should reject route with priority > 1", () => {
      const routes: Route[] = [{ priority: 1.5, url: "https://example.com/" }];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });

    it("should reject route with priority < 0", () => {
      const routes: Route[] = [{ priority: -0.5, url: "https://example.com/" }];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });

    it("should reject route with invalid changefreq", () => {
      const routes: Route[] = [
        // @ts-expect-error - testing invalid input
        { changefreq: "sometimes", url: "https://example.com/" },
      ];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });

    it("should reject route with invalid lastmod format", () => {
      const routes: Route[] = [{ lastmod: "yesterday", url: "https://example.com/" }];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(false);
    });
  });

  describe("generateSitemap with invalid routes", () => {
    it("should fail for routes with invalid URLs", async () => {
      const routes: Route[] = [{ url: "not-a-url" }];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
      expect(result.validation.valid).toBe(false);
    });

    it("should include error details in validation result", async () => {
      const routes: Route[] = [{ url: "invalid" }];

      const result = await generateSitemap(routes);

      expect(result.validation.errors.length).toBeGreaterThan(0);
      expect(result.validation.errors[0]!.path).toBeDefined();
    });

    it("should validate all routes and report all errors", async () => {
      const routes: Route[] = [{ url: "invalid1" }, { url: "invalid2" }, { url: "invalid3" }];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
      expect(result.validation.errors.length).toBe(3);
    });

    it("should skip validation when skipValidation option is true", async () => {
      const routes: Route[] = [{ url: "invalid" }];

      const result = await generateSitemap(routes, { skipValidation: true });

      expect(result.success).toBe(true);
    });
  });

  describe("edge cases in extensions", () => {
    it("should reject image without loc", async () => {
      const routes: Route[] = [
        {
          // @ts-expect-error - testing invalid input
          images: [{ caption: "Test" }],
          url: "https://example.com/",
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
    });

    it("should reject video without required fields", async () => {
      const routes: Route[] = [
        {
          url: "https://example.com/",
          // @ts-expect-error - testing invalid input
          videos: [{ title: "Test" }],
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
    });

    it("should reject alternate without href", async () => {
      const routes: Route[] = [
        {
          // @ts-expect-error - testing invalid input
          alternates: [{ hreflang: "en" }],
          url: "https://example.com/",
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
    });

    it("should reject alternate without hreflang", async () => {
      const routes: Route[] = [
        {
          // @ts-expect-error - testing invalid input
          alternates: [{ href: "https://example.com/en/" }],
          url: "https://example.com/",
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(false);
    });
  });
});
