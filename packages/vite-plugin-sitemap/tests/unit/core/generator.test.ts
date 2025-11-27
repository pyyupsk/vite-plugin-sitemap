/**
 * Sitemap generator tests.
 * Tests for generator.ts module functions.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../../src/types/sitemap";

import {
  applyDefaults,
  deduplicateRoutes,
  filterExcludedRoutes,
  generateSitemap,
  prependHostname,
  validateRoutes,
} from "../../../src/core/generator";

describe("applyDefaults", () => {
  it("should apply default changefreq to routes without it", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, { changefreq: "daily" });

    expect(result[0]!.changefreq).toBe("daily");
  });

  it("should apply default priority to routes without it", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, { priority: 0.8 });

    expect(result[0]!.priority).toBe(0.8);
  });

  it("should apply default lastmod to routes without it", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, { lastmod: "2024-01-15" });

    expect(result[0]!.lastmod).toBe("2024-01-15");
  });

  it("should not override existing changefreq", () => {
    const routes: Route[] = [{ changefreq: "weekly", url: "https://example.com/" }];
    const result = applyDefaults(routes, { changefreq: "daily" });

    expect(result[0]!.changefreq).toBe("weekly");
  });

  it("should not override existing priority", () => {
    const routes: Route[] = [{ priority: 0.5, url: "https://example.com/" }];
    const result = applyDefaults(routes, { priority: 0.8 });

    expect(result[0]!.priority).toBe(0.5);
  });

  it("should not override existing lastmod", () => {
    const routes: Route[] = [{ lastmod: "2024-01-01", url: "https://example.com/" }];
    const result = applyDefaults(routes, { lastmod: "2024-01-15" });

    expect(result[0]!.lastmod).toBe("2024-01-01");
  });

  it("should apply multiple defaults at once", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, {
      changefreq: "monthly",
      lastmod: "2024-01-15",
      priority: 0.7,
    });

    expect(result[0]!.changefreq).toBe("monthly");
    expect(result[0]!.priority).toBe(0.7);
    expect(result[0]!.lastmod).toBe("2024-01-15");
  });

  it("should not modify routes when no defaults provided", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, {});

    expect(result[0]!.changefreq).toBeUndefined();
    expect(result[0]!.priority).toBeUndefined();
  });

  it("should return new array, not mutate original", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const result = applyDefaults(routes, { priority: 0.5 });

    expect(result).not.toBe(routes);
    expect(routes[0]!.priority).toBeUndefined();
  });
});

describe("deduplicateRoutes", () => {
  it("should remove duplicate URLs", () => {
    const routes: Route[] = [
      { url: "https://example.com/a" },
      { url: "https://example.com/a" },
      { url: "https://example.com/b" },
    ];

    const result = deduplicateRoutes(routes);

    expect(result).toHaveLength(2);
  });

  it("should keep first occurrence", () => {
    const routes: Route[] = [
      { priority: 0.8, url: "https://example.com/a" },
      { priority: 0.5, url: "https://example.com/a" },
    ];

    const result = deduplicateRoutes(routes);

    expect(result[0]!.priority).toBe(0.8);
  });

  it("should handle empty array", () => {
    const result = deduplicateRoutes([]);

    expect(result).toHaveLength(0);
  });

  it("should handle array with no duplicates", () => {
    const routes: Route[] = [
      { url: "https://example.com/a" },
      { url: "https://example.com/b" },
      { url: "https://example.com/c" },
    ];

    const result = deduplicateRoutes(routes);

    expect(result).toHaveLength(3);
  });
});

describe("filterExcludedRoutes", () => {
  it("should filter routes matching exact string pattern", () => {
    const routes: Route[] = [
      { url: "https://example.com/admin" },
      { url: "https://example.com/public" },
    ];

    const result = filterExcludedRoutes(routes, ["https://example.com/admin"]);

    expect(result).toHaveLength(1);
    expect(result[0]!.url).toBe("https://example.com/public");
  });

  it("should filter routes matching glob pattern", () => {
    const routes: Route[] = [
      { url: "https://example.com/admin/users" },
      { url: "https://example.com/admin/settings" },
      { url: "https://example.com/public" },
    ];

    const result = filterExcludedRoutes(routes, ["https://example.com/admin/*"]);

    expect(result).toHaveLength(1);
    expect(result[0]!.url).toBe("https://example.com/public");
  });

  it("should filter routes matching regex pattern", () => {
    const routes: Route[] = [
      { url: "https://example.com/page1" },
      { url: "https://example.com/page2" },
      { url: "https://example.com/about" },
    ];

    const result = filterExcludedRoutes(routes, [/\/page\d+$/]);

    expect(result).toHaveLength(1);
    expect(result[0]!.url).toBe("https://example.com/about");
  });

  it("should return all routes when no patterns provided", () => {
    const routes: Route[] = [{ url: "https://example.com/a" }, { url: "https://example.com/b" }];

    const result = filterExcludedRoutes(routes, []);

    expect(result).toHaveLength(2);
  });

  it("should handle multiple patterns", () => {
    const routes: Route[] = [
      { url: "https://example.com/admin" },
      { url: "https://example.com/private" },
      { url: "https://example.com/public" },
    ];

    const result = filterExcludedRoutes(routes, [
      "https://example.com/admin",
      "https://example.com/private",
    ]);

    expect(result).toHaveLength(1);
  });
});

describe("prependHostname", () => {
  it("should prepend hostname to relative URL starting with /", () => {
    const route: Route = { url: "/about" };
    const result = prependHostname(route, "https://example.com");

    expect(result.url).toBe("https://example.com/about");
  });

  it("should prepend hostname to relative URL without leading /", () => {
    const route: Route = { url: "about" };
    const result = prependHostname(route, "https://example.com");

    expect(result.url).toBe("https://example.com/about");
  });

  it("should not modify absolute URL with https", () => {
    const route: Route = { url: "https://other.com/page" };
    const result = prependHostname(route, "https://example.com");

    expect(result.url).toBe("https://other.com/page");
  });

  it("should not modify absolute URL with http", () => {
    const route: Route = { url: "http://other.com/page" };
    const result = prependHostname(route, "https://example.com");

    expect(result.url).toBe("http://other.com/page");
  });

  it("should handle hostname with trailing slash", () => {
    const route: Route = { url: "/about" };
    const result = prependHostname(route, "https://example.com/");

    expect(result.url).toBe("https://example.com/about");
  });

  it("should preserve other route properties", () => {
    const route: Route = { changefreq: "daily", priority: 0.8, url: "/about" };
    const result = prependHostname(route, "https://example.com");

    expect(result.changefreq).toBe("daily");
    expect(result.priority).toBe(0.8);
  });

  it("should return new object, not mutate original", () => {
    const route: Route = { url: "/about" };
    const result = prependHostname(route, "https://example.com");

    expect(result).not.toBe(route);
    expect(route.url).toBe("/about");
  });
});

describe("validateRoutes", () => {
  it("should return valid result for valid routes", () => {
    const routes: Route[] = [{ url: "https://example.com/" }, { url: "https://example.com/about" }];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should return invalid result for route with invalid URL", () => {
    const routes: Route[] = [{ url: "not-a-url" }];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should return invalid result for route with URL containing fragment", () => {
    const routes: Route[] = [{ url: "https://example.com/page#section" }];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(false);
  });

  it("should return invalid result for route with invalid priority", () => {
    const routes: Route[] = [{ priority: 2.0, url: "https://example.com/" }];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(false);
  });

  it("should return invalid result for route with invalid changefreq", () => {
    const routes: Route[] = [
      // @ts-expect-error - testing invalid value
      { changefreq: "sometimes", url: "https://example.com/" },
    ];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(false);
  });

  it("should include route index in error path", () => {
    const routes: Route[] = [{ url: "https://example.com/" }, { url: "invalid-url" }];

    const result = validateRoutes(routes);

    expect(result.valid).toBe(false);
    expect(result.errors[0]!.path).toContain("routes[1]");
  });

  it("should handle empty array", () => {
    const result = validateRoutes([]);

    expect(result.valid).toBe(true);
    expect(result.routeCount).toBe(0);
  });
});

describe("generateSitemap", () => {
  it("should generate valid sitemap for valid routes", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(true);
    expect(result.xml).toContain("<?xml version");
    expect(result.xml).toContain("<urlset");
    expect(result.xml).toContain("https://example.com/");
  });

  it("should fail for invalid routes", async () => {
    const routes: Route[] = [{ url: "invalid-url" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(false);
    expect(result.validation.valid).toBe(false);
  });

  it("should apply default options to routes", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const result = await generateSitemap(routes, {
      pluginOptions: { changefreq: "daily", priority: 0.8 },
    });

    expect(result.success).toBe(true);
    expect(result.xml).toContain("<changefreq>daily</changefreq>");
    expect(result.xml).toContain("<priority>0.8</priority>");
  });

  it("should filter excluded routes", async () => {
    const routes: Route[] = [
      { url: "https://example.com/public" },
      { url: "https://example.com/admin" },
    ];

    const result = await generateSitemap(routes, {
      pluginOptions: { exclude: ["https://example.com/admin"] },
    });

    expect(result.success).toBe(true);
    expect(result.xml).toContain("https://example.com/public");
    expect(result.xml).not.toContain("https://example.com/admin");
    expect(result.warnings).toContain("1 routes excluded by filter patterns");
  });

  it("should deduplicate routes", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }, { url: "https://example.com/" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(true);
    expect(result.routeCount).toBe(1);
    expect(result.warnings).toContain("1 duplicate URLs removed");
  });

  it("should prepend hostname to relative URLs", async () => {
    const routes: Route[] = [{ url: "/about" }];

    const result = await generateSitemap(routes, {
      hostname: "https://example.com",
    });

    expect(result.success).toBe(true);
    expect(result.xml).toContain("https://example.com/about");
  });

  it("should calculate byte size", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(true);
    expect(result.byteSize).toBeGreaterThan(0);
  });

  it("should return route count", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }, { url: "https://example.com/about" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(true);
    expect(result.routeCount).toBe(2);
  });

  it("should skip validation when option set", async () => {
    const routes: Route[] = [{ url: "invalid-url" }];

    const result = await generateSitemap(routes, { skipValidation: true });

    // Even with invalid URL, it should succeed since validation is skipped
    expect(result.success).toBe(true);
  });

  it("should apply transform function", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const result = await generateSitemap(routes, {
      pluginOptions: {
        transform: (route) => ({ ...route, priority: 1.0 }),
      },
    });

    expect(result.success).toBe(true);
    expect(result.xml).toContain("<priority>1.0</priority>");
  });

  it("should use custom serializer", async () => {
    const routes: Route[] = [{ url: "https://example.com/" }];

    const result = await generateSitemap(routes, {
      enableSplitting: false,
      pluginOptions: {
        serialize: () => "<custom>xml</custom>",
      },
    });

    expect(result.success).toBe(true);
    expect(result.xml).toBe("<custom>xml</custom>");
  });

  it("should warn about future dates in lastmod", async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const routes: Route[] = [{ lastmod: futureDateStr, url: "https://example.com/" }];

    const result = await generateSitemap(routes);

    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.includes("Future lastmod date"))).toBe(true);
  });
});
