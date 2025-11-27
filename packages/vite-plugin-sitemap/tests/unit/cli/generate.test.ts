/**
 * CLI generate command tests.
 * Tests the generate command functionality.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "../../helpers/cli";
import { cleanupTempDir, createTempDir } from "../../helpers/temp-dir";

describe("CLI generate command", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir("cli-generate-test-");
    mkdirSync(join(tempDir, "src"), { recursive: true });
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("basic generation", () => {
    beforeEach(() => {
      const sitemapContent = `export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should generate sitemap.xml", async () => {
      const result = await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      expect(existsSync(join(tempDir, "dist", "sitemap.xml"))).toBe(true);
    });

    it("should generate valid XML content", async () => {
      await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      const content = readFileSync(join(tempDir, "dist", "sitemap.xml"), "utf-8");

      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain("<urlset");
      expect(content).toContain("https://example.com/");
    });

    it("should show success message", async () => {
      const result = await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(result.stdout).toContain("Generated");
      expect(result.stdout).toContain("2 URLs");
    });

    it("should list generated files", async () => {
      const result = await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(result.stdout).toContain("sitemap.xml");
    });
  });

  describe("output directory", () => {
    beforeEach(() => {
      writeFileSync(
        join(tempDir, "src", "sitemap.ts"),
        `export default [{ url: "https://example.com/" }];`,
      );
    });

    it("should use default dist directory", async () => {
      await runCli(["generate"], { cwd: tempDir });

      expect(existsSync(join(tempDir, "dist", "sitemap.xml"))).toBe(true);
    });

    it("should use custom output directory", async () => {
      await runCli(["generate", "--output", "build"], { cwd: tempDir });

      expect(existsSync(join(tempDir, "build", "sitemap.xml"))).toBe(true);
    });

    it("should create output directory if it doesn't exist", async () => {
      await runCli(["generate", "--output", "nested/output/dir"], { cwd: tempDir });

      expect(existsSync(join(tempDir, "nested", "output", "dir", "sitemap.xml"))).toBe(true);
    });
  });

  describe("hostname option", () => {
    beforeEach(() => {
      const sitemapContent = `export default [
  { url: "/" },
  { url: "/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should prepend hostname to relative URLs", async () => {
      await runCli(["generate", "--output", "dist", "--hostname", "https://example.com"], {
        cwd: tempDir,
      });

      const content = readFileSync(join(tempDir, "dist", "sitemap.xml"), "utf-8");

      expect(content).toContain("<loc>https://example.com/</loc>");
      expect(content).toContain("<loc>https://example.com/about</loc>");
    });
  });

  describe("robots.txt generation", () => {
    beforeEach(() => {
      writeFileSync(
        join(tempDir, "src", "sitemap.ts"),
        `export default [{ url: "https://example.com/" }];`,
      );
    });

    it("should generate robots.txt with --robots-txt flag", async () => {
      await runCli(
        ["generate", "--output", "dist", "--robots-txt", "--hostname", "https://example.com"],
        { cwd: tempDir },
      );

      expect(existsSync(join(tempDir, "dist", "robots.txt"))).toBe(true);
    });

    it("should include sitemap URL in robots.txt", async () => {
      await runCli(
        ["generate", "--output", "dist", "--robots-txt", "--hostname", "https://example.com"],
        { cwd: tempDir },
      );

      const content = readFileSync(join(tempDir, "dist", "robots.txt"), "utf-8");

      expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
    });

    it("should warn when --robots-txt without --hostname", async () => {
      const result = await runCli(["generate", "--output", "dist", "--robots-txt"], {
        cwd: tempDir,
      });

      expect(result.combined).toContain("hostname");
    });
  });

  describe("with invalid sitemap", () => {
    beforeEach(() => {
      writeFileSync(join(tempDir, "src", "sitemap.ts"), `export default [{ url: "invalid-url" }];`);
    });

    it("should show validation errors", async () => {
      const result = await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(result.combined).toContain("Validation failed");
    });
  });

  describe("with missing sitemap file", () => {
    it("should fail when no sitemap file exists", async () => {
      const result = await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(result.exitCode).toBe(1);
    });
  });

  describe("named exports", () => {
    beforeEach(() => {
      const sitemapContent = `
export const pages = [
  { url: "https://example.com/page1" },
];

export const blog = [
  { url: "https://example.com/blog/post1" },
];

export default pages;
`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should generate sitemaps for all exports", async () => {
      await runCli(["generate", "--output", "dist"], { cwd: tempDir });

      expect(existsSync(join(tempDir, "dist", "sitemap.xml"))).toBe(true);
      expect(existsSync(join(tempDir, "dist", "sitemap-pages.xml"))).toBe(true);
      expect(existsSync(join(tempDir, "dist", "sitemap-blog.xml"))).toBe(true);
    });
  });
});
