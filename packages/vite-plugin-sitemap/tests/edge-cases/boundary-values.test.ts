/**
 * Boundary value edge case tests.
 * Tests handling of values at or near limits.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../src/types/sitemap";

import { validateRoutes } from "../../src/core/generator";
import { routeSchema } from "../../src/validation/schemas";
import { isValidUrl, MAX_URL_LENGTH } from "../../src/validation/url";

describe("boundary value handling", () => {
  describe("URL length limits", () => {
    it("should accept URL at maximum length", () => {
      // Create URL exactly at max length
      const baseUrl = "https://example.com/";
      const padding = "x".repeat(MAX_URL_LENGTH - baseUrl.length);
      const maxUrl = baseUrl + padding;

      expect(maxUrl.length).toBe(MAX_URL_LENGTH);
      expect(isValidUrl(maxUrl)).toBe(true);
    });

    it("should reject URL exceeding maximum length", () => {
      const baseUrl = "https://example.com/";
      const padding = "x".repeat(MAX_URL_LENGTH);
      const longUrl = baseUrl + padding;

      expect(longUrl.length).toBeGreaterThan(MAX_URL_LENGTH);
      expect(isValidUrl(longUrl)).toBe(false);
    });

    it("should export MAX_URL_LENGTH as 2048", () => {
      expect(MAX_URL_LENGTH).toBe(2048);
    });
  });

  describe("priority range", () => {
    it("should accept priority 0.0", () => {
      const result = routeSchema.safeParse({
        priority: 0.0,
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should accept priority 0.5", () => {
      const result = routeSchema.safeParse({
        priority: 0.5,
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should accept priority 1.0", () => {
      const result = routeSchema.safeParse({
        priority: 1.0,
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should reject priority just below 0", () => {
      const result = routeSchema.safeParse({
        priority: -0.001,
        url: "https://example.com/",
      });

      expect(result.success).toBe(false);
    });

    it("should reject priority just above 1", () => {
      const result = routeSchema.safeParse({
        priority: 1.001,
        url: "https://example.com/",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("changefreq values", () => {
    const validFrequencies = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

    it.each(validFrequencies)("should accept changefreq '%s'", (freq) => {
      const result = routeSchema.safeParse({
        changefreq: freq,
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid changefreq", () => {
      const result = routeSchema.safeParse({
        changefreq: "sometimes",
        url: "https://example.com/",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("image limits", () => {
    it("should accept maximum 1000 images per URL", () => {
      const images = Array.from({ length: 1000 }, (_, i) => ({
        loc: `https://example.com/img${i}.jpg`,
      }));

      const result = routeSchema.safeParse({
        images,
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should reject more than 1000 images per URL", () => {
      const images = Array.from({ length: 1001 }, (_, i) => ({
        loc: `https://example.com/img${i}.jpg`,
      }));

      const result = routeSchema.safeParse({
        images,
        url: "https://example.com/",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("video duration limits", () => {
    it("should accept video duration of 1 second", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            duration: 1,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should accept video duration of 28800 seconds (8 hours max)", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            duration: 28800,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should reject video duration exceeding 28800 seconds", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            duration: 28801,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("video rating limits", () => {
    it("should accept rating of 0.0", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            rating: 0.0,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should accept rating of 5.0", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            rating: 5.0,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should reject rating exceeding 5.0", () => {
      const result = routeSchema.safeParse({
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            rating: 5.1,
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("date boundary values", () => {
    it("should accept year-only date (minimum precision)", () => {
      const routes: Route[] = [{ lastmod: "2024", url: "https://example.com/" }];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(true);
    });

    it("should accept full datetime with timezone (maximum precision)", () => {
      const routes: Route[] = [
        { lastmod: "2024-01-15T10:30:00+05:30", url: "https://example.com/" },
      ];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(true);
    });

    it("should accept leap year February 29", () => {
      const routes: Route[] = [{ lastmod: "2024-02-29", url: "https://example.com/" }];

      const result = validateRoutes(routes);

      expect(result.valid).toBe(true);
    });
  });

  describe("stock ticker limit for news", () => {
    it("should accept up to 5 stock tickers", () => {
      const result = routeSchema.safeParse({
        news: {
          publication: { language: "en", name: "Test" },
          publication_date: "2024-01-15",
          stock_tickers: "A, B, C, D, E",
          title: "Test",
        },
        url: "https://example.com/",
      });

      expect(result.success).toBe(true);
    });

    it("should reject more than 5 stock tickers", () => {
      const result = routeSchema.safeParse({
        news: {
          publication: { language: "en", name: "Test" },
          publication_date: "2024-01-15",
          stock_tickers: "A, B, C, D, E, F",
          title: "Test",
        },
        url: "https://example.com/",
      });

      expect(result.success).toBe(false);
    });
  });
});
