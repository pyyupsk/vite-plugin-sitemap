/**
 * CLI preview command tests.
 * Tests the preview command functionality.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "../../helpers/cli";
import { cleanupTempDir, createTempDir } from "../../helpers/temp-dir";

describe("CLI preview command", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir("cli-preview-test-");
    mkdirSync(join(tempDir, "src"), { recursive: true });
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("with valid sitemap", () => {
    beforeEach(() => {
      const sitemapContent = `export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should preview sitemap XML", async () => {
      const result = await runCli(["preview", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("<?xml version");
      expect(result.stdout).toContain("<urlset");
    });

    it("should show routes in XML output", async () => {
      const result = await runCli(["preview", "--root", tempDir], { cwd: tempDir });

      expect(result.stdout).toContain("https://example.com/");
      expect(result.stdout).toContain("https://example.com/about");
    });

    it("should show size statistics", async () => {
      const result = await runCli(["preview", "--root", tempDir], { cwd: tempDir });

      expect(result.stdout).toContain("Size:");
      expect(result.stdout).toContain("Routes:");
    });

    it("should truncate output by default", async () => {
      // Create sitemap with many routes
      const routes = Array.from(
        { length: 100 },
        (_, i) => `  { url: "https://example.com/page${i}" },`,
      ).join("\n");
      const sitemapContent = `export default [\n${routes}\n];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);

      const result = await runCli(["preview", "--root", tempDir], { cwd: tempDir });

      expect(result.stdout).toContain("more lines");
    });

    it("should show full output with --full flag", async () => {
      const result = await runCli(["preview", "--root", tempDir, "--full"], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).not.toContain("more lines");
    });

    it("should respect --limit option", async () => {
      const result = await runCli(["preview", "--root", tempDir, "--limit", "10"], {
        cwd: tempDir,
      });

      expect(result.exitCode).toBe(0);
    });
  });

  describe("with hostname option", () => {
    beforeEach(() => {
      const sitemapContent = `export default [
  { url: "/" },
  { url: "/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should prepend hostname to relative URLs", async () => {
      const result = await runCli(
        ["preview", "--root", tempDir, "--hostname", "https://example.com"],
        { cwd: tempDir },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("https://example.com/");
      expect(result.stdout).toContain("https://example.com/about");
    });
  });

  describe("with named exports", () => {
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

    it("should preview specific named export", async () => {
      const result = await runCli(["preview", "--root", tempDir, "--name", "blog"], {
        cwd: tempDir,
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("blog");
    });

    it("should fail for non-existent export name", async () => {
      const result = await runCli(["preview", "--root", tempDir, "--name", "nonexistent"], {
        cwd: tempDir,
      });

      expect(result.exitCode).toBe(1);
    });
  });

  describe("with invalid sitemap", () => {
    beforeEach(() => {
      const sitemapContent = `export default [
  { url: "not-a-url" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should show validation errors in preview", async () => {
      const result = await runCli(["preview", "--root", tempDir], { cwd: tempDir });

      expect(result.combined).toContain("failed");
    });
  });
});
