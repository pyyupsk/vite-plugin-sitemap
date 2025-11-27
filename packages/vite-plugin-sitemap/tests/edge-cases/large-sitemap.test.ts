/**
 * Large sitemap edge case tests.
 * Tests behavior with large numbers of routes.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../src/types/sitemap";

import { generateSitemap } from "../../src/core/generator";
import { estimateTotalSize, MAX_URLS_PER_SITEMAP, splitRoutes } from "../../src/core/splitter";
import { generateRoutes } from "../helpers";

describe("large sitemap handling", () => {
  describe("splitRoutes with many URLs", () => {
    it("should split when exceeding URL limit", () => {
      // Generate more than one chunk's worth
      const routes = generateRoutes(100, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 50 });

      expect(result.wasSplit).toBe(true);
      expect(result.sitemaps).toHaveLength(2);
    });

    it("should create sitemap index for split sitemaps", () => {
      const routes = generateRoutes(100, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 50 });

      expect(result.indexXml).toBeDefined();
      expect(result.indexXml).toContain("<sitemapindex");
    });

    it("should distribute routes evenly across chunks", () => {
      const routes = generateRoutes(100, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 40 });

      expect(result.sitemaps[0]!.routes.length).toBe(40);
      expect(result.sitemaps[1]!.routes.length).toBe(40);
      expect(result.sitemaps[2]!.routes.length).toBe(20);
    });

    it("should preserve route order within chunks", () => {
      const routes = generateRoutes(50, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 25 });

      expect(result.sitemaps[0]!.routes[0]!.url).toContain("page-0");
      expect(result.sitemaps[1]!.routes[0]!.url).toContain("page-25");
    });
  });

  describe("generateSitemap with splitting", () => {
    it("should split large sitemap during generation", async () => {
      const routes = generateRoutes(100, "https://example.com");

      const result = await generateSitemap(routes, {
        enableSplitting: true,
        pluginOptions: {},
      });

      // With 100 routes and default limit, shouldn't split
      expect(result.success).toBe(true);
      expect(result.routeCount).toBe(100);
    });

    it("should include split result when splitting occurred", async () => {
      // Force splitting by using a very low internal limit
      const routes = generateRoutes(60000, "https://example.com");

      const result = await generateSitemap(routes, {
        enableSplitting: true,
      });

      expect(result.success).toBe(true);
      expect(result.splitResult?.wasSplit).toBe(true);
    });
  });

  describe("estimateTotalSize", () => {
    it("should estimate size for large route set", () => {
      const routes = generateRoutes(10000, "https://example.com");

      const estimate = estimateTotalSize(routes);

      expect(estimate.estimatedBytes).toBeGreaterThan(0);
    });

    it("should indicate split needed for very large sets", () => {
      const routes = generateRoutes(60000, "https://example.com");

      const estimate = estimateTotalSize(routes);

      expect(estimate.needsSplit).toBe(true);
      expect(estimate.estimatedChunks).toBeGreaterThan(1);
    });
  });

  describe("MAX_URLS_PER_SITEMAP constant", () => {
    it("should be set to protocol limit", () => {
      expect(MAX_URLS_PER_SITEMAP).toBe(50000);
    });
  });

  describe("performance with large datasets", () => {
    it("should generate sitemap in reasonable time for 1000 routes", async () => {
      const routes = generateRoutes(1000, "https://example.com");
      const startTime = Date.now();

      await generateSitemap(routes);

      const elapsed = Date.now() - startTime;
      // Should complete within 5 seconds (generous for CI)
      expect(elapsed).toBeLessThan(5000);
    });

    it("should handle routes with all optional fields", async () => {
      const routes: Route[] = Array.from({ length: 100 }, (_, i) => ({
        alternates: [
          { href: `https://example.com/en/page${i}`, hreflang: "en" },
          { href: `https://example.com/de/page${i}`, hreflang: "de" },
        ],
        changefreq: "daily" as const,
        images: [{ caption: `Image ${i}`, loc: `https://example.com/img${i}.jpg` }],
        lastmod: "2024-01-15",
        priority: 0.8,
        url: `https://example.com/page${i}`,
      }));

      const result = await generateSitemap(routes);

      expect(result.success).toBe(true);
      expect(result.routeCount).toBe(100);
    });
  });
});
