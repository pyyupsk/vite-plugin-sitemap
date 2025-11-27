/**
 * robots.txt tests.
 * Tests for robots.ts module functions.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  appendSitemapDirective,
  buildSitemapUrl,
  createMinimalRobotsTxt,
  extractSitemapUrls,
  hasSitemapDirective,
  updateRobotsTxt,
} from "../../../src/core/robots";
import { cleanupTempDir, createTempDir } from "../../helpers/temp-dir";

describe("appendSitemapDirective", () => {
  it("should append sitemap directive to empty content", () => {
    const result = appendSitemapDirective("", "https://example.com/sitemap.xml");

    expect(result).toBe("Sitemap: https://example.com/sitemap.xml\n");
  });

  it("should append sitemap directive to existing content", () => {
    const content = "User-agent: *\nAllow: /\n";
    const result = appendSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe("User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n");
  });

  it("should add newline before directive if content doesn't end with one", () => {
    const content = "User-agent: *\nAllow: /";
    const result = appendSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe("User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n");
  });

  it("should handle whitespace-only content", () => {
    const result = appendSitemapDirective("   \n   ", "https://example.com/sitemap.xml");

    expect(result).toBe("Sitemap: https://example.com/sitemap.xml\n");
  });

  it("should append multiple directives", () => {
    let content = "";
    content = appendSitemapDirective(content, "https://example.com/sitemap-1.xml");
    content = appendSitemapDirective(content, "https://example.com/sitemap-2.xml");

    expect(content).toContain("Sitemap: https://example.com/sitemap-1.xml");
    expect(content).toContain("Sitemap: https://example.com/sitemap-2.xml");
  });
});

describe("buildSitemapUrl", () => {
  it("should build URL from hostname and filename", () => {
    const url = buildSitemapUrl("https://example.com", "sitemap.xml");

    expect(url).toBe("https://example.com/sitemap.xml");
  });

  it("should handle hostname with trailing slash", () => {
    const url = buildSitemapUrl("https://example.com/", "sitemap.xml");

    expect(url).toBe("https://example.com/sitemap.xml");
  });

  it("should handle hostname with multiple trailing slashes", () => {
    const url = buildSitemapUrl("https://example.com///", "sitemap.xml");

    expect(url).toBe("https://example.com/sitemap.xml");
  });

  it("should handle filename with leading slash", () => {
    const url = buildSitemapUrl("https://example.com", "/sitemap.xml");

    expect(url).toBe("https://example.com/sitemap.xml");
  });

  it("should handle both hostname and filename with slashes", () => {
    const url = buildSitemapUrl("https://example.com/", "/sitemap.xml");

    expect(url).toBe("https://example.com/sitemap.xml");
  });

  it("should build URL with index filename", () => {
    const url = buildSitemapUrl("https://example.com", "sitemap-index.xml");

    expect(url).toBe("https://example.com/sitemap-index.xml");
  });
});

describe("createMinimalRobotsTxt", () => {
  it("should create robots.txt with User-agent and Allow", () => {
    const content = createMinimalRobotsTxt("https://example.com/sitemap.xml");

    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
  });

  it("should include sitemap directive", () => {
    const content = createMinimalRobotsTxt("https://example.com/sitemap.xml");

    expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("should end with newline", () => {
    const content = createMinimalRobotsTxt("https://example.com/sitemap.xml");

    expect(content.endsWith("\n")).toBe(true);
  });
});

describe("extractSitemapUrls", () => {
  it("should extract single sitemap URL", () => {
    const content = "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("should extract multiple sitemap URLs", () => {
    const content = `User-agent: *
Allow: /
Sitemap: https://example.com/sitemap-1.xml
Sitemap: https://example.com/sitemap-2.xml
`;

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual([
      "https://example.com/sitemap-1.xml",
      "https://example.com/sitemap-2.xml",
    ]);
  });

  it("should handle case-insensitive directive", () => {
    const content = "sitemap: https://example.com/sitemap.xml\n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("should handle SITEMAP in uppercase", () => {
    const content = "SITEMAP: https://example.com/sitemap.xml\n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("should trim whitespace around URLs", () => {
    const content = "Sitemap:   https://example.com/sitemap.xml   \n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("should return empty array for content without sitemaps", () => {
    const content = "User-agent: *\nAllow: /\n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual([]);
  });

  it("should handle Windows line endings", () => {
    const content = "User-agent: *\r\nSitemap: https://example.com/sitemap.xml\r\n";

    const urls = extractSitemapUrls(content);

    expect(urls).toEqual(["https://example.com/sitemap.xml"]);
  });
});

describe("hasSitemapDirective", () => {
  it("should return true when sitemap URL exists", () => {
    const content = "Sitemap: https://example.com/sitemap.xml\n";

    const result = hasSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe(true);
  });

  it("should return false when sitemap URL does not exist", () => {
    const content = "Sitemap: https://example.com/other.xml\n";

    const result = hasSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe(false);
  });

  it("should return false for empty content", () => {
    const result = hasSitemapDirective("", "https://example.com/sitemap.xml");

    expect(result).toBe(false);
  });

  it("should be case-insensitive for directive", () => {
    const content = "sitemap: https://example.com/sitemap.xml\n";

    const result = hasSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe(true);
  });

  it("should handle whitespace in URL", () => {
    const content = "Sitemap:   https://example.com/sitemap.xml   \n";

    const result = hasSitemapDirective(content, "https://example.com/sitemap.xml");

    expect(result).toBe(true);
  });

  it("should handle whitespace in search URL", () => {
    const content = "Sitemap: https://example.com/sitemap.xml\n";

    const result = hasSitemapDirective(content, "  https://example.com/sitemap.xml  ");

    expect(result).toBe(true);
  });
});

describe("updateRobotsTxt", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir("robots-test-");
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("when robots.txt does not exist", () => {
    it("should create robots.txt with createIfMissing true (default)", async () => {
      const result = await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      expect(result.success).toBe(true);
      expect(result.action).toBe("created");
      expect(existsSync(join(tempDir, "robots.txt"))).toBe(true);
    });

    it("should create minimal robots.txt with sitemap", async () => {
      await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      const content = readFileSync(join(tempDir, "robots.txt"), "utf-8");

      expect(content).toContain("User-agent: *");
      expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("should return unchanged when createIfMissing is false", async () => {
      const result = await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml", {
        createIfMissing: false,
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe("unchanged");
      expect(existsSync(join(tempDir, "robots.txt"))).toBe(false);
    });
  });

  describe("when robots.txt exists", () => {
    beforeEach(() => {
      writeFileSync(join(tempDir, "robots.txt"), "User-agent: *\nAllow: /\n");
    });

    it("should append sitemap directive", async () => {
      const result = await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      expect(result.success).toBe(true);
      expect(result.action).toBe("updated");

      const content = readFileSync(join(tempDir, "robots.txt"), "utf-8");
      expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("should preserve existing content", async () => {
      await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      const content = readFileSync(join(tempDir, "robots.txt"), "utf-8");
      expect(content).toContain("User-agent: *");
      expect(content).toContain("Allow: /");
    });

    it("should return unchanged if sitemap already exists", async () => {
      writeFileSync(
        join(tempDir, "robots.txt"),
        "User-agent: *\nSitemap: https://example.com/sitemap.xml\n",
      );

      const result = await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      expect(result.success).toBe(true);
      expect(result.action).toBe("unchanged");
    });
  });

  describe("result properties", () => {
    it("should return correct path in result", async () => {
      const result = await updateRobotsTxt(tempDir, "https://example.com/sitemap.xml");

      expect(result.path).toBe(join(tempDir, "robots.txt"));
    });

    it("should return success false on error", async () => {
      // Try to write to a non-existent directory
      const result = await updateRobotsTxt("/nonexistent/path", "https://example.com/sitemap.xml");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
