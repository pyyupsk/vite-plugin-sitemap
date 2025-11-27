/**
 * XML namespace tests.
 * Tests for namespaces.ts module.
 */

import { describe, expect, it } from "vitest";

import {
  buildNamespaceAttrs,
  buildSitemapIndexNsAttr,
  IMAGE_NS,
  NEWS_NS,
  SITEMAP_NS,
  VIDEO_NS,
  XHTML_NS,
  XML_DECLARATION,
} from "../../../src/xml/namespaces";

describe("namespace constants", () => {
  it("should export correct SITEMAP_NS", () => {
    expect(SITEMAP_NS).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  });

  it("should export correct IMAGE_NS", () => {
    expect(IMAGE_NS).toBe("http://www.google.com/schemas/sitemap-image/1.1");
  });

  it("should export correct VIDEO_NS", () => {
    expect(VIDEO_NS).toBe("http://www.google.com/schemas/sitemap-video/1.1");
  });

  it("should export correct NEWS_NS", () => {
    expect(NEWS_NS).toBe("http://www.google.com/schemas/sitemap-news/0.9");
  });

  it("should export correct XHTML_NS", () => {
    expect(XHTML_NS).toBe("http://www.w3.org/1999/xhtml");
  });

  it("should export correct XML_DECLARATION", () => {
    expect(XML_DECLARATION).toBe('<?xml version="1.0" encoding="UTF-8"?>');
  });
});

describe("buildNamespaceAttrs", () => {
  describe("base namespace", () => {
    it("should always include base sitemap namespace", () => {
      const attrs = buildNamespaceAttrs({});
      expect(attrs).toContain(`xmlns="${SITEMAP_NS}"`);
    });

    it("should include only base namespace when no extensions", () => {
      const attrs = buildNamespaceAttrs({
        hasAlternates: false,
        hasImages: false,
        hasNews: false,
        hasVideos: false,
      });
      expect(attrs).toBe(`xmlns="${SITEMAP_NS}"`);
    });
  });

  describe("image namespace", () => {
    it("should include image namespace when hasImages is true", () => {
      const attrs = buildNamespaceAttrs({ hasImages: true });
      expect(attrs).toContain(`xmlns:image="${IMAGE_NS}"`);
    });

    it("should not include image namespace when hasImages is false", () => {
      const attrs = buildNamespaceAttrs({ hasImages: false });
      expect(attrs).not.toContain("xmlns:image");
    });

    it("should not include image namespace when hasImages is undefined", () => {
      const attrs = buildNamespaceAttrs({});
      expect(attrs).not.toContain("xmlns:image");
    });
  });

  describe("video namespace", () => {
    it("should include video namespace when hasVideos is true", () => {
      const attrs = buildNamespaceAttrs({ hasVideos: true });
      expect(attrs).toContain(`xmlns:video="${VIDEO_NS}"`);
    });

    it("should not include video namespace when hasVideos is false", () => {
      const attrs = buildNamespaceAttrs({ hasVideos: false });
      expect(attrs).not.toContain("xmlns:video");
    });
  });

  describe("news namespace", () => {
    it("should include news namespace when hasNews is true", () => {
      const attrs = buildNamespaceAttrs({ hasNews: true });
      expect(attrs).toContain(`xmlns:news="${NEWS_NS}"`);
    });

    it("should not include news namespace when hasNews is false", () => {
      const attrs = buildNamespaceAttrs({ hasNews: false });
      expect(attrs).not.toContain("xmlns:news");
    });
  });

  describe("xhtml namespace", () => {
    it("should include xhtml namespace when hasAlternates is true", () => {
      const attrs = buildNamespaceAttrs({ hasAlternates: true });
      expect(attrs).toContain(`xmlns:xhtml="${XHTML_NS}"`);
    });

    it("should not include xhtml namespace when hasAlternates is false", () => {
      const attrs = buildNamespaceAttrs({ hasAlternates: false });
      expect(attrs).not.toContain("xmlns:xhtml");
    });
  });

  describe("multiple namespaces", () => {
    it("should include all namespaces when all flags are true", () => {
      const attrs = buildNamespaceAttrs({
        hasAlternates: true,
        hasImages: true,
        hasNews: true,
        hasVideos: true,
      });

      expect(attrs).toContain(`xmlns="${SITEMAP_NS}"`);
      expect(attrs).toContain(`xmlns:image="${IMAGE_NS}"`);
      expect(attrs).toContain(`xmlns:video="${VIDEO_NS}"`);
      expect(attrs).toContain(`xmlns:news="${NEWS_NS}"`);
      expect(attrs).toContain(`xmlns:xhtml="${XHTML_NS}"`);
    });

    it("should include only image and video namespaces", () => {
      const attrs = buildNamespaceAttrs({
        hasAlternates: false,
        hasImages: true,
        hasNews: false,
        hasVideos: true,
      });

      expect(attrs).toContain(`xmlns="${SITEMAP_NS}"`);
      expect(attrs).toContain(`xmlns:image="${IMAGE_NS}"`);
      expect(attrs).toContain(`xmlns:video="${VIDEO_NS}"`);
      expect(attrs).not.toContain("xmlns:news");
      expect(attrs).not.toContain("xmlns:xhtml");
    });

    it("should separate namespaces with spaces", () => {
      const attrs = buildNamespaceAttrs({
        hasImages: true,
        hasVideos: true,
      });

      // Should have space separators between namespace declarations
      const parts = attrs.split(" ");
      expect(parts.length).toBeGreaterThan(1);
    });
  });

  describe("namespace order", () => {
    it("should maintain consistent order of namespaces", () => {
      const attrs = buildNamespaceAttrs({
        hasAlternates: true,
        hasImages: true,
        hasNews: true,
        hasVideos: true,
      });

      const imageIndex = attrs.indexOf("xmlns:image");
      const videoIndex = attrs.indexOf("xmlns:video");
      const newsIndex = attrs.indexOf("xmlns:news");
      const xhtmlIndex = attrs.indexOf("xmlns:xhtml");

      // Order should be: base, image, video, news, xhtml
      expect(imageIndex).toBeLessThan(videoIndex);
      expect(videoIndex).toBeLessThan(newsIndex);
      expect(newsIndex).toBeLessThan(xhtmlIndex);
    });
  });
});

describe("buildSitemapIndexNsAttr", () => {
  it("should return only base namespace", () => {
    const attr = buildSitemapIndexNsAttr();
    expect(attr).toBe(`xmlns="${SITEMAP_NS}"`);
  });

  it("should not include any extension namespaces", () => {
    const attr = buildSitemapIndexNsAttr();
    expect(attr).not.toContain("xmlns:image");
    expect(attr).not.toContain("xmlns:video");
    expect(attr).not.toContain("xmlns:news");
    expect(attr).not.toContain("xmlns:xhtml");
  });
});
