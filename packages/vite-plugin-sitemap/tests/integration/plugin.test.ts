/**
 * Plugin integration tests.
 * Tests the Vite plugin configuration and lifecycle.
 */

import { describe, expect, it } from "vitest";

import sitemapPlugin, { PLUGIN_NAME } from "../../src/plugin";

describe("sitemapPlugin", () => {
  describe("plugin creation", () => {
    it("should create plugin with default options", () => {
      const plugin = sitemapPlugin();

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe(PLUGIN_NAME);
    });

    it("should create plugin with custom options", () => {
      const plugin = sitemapPlugin({
        changefreq: "daily",
        hostname: "https://example.com",
        priority: 0.8,
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe(PLUGIN_NAME);
    });

    it("should have configResolved hook", () => {
      const plugin = sitemapPlugin();

      expect(plugin.configResolved).toBeDefined();
      expect(typeof plugin.configResolved).toBe("function");
    });

    it("should have closeBundle hook", () => {
      const plugin = sitemapPlugin();

      expect(plugin.closeBundle).toBeDefined();
      expect(typeof plugin.closeBundle).toBe("function");
    });
  });

  describe("plugin name", () => {
    it("should export correct PLUGIN_NAME constant", () => {
      expect(PLUGIN_NAME).toBe("vite-plugin-sitemap");
    });
  });

  describe("default export", () => {
    it("should work as default export", async () => {
      const { default: plugin } = await import("../../src/plugin");

      expect(plugin).toBeDefined();
      expect(typeof plugin).toBe("function");
    });

    it("should create plugin when called", async () => {
      const { default: createPlugin } = await import("../../src/plugin");
      const plugin = createPlugin();

      expect(plugin.name).toBe(PLUGIN_NAME);
    });
  });
});

describe("plugin configResolved", () => {
  it("should accept mock resolved config", () => {
    const plugin = sitemapPlugin();

    const mockConfig = {
      build: { outDir: "dist" },
      command: "build" as const,
      logger: {
        error: () => {},
        info: () => {},
        warn: () => {},
      },
      root: "/project",
    };

    // This should not throw
    expect(() => {
      if (typeof plugin.configResolved === "function") {
        plugin.configResolved(
          mockConfig as unknown as Parameters<NonNullable<typeof plugin.configResolved>>[0],
        );
      }
    }).not.toThrow();
  });
});
