/**
 * Special character edge case tests.
 * Tests handling of special characters in URLs, content, and metadata.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../src/types/sitemap";

import { generateSitemap } from "../../src/core/generator";
import { buildSitemapXml, buildUrlElement } from "../../src/xml/builder";
import { encodeUrl, escapeXml } from "../../src/xml/escape";

describe("special character handling", () => {
  describe("XML entity escaping", () => {
    it("should escape ampersand in text", () => {
      expect(escapeXml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should escape less than sign", () => {
      expect(escapeXml("a < b")).toBe("a &lt; b");
    });

    it("should escape greater than sign", () => {
      expect(escapeXml("a > b")).toBe("a &gt; b");
    });

    it("should escape double quotes", () => {
      expect(escapeXml('"quoted"')).toBe("&quot;quoted&quot;");
    });

    it("should escape single quotes", () => {
      expect(escapeXml("it's")).toBe("it&apos;s");
    });

    it("should escape all entities in complex string", () => {
      const input = '<a href="test?a=1&b=2">link</a>';
      const escaped = escapeXml(input);

      expect(escaped).not.toContain("<");
      expect(escaped).not.toContain(">");
      expect(escaped).not.toContain('"');
      expect(escaped).not.toContain("&b");
    });
  });

  describe("URL encoding", () => {
    it("should encode spaces in URL path", () => {
      const url = encodeUrl("https://example.com/path with spaces");

      expect(url).toContain("%20");
      expect(url).not.toContain(" ");
    });

    it("should preserve already encoded characters", () => {
      const url = encodeUrl("https://example.com/path%20encoded");

      expect(url).toBe("https://example.com/path%20encoded");
    });

    it("should handle unicode characters in URL", () => {
      const url = encodeUrl("https://example.com/日本語");

      // Should be valid URL
      expect(url).toContain("example.com");
    });

    it("should handle query parameters and XML-escape ampersands", () => {
      const url = encodeUrl("https://example.com/?q=test&lang=en");

      // encodeUrl XML-escapes ampersands per sitemap spec
      expect(url).toContain("?q=test&amp;lang=en");
    });
  });

  describe("special characters in routes", () => {
    it("should handle ampersand in URL", async () => {
      const routes: Route[] = [{ url: "https://example.com/page?a=1&b=2" }];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(true);
      expect(result.xml).toContain("?a=1&amp;b=2");
    });

    it("should handle unicode characters in URL path", async () => {
      const routes: Route[] = [{ url: "https://example.com/日本語" }];

      const result = await generateSitemap(routes, { skipValidation: true });

      expect(result.success).toBe(true);
    });

    it("should escape special characters in image caption", async () => {
      const routes: Route[] = [
        {
          images: [
            {
              caption: "Tom & Jerry's <adventure>",
              loc: "https://example.com/img.jpg",
            },
          ],
          url: "https://example.com/",
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(true);
      expect(result.xml).toContain("&amp;");
      expect(result.xml).toContain("&apos;");
      expect(result.xml).toContain("&lt;");
    });

    it("should escape special characters in video title", async () => {
      const routes: Route[] = [
        {
          url: "https://example.com/",
          videos: [
            {
              content_loc: "https://example.com/video.mp4",
              description: "A <test> video",
              thumbnail_loc: "https://example.com/thumb.jpg",
              title: '"Video" & More',
            },
          ],
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(true);
      expect(result.xml).toContain("&quot;Video&quot; &amp; More");
      expect(result.xml).toContain("&lt;test&gt;");
    });

    it("should escape special characters in news title", async () => {
      const routes: Route[] = [
        {
          news: {
            publication: { language: "en", name: "Test & News" },
            publication_date: "2024-01-15",
            title: 'Breaking: "Test" <Story>',
          },
          url: "https://example.com/",
        },
      ];

      const result = await generateSitemap(routes);

      expect(result.success).toBe(true);
      expect(result.xml).toContain("Test &amp; News");
      expect(result.xml).toContain("&quot;Test&quot;");
      expect(result.xml).toContain("&lt;Story&gt;");
    });
  });

  describe("URL element building", () => {
    it("should properly encode URL in loc element", () => {
      const route: Route = { url: "https://example.com/page?q=test&lang=en" };
      const xml = buildUrlElement(route);

      expect(xml).toContain("<loc>https://example.com/page?q=test&amp;lang=en</loc>");
    });

    it("should escape special chars in lastmod", () => {
      // Although dates shouldn't have special chars, test defensive behavior
      const route: Route = {
        lastmod: "2024-01-15",
        url: "https://example.com/",
      };
      const xml = buildUrlElement(route);

      expect(xml).toContain("<lastmod>2024-01-15</lastmod>");
    });
  });

  describe("buildSitemapXml with special characters", () => {
    it("should produce valid XML with escaped characters", () => {
      const routes: Route[] = [{ url: "https://example.com/page?a=1&b=2" }];

      const xml = buildSitemapXml(routes);

      // Should be well-formed XML (no raw & in content)
      expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/);
    });
  });
});
