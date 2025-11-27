/**
 * Concurrent operations edge case tests.
 * Tests handling of parallel and async operations.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../src/types/sitemap";

import { generateMultipleSitemaps, generateSitemap } from "../../src/core/generator";
import { type LoadResult, resolveRoutes } from "../../src/core/loader";
import { generateRoutes } from "../helpers";

describe("concurrent operations handling", () => {
  describe("parallel sitemap generation", () => {
    it("should generate multiple sitemaps concurrently", async () => {
      const routeSets = [
        generateRoutes(10, "https://example.com/a"),
        generateRoutes(10, "https://example.com/b"),
        generateRoutes(10, "https://example.com/c"),
      ];

      const results = await Promise.all(routeSets.map((routes) => generateSitemap(routes)));

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.routeCount).toBe(10);
      });
    });

    it("should handle concurrent validation", async () => {
      const routeSets = Array.from({ length: 10 }, () =>
        generateRoutes(100, "https://example.com"),
      );

      const results = await Promise.all(routeSets.map((routes) => generateSitemap(routes)));

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe("generateMultipleSitemaps", () => {
    it("should generate sitemaps for multiple named exports", async () => {
      const routeSets = [
        { name: "pages", routes: generateRoutes(5, "https://example.com/page") },
        { name: "blog", routes: generateRoutes(5, "https://example.com/blog") },
        { name: "products", routes: generateRoutes(5, "https://example.com/product") },
      ];

      const results = await generateMultipleSitemaps(routeSets);

      expect(results.size).toBe(3);
      expect(results.has("pages")).toBe(true);
      expect(results.has("blog")).toBe(true);
      expect(results.has("products")).toBe(true);
    });

    it("should handle mixed success/failure results", async () => {
      const routeSets = [
        { name: "valid", routes: [{ url: "https://example.com/" }] },
        { name: "invalid", routes: [{ url: "not-a-url" }] },
      ];

      const results = await generateMultipleSitemaps(routeSets);

      expect(results.get("valid")!.success).toBe(true);
      expect(results.get("invalid")!.success).toBe(false);
    });
  });

  describe("async route resolution", () => {
    it("should resolve multiple async route functions", async () => {
      const asyncRoutes1 = async (): Promise<Route[]> => {
        await new Promise((r) => setTimeout(r, 10));
        return [{ url: "https://example.com/async1" }];
      };

      const asyncRoutes2 = async (): Promise<Route[]> => {
        await new Promise((r) => setTimeout(r, 10));
        return [{ url: "https://example.com/async2" }];
      };

      const loadResult: LoadResult = {
        allSources: [
          { name: "async1", routes: asyncRoutes1 },
          { name: "async2", routes: asyncRoutes2 },
        ],
        defaultRoutes: undefined,
        namedExports: new Map(),
      };

      const resolved = await resolveRoutes(loadResult);

      expect(resolved).toHaveLength(2);
      expect(resolved[0]!.routes[0]!.url).toBe("https://example.com/async1");
      expect(resolved[1]!.routes[0]!.url).toBe("https://example.com/async2");
    });

    it("should handle mixed sync and async routes", async () => {
      const syncRoutes: Route[] = [{ url: "https://example.com/sync" }];
      const asyncRoutes = async (): Promise<Route[]> => [{ url: "https://example.com/async" }];

      const loadResult: LoadResult = {
        allSources: [
          { name: "sync", routes: syncRoutes },
          { name: "async", routes: asyncRoutes },
        ],
        defaultRoutes: undefined,
        namedExports: new Map(),
      };

      const resolved = await resolveRoutes(loadResult);

      expect(resolved).toHaveLength(2);
      expect(resolved[0]!.routes[0]!.url).toBe("https://example.com/sync");
      expect(resolved[1]!.routes[0]!.url).toBe("https://example.com/async");
    });
  });

  describe("transform function concurrency", () => {
    it("should apply async transform to all routes", async () => {
      const routes: Route[] = [
        { url: "https://example.com/1" },
        { url: "https://example.com/2" },
        { url: "https://example.com/3" },
      ];

      const result = await generateSitemap(routes, {
        pluginOptions: {
          transform: async (route) => {
            await new Promise((r) => setTimeout(r, 5));
            return { ...route, priority: 0.8 };
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.xml).toContain("<priority>0.8</priority>");
    });

    it("should handle transform that removes routes", async () => {
      const routes: Route[] = [
        { url: "https://example.com/keep" },
        { url: "https://example.com/remove" },
        { url: "https://example.com/keep2" },
      ];

      const result = await generateSitemap(routes, {
        pluginOptions: {
          transform: async (route) => {
            if (route.url.includes("remove")) {
              return null;
            }
            return route;
          },
        },
      });

      expect(result.success).toBe(true);
      expect(result.routeCount).toBe(2);
      expect(result.xml).toContain("https://example.com/keep");
      expect(result.xml).not.toContain("https://example.com/remove");
    });
  });

  describe("race condition scenarios", () => {
    it("should handle rapid sequential generations", async () => {
      const routes = generateRoutes(10, "https://example.com");

      // Run multiple generations in rapid succession
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(await generateSitemap(routes));
      }

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle interleaved async operations", async () => {
      const routes1 = generateRoutes(50, "https://example.com/a");
      const routes2 = generateRoutes(50, "https://example.com/b");

      // Start both generations at the same time
      const [result1, result2] = await Promise.all([
        generateSitemap(routes1),
        generateSitemap(routes2),
      ]);

      // Both should succeed independently
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Results should contain correct URLs
      expect(result1.xml).toContain("example.com/a");
      expect(result2.xml).toContain("example.com/b");
    });
  });
});
