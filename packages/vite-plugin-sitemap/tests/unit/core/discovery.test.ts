/**
 * Sitemap discovery tests.
 * Tests for discovery.ts module functions.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_SRC_DIR,
  discoverSitemapFile,
  formatNotFoundError,
  getPossiblePaths,
  SITEMAP_EXTENSIONS,
  SITEMAP_FILENAME,
} from "../../../src/core/discovery";
import { cleanupTempDir, createTempDir } from "../../helpers/temp-dir";

describe("constants", () => {
  it("should export correct SITEMAP_EXTENSIONS", () => {
    expect(SITEMAP_EXTENSIONS).toEqual([".ts", ".js", ".mts", ".mjs"]);
  });

  it("should export correct SITEMAP_FILENAME", () => {
    expect(SITEMAP_FILENAME).toBe("sitemap");
  });

  it("should export correct DEFAULT_SRC_DIR", () => {
    expect(DEFAULT_SRC_DIR).toBe("src");
  });
});

describe("discoverSitemapFile", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir("discovery-test-");
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("with custom sitemapFile option", () => {
    it("should find custom sitemap file when it exists", () => {
      const customPath = join(tempDir, "custom-sitemap.ts");
      writeFileSync(customPath, "export default [];");

      const result = discoverSitemapFile({
        root: tempDir,
        sitemapFile: "custom-sitemap.ts",
      });

      expect(result.found).toBe(true);
      expect(result.path).toBe(customPath);
      expect(result.extension).toBe(".ts");
    });

    it("should return not found when custom sitemap file does not exist", () => {
      const result = discoverSitemapFile({
        root: tempDir,
        sitemapFile: "nonexistent.ts",
      });

      expect(result.found).toBe(false);
      expect(result.path).toBeUndefined();
    });
  });

  describe("automatic discovery in src directory", () => {
    it("should find sitemap.ts in src directory", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      const sitemapPath = join(srcDir, "sitemap.ts");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
      expect(result.extension).toBe(".ts");
    });

    it("should find sitemap.js in src directory", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      const sitemapPath = join(srcDir, "sitemap.js");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
      expect(result.extension).toBe(".js");
    });

    it("should find sitemap.mts in src directory", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      const sitemapPath = join(srcDir, "sitemap.mts");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
      expect(result.extension).toBe(".mts");
    });

    it("should find sitemap.mjs in src directory", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      const sitemapPath = join(srcDir, "sitemap.mjs");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
      expect(result.extension).toBe(".mjs");
    });

    it("should prefer .ts over .js", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      writeFileSync(join(srcDir, "sitemap.ts"), "export default [];");
      writeFileSync(join(srcDir, "sitemap.js"), "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.extension).toBe(".ts");
    });
  });

  describe("automatic discovery in root directory", () => {
    it("should fall back to root directory when src has no sitemap", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });
      const sitemapPath = join(tempDir, "sitemap.ts");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
    });

    it("should return not found when no sitemap exists anywhere", () => {
      const srcDir = join(tempDir, "src");
      mkdirSync(srcDir, { recursive: true });

      const result = discoverSitemapFile({ root: tempDir });

      expect(result.found).toBe(false);
      expect(result.path).toBeUndefined();
    });
  });

  describe("custom srcDir option", () => {
    it("should search in custom source directory", () => {
      const customSrc = join(tempDir, "lib");
      mkdirSync(customSrc, { recursive: true });
      const sitemapPath = join(customSrc, "sitemap.ts");
      writeFileSync(sitemapPath, "export default [];");

      const result = discoverSitemapFile({
        root: tempDir,
        srcDir: "lib",
      });

      expect(result.found).toBe(true);
      expect(result.path).toBe(sitemapPath);
    });
  });
});

describe("getPossiblePaths", () => {
  it("should return all possible paths for default options", () => {
    const paths = getPossiblePaths({ root: "/project" });

    expect(paths).toContain("/project/src/sitemap.ts");
    expect(paths).toContain("/project/src/sitemap.js");
    expect(paths).toContain("/project/src/sitemap.mts");
    expect(paths).toContain("/project/src/sitemap.mjs");
    expect(paths).toContain("/project/sitemap.ts");
    expect(paths).toContain("/project/sitemap.js");
    expect(paths).toContain("/project/sitemap.mts");
    expect(paths).toContain("/project/sitemap.mjs");
  });

  it("should use custom srcDir in paths", () => {
    const paths = getPossiblePaths({ root: "/project", srcDir: "lib" });

    expect(paths).toContain("/project/lib/sitemap.ts");
    expect(paths).toContain("/project/lib/sitemap.js");
    expect(paths).not.toContain("/project/src/sitemap.ts");
  });

  it("should return 8 possible paths", () => {
    const paths = getPossiblePaths({ root: "/project" });

    // 4 extensions * 2 directories = 8 paths
    expect(paths).toHaveLength(8);
  });
});

describe("formatNotFoundError", () => {
  it("should include recommended sitemap path", () => {
    const error = formatNotFoundError();

    expect(error).toContain("src/sitemap.ts (recommended)");
  });

  it("should include example code", () => {
    const error = formatNotFoundError();

    expect(error).toContain("import type { Route }");
    expect(error).toContain("export default");
    expect(error).toContain("satisfies Route[]");
  });

  it("should list searched paths", () => {
    const error = formatNotFoundError({ root: "/test" });

    expect(error).toContain("Searched paths:");
    expect(error).toContain("/test/src/sitemap.ts");
  });

  it("should use custom srcDir in error message", () => {
    const error = formatNotFoundError({ srcDir: "lib" });

    expect(error).toContain("lib/sitemap.ts (recommended)");
    expect(error).toContain("lib/sitemap.js");
  });
});
