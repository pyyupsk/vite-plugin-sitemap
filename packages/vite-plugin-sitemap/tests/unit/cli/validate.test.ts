/**
 * CLI validate command tests.
 * Tests the validate command functionality.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "../../helpers/cli";
import { cleanupTempDir, createTempDir } from "../../helpers/temp-dir";

/** Path to the package source for imports in test configs */
const PACKAGE_SRC = resolve(__dirname, "..", "..", "..", "src", "index.ts").replaceAll("\\", "/");

describe("CLI validate command", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir("cli-validate-test-");

    // Create src directory
    mkdirSync(join(tempDir, "src"), { recursive: true });
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe("with valid sitemap", () => {
    beforeEach(() => {
      // Create a valid sitemap.ts
      const sitemapContent = `export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should validate successfully", async () => {
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Validation passed");
    });

    it("should show route count on success", async () => {
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.stdout).toContain("2 routes");
    });

    it("should show verbose output when flag is set", async () => {
      const result = await runCli(["validate", "--root", tempDir, "--verbose"], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      // Verbose mode shows validation details
      expect(result.stdout).toContain("Validation passed");
    });
  });

  describe("with invalid sitemap", () => {
    beforeEach(() => {
      // Create a sitemap with invalid URLs
      const sitemapContent = `export default [
  { url: "not-a-valid-url" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should fail validation for invalid routes", async () => {
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(1);
      expect(result.combined).toContain("Validation failed");
    });

    it("should show error details", async () => {
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.combined).toContain("url");
    });
  });

  describe("with missing sitemap file", () => {
    it("should fail when no sitemap file exists", async () => {
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(1);
    });
  });

  describe("with custom sitemap path", () => {
    beforeEach(() => {
      // Create sitemap in custom location
      const customDir = join(tempDir, "custom");
      mkdirSync(customDir, { recursive: true });
      writeFileSync(
        join(customDir, "routes.ts"),
        `export default [{ url: "https://example.com/" }];`,
      );
    });

    it("should validate custom sitemap path", async () => {
      const result = await runCli(
        ["validate", "--root", tempDir, "--sitemap", "custom/routes.ts"],
        { cwd: tempDir },
      );

      expect(result.exitCode).toBe(0);
    });
  });

  describe("with vite.config.ts", () => {
    beforeEach(() => {
      // Create a sitemap with relative URLs (requires hostname)
      const sitemapContent = `export default [
  { url: "/" },
  { url: "/about" },
];`;
      writeFileSync(join(tempDir, "src", "sitemap.ts"), sitemapContent);
    });

    it("should read hostname from vite.config.ts", async () => {
      // Create vite.config.ts with hostname
      const viteConfig = `
import sitemap from "${PACKAGE_SRC}";

export default {
  plugins: [
    sitemap({
      hostname: "https://example.com",
    }),
  ],
};`;
      writeFileSync(join(tempDir, "vite.config.ts"), viteConfig);

      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Validation passed");
    });

    it("should fail without hostname for relative URLs", async () => {
      // No vite.config.ts, no --hostname flag
      const result = await runCli(["validate", "--root", tempDir], { cwd: tempDir });

      expect(result.exitCode).toBe(1);
      expect(result.combined).toContain("Validation failed");
    });

    it("should allow CLI --hostname to override vite.config", async () => {
      // Create vite.config.ts with one hostname
      const viteConfig = `
import sitemap from "${PACKAGE_SRC}";

export default {
  plugins: [
    sitemap({
      hostname: "https://config.example.com",
    }),
  ],
};`;
      writeFileSync(join(tempDir, "vite.config.ts"), viteConfig);

      // Override with CLI flag
      const result = await runCli(
        ["validate", "--root", tempDir, "--hostname", "https://cli.example.com"],
        { cwd: tempDir },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Validation passed");
    });
  });
});
