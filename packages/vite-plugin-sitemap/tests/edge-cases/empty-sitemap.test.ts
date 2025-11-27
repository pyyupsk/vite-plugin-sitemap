/**
 * Empty sitemap edge case tests.
 * Tests behavior with empty or minimal route sets.
 */

import { describe, expect, it } from "vitest";

import { generateSitemap } from "../../src/core/generator";
import { splitRoutes } from "../../src/core/splitter";
import { buildSitemapXml } from "../../src/xml/builder";

describe("empty sitemap handling", () => {
  describe("generateSitemap with empty routes", () => {
    it("should succeed with empty routes array", async () => {
      const result = await generateSitemap([]);

      expect(result.success).toBe(true);
      expect(result.routeCount).toBe(0);
    });

    it("should generate valid XML for empty routes", async () => {
      const result = await generateSitemap([]);

      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result.xml).toContain("<urlset");
      expect(result.xml).toContain("</urlset>");
    });

    it("should not contain any URL elements", async () => {
      const result = await generateSitemap([]);

      expect(result.xml).not.toContain("<url>");
      expect(result.xml).not.toContain("<loc>");
    });
  });

  describe("buildSitemapXml with empty routes", () => {
    it("should build valid XML structure", () => {
      const xml = buildSitemapXml([]);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<urlset");
      expect(xml).toContain("</urlset>");
    });

    it("should only include base namespace", () => {
      const xml = buildSitemapXml([]);

      expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(xml).not.toContain("xmlns:image");
      expect(xml).not.toContain("xmlns:video");
      expect(xml).not.toContain("xmlns:news");
    });
  });

  describe("splitRoutes with empty routes", () => {
    it("should return single empty sitemap", () => {
      const result = splitRoutes([]);

      expect(result.wasSplit).toBe(false);
      expect(result.sitemaps).toHaveLength(1);
      expect(result.sitemaps[0]!.routes).toHaveLength(0);
    });

    it("should not create sitemap index", () => {
      const result = splitRoutes([]);

      expect(result.indexXml).toBeUndefined();
    });
  });

  describe("validation with empty routes", () => {
    it("should validate empty routes successfully", async () => {
      const result = await generateSitemap([]);

      expect(result.validation.valid).toBe(true);
      expect(result.validation.errors).toHaveLength(0);
    });

    it("should report zero route count", async () => {
      const result = await generateSitemap([]);

      expect(result.validation.routeCount).toBe(0);
    });
  });
});
