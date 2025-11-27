/**
 * Basic Vite integration tests.
 * Tests sitemap generation with actual Vite builds.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createAsyncSitemapProject,
  createProjectWithoutSitemap,
  createProjectWithRobots,
  createViteProject,
  getRouteTypesImportPath,
  type ViteProjectContext,
} from "../helpers/vite-project";

describe("Vite build integration", () => {
  let project: ViteProjectContext;

  afterEach(async () => {
    if (project) {
      await project.cleanup();
    }
  });

  describe("basic sitemap generation", () => {
    beforeEach(async () => {
      project = await createViteProject();
    });

    it("should generate sitemap.xml on build", async () => {
      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      expect(existsSync(sitemapPath)).toBe(true);
    });

    it("should generate valid XML", async () => {
      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain("<urlset");
      expect(content).toContain("</urlset>");
    });

    it("should include routes from sitemap.ts", async () => {
      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("https://example.com/");
      expect(content).toContain("https://example.com/about");
      expect(content).toContain("https://example.com/contact");
    });
  });

  describe("async sitemap routes", () => {
    beforeEach(async () => {
      project = await createAsyncSitemapProject();
    });

    it("should handle async route generation", async () => {
      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      expect(existsSync(sitemapPath)).toBe(true);

      const content = readFileSync(sitemapPath, "utf-8");
      expect(content).toContain("https://example.com/");
      expect(content).toContain("https://example.com/async-page");
    });
  });

  describe("missing sitemap file", () => {
    beforeEach(async () => {
      project = await createProjectWithoutSitemap();
    });

    it("should complete build without sitemap when no sitemap file exists", async () => {
      // Should not throw - just warn
      await expect(project.build()).resolves.not.toThrow();

      // No sitemap.xml should be generated
      const sitemapPath = join(project.outDir, "sitemap.xml");
      expect(existsSync(sitemapPath)).toBe(false);
    });
  });

  describe("robots.txt generation", () => {
    beforeEach(async () => {
      project = await createProjectWithRobots();
    });

    it("should generate robots.txt when option enabled", async () => {
      await project.build();

      const robotsPath = join(project.outDir, "robots.txt");
      expect(existsSync(robotsPath)).toBe(true);
    });

    it("should include sitemap URL in robots.txt", async () => {
      await project.build();

      const robotsPath = join(project.outDir, "robots.txt");
      const content = readFileSync(robotsPath, "utf-8");

      expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
    });
  });

  describe("plugin options", () => {
    it("should apply default changefreq to routes", async () => {
      project = await createViteProject({
        pluginOptions: { changefreq: "daily" },
      });

      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("<changefreq>daily</changefreq>");
    });

    it("should apply default priority to routes", async () => {
      project = await createViteProject({
        pluginOptions: { priority: 0.8 },
      });

      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("<priority>0.8</priority>");
    });

    it("should prepend hostname to relative URLs", async () => {
      const typesPath = getRouteTypesImportPath();
      project = await createViteProject({
        pluginOptions: { hostname: "https://example.com" },
        sitemapContent: `import type { Route } from "${typesPath}";
export default [
  { url: "/" },
  { url: "/about" },
] satisfies Route[];`,
      });

      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("<loc>https://example.com/</loc>");
      expect(content).toContain("<loc>https://example.com/about</loc>");
    });
  });

  describe("custom sitemap content", () => {
    it("should include images in sitemap", async () => {
      const typesPath = getRouteTypesImportPath();
      project = await createViteProject({
        sitemapContent: `import type { Route } from "${typesPath}";
export default [
  {
    url: "https://example.com/",
    images: [{ loc: "https://example.com/image.jpg" }],
  },
] satisfies Route[];`,
      });

      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("xmlns:image");
      expect(content).toContain("<image:image>");
      expect(content).toContain("<image:loc>https://example.com/image.jpg</image:loc>");
    });

    it("should include alternates/hreflang in sitemap", async () => {
      const typesPath = getRouteTypesImportPath();
      project = await createViteProject({
        sitemapContent: `import type { Route } from "${typesPath}";
export default [
  {
    url: "https://example.com/",
    alternates: [
      { hreflang: "en", href: "https://example.com/en/" },
      { hreflang: "de", href: "https://example.com/de/" },
    ],
  },
] satisfies Route[];`,
      });

      await project.build();

      const sitemapPath = join(project.outDir, "sitemap.xml");
      const content = readFileSync(sitemapPath, "utf-8");

      expect(content).toContain("xmlns:xhtml");
      expect(content).toContain('<xhtml:link rel="alternate"');
      expect(content).toContain('hreflang="en"');
      expect(content).toContain('hreflang="de"');
    });
  });
});
