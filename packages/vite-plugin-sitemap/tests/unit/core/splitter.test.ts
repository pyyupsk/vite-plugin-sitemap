/**
 * Sitemap splitter tests.
 * Tests for splitter.ts module functions.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../../src/types/sitemap";

import {
  estimateTotalSize,
  getSitemapIndexFilename,
  MAX_BYTES_PER_SITEMAP,
  MAX_URLS_PER_SITEMAP,
  splitRoutes,
} from "../../../src/core/splitter";
import { generateRoutes } from "../../helpers";

describe("constants", () => {
  it("should export MAX_URLS_PER_SITEMAP as 50000", () => {
    expect(MAX_URLS_PER_SITEMAP).toBe(50000);
  });

  it("should export MAX_BYTES_PER_SITEMAP as 45MB", () => {
    expect(MAX_BYTES_PER_SITEMAP).toBe(45 * 1024 * 1024);
  });
});

describe("getSitemapIndexFilename", () => {
  it("should return default sitemap-index.xml", () => {
    expect(getSitemapIndexFilename()).toBe("sitemap-index.xml");
  });

  it("should use custom base filename", () => {
    expect(getSitemapIndexFilename("custom")).toBe("custom-index.xml");
  });

  it("should handle base filename with dashes", () => {
    expect(getSitemapIndexFilename("my-sitemap")).toBe("my-sitemap-index.xml");
  });
});

describe("splitRoutes", () => {
  describe("no splitting needed", () => {
    it("should return single sitemap for small route set", () => {
      const routes: Route[] = [
        { url: "https://example.com/" },
        { url: "https://example.com/about" },
      ];

      const result = splitRoutes(routes);

      expect(result.wasSplit).toBe(false);
      expect(result.sitemaps).toHaveLength(1);
      expect(result.indexXml).toBeUndefined();
    });

    it("should include routes in single sitemap", () => {
      const routes: Route[] = [
        { url: "https://example.com/" },
        { url: "https://example.com/about" },
      ];

      const result = splitRoutes(routes);

      expect(result.sitemaps[0]!.routes).toHaveLength(2);
      expect(result.sitemaps[0]!.xml).toContain("https://example.com/");
      expect(result.sitemaps[0]!.xml).toContain("https://example.com/about");
    });

    it("should set correct filename for single sitemap", () => {
      const routes: Route[] = [{ url: "https://example.com/" }];

      const result = splitRoutes(routes);

      expect(result.sitemaps[0]!.filename).toBe("sitemap.xml");
    });

    it("should use custom base filename", () => {
      const routes: Route[] = [{ url: "https://example.com/" }];

      const result = splitRoutes(routes, { baseFilename: "custom" });

      expect(result.sitemaps[0]!.filename).toBe("custom.xml");
    });

    it("should calculate byte size for single sitemap", () => {
      const routes: Route[] = [{ url: "https://example.com/" }];

      const result = splitRoutes(routes);

      expect(result.sitemaps[0]!.byteSize).toBeGreaterThan(0);
    });
  });

  describe("splitting by URL count", () => {
    it("should split when exceeding maxUrls", () => {
      // Create enough routes to trigger split with low maxUrls
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.wasSplit).toBe(true);
      expect(result.sitemaps.length).toBeGreaterThan(1);
    });

    it("should create sitemap index when split", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.indexXml).toBeDefined();
      expect(result.indexXml).toContain("<sitemapindex");
    });

    it("should number split sitemaps correctly", () => {
      const routes = generateRoutes(25, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.sitemaps[0]!.filename).toBe("sitemap-0.xml");
      expect(result.sitemaps[1]!.filename).toBe("sitemap-1.xml");
      expect(result.sitemaps[2]!.filename).toBe("sitemap-2.xml");
    });

    it("should distribute routes across chunks", () => {
      const routes = generateRoutes(25, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.sitemaps[0]!.routes.length).toBe(10);
      expect(result.sitemaps[1]!.routes.length).toBe(10);
      expect(result.sitemaps[2]!.routes.length).toBe(5);
    });

    it("should set index for each chunk", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.sitemaps[0]!.index).toBe(0);
      expect(result.sitemaps[1]!.index).toBe(1);
    });
  });

  describe("sitemap index content", () => {
    it("should include all sitemap locations in index", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.indexXml).toContain("sitemap-0.xml");
      expect(result.indexXml).toContain("sitemap-1.xml");
    });

    it("should include hostname in sitemap URLs when provided", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, {
        hostname: "https://example.com",
        maxUrls: 10,
      });

      expect(result.indexXml).toContain("https://example.com/sitemap-0.xml");
      expect(result.indexXml).toContain("https://example.com/sitemap-1.xml");
    });

    it("should handle hostname with trailing slash", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, {
        hostname: "https://example.com/",
        maxUrls: 10,
      });

      expect(result.indexXml).toContain("https://example.com/sitemap-0.xml");
    });

    it("should include lastmod in sitemap index entries", () => {
      const routes = generateRoutes(15, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.indexXml).toContain("<lastmod>");
    });
  });

  describe("edge cases", () => {
    it("should handle empty routes array", () => {
      const result = splitRoutes([]);

      expect(result.wasSplit).toBe(false);
      expect(result.sitemaps).toHaveLength(1);
      expect(result.sitemaps[0]!.routes).toHaveLength(0);
    });

    it("should handle exactly maxUrls routes", () => {
      const routes = generateRoutes(10, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.wasSplit).toBe(false);
      expect(result.sitemaps).toHaveLength(1);
    });

    it("should handle maxUrls + 1 routes", () => {
      const routes = generateRoutes(11, "https://example.com");

      const result = splitRoutes(routes, { maxUrls: 10 });

      expect(result.wasSplit).toBe(true);
      expect(result.sitemaps).toHaveLength(2);
    });
  });
});

describe("estimateTotalSize", () => {
  it("should estimate size for small route set", () => {
    const routes: Route[] = [{ url: "https://example.com/" }, { url: "https://example.com/about" }];

    const estimate = estimateTotalSize(routes);

    expect(estimate.estimatedBytes).toBeGreaterThan(0);
    expect(estimate.needsSplit).toBe(false);
    expect(estimate.estimatedChunks).toBe(1);
  });

  it("should estimate needs split for many routes", () => {
    // Create routes that would exceed URL limit
    const routes = generateRoutes(60000, "https://example.com");

    const estimate = estimateTotalSize(routes);

    expect(estimate.needsSplit).toBe(true);
    expect(estimate.estimatedChunks).toBeGreaterThan(1);
  });

  it("should handle empty routes array", () => {
    const estimate = estimateTotalSize([]);

    expect(estimate.estimatedBytes).toBeGreaterThan(0); // Base XML size
    expect(estimate.needsSplit).toBe(false);
    expect(estimate.estimatedChunks).toBe(1);
  });

  it("should return reasonable byte estimate", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const estimate = estimateTotalSize(routes);

    // Should be at least 100 bytes for even minimal sitemap
    expect(estimate.estimatedBytes).toBeGreaterThan(100);
    // Should be less than 1KB for single simple route
    expect(estimate.estimatedBytes).toBeLessThan(1024);
  });
});
