/**
 * Sitemap loader tests.
 * Tests for loader.ts module functions.
 */

import { describe, expect, it } from "vitest";

import type { Route } from "../../../src/types/sitemap";

import {
  getSitemapFilename,
  type LoadResult,
  mergeRoutes,
  resolveRoutes,
} from "../../../src/core/loader";

describe("getSitemapFilename", () => {
  describe("default export name", () => {
    it("should return sitemap.xml for default name", () => {
      expect(getSitemapFilename("default")).toBe("sitemap.xml");
    });

    it("should return sitemap-0.xml for default with index 0", () => {
      expect(getSitemapFilename("default", 0)).toBe("sitemap-0.xml");
    });

    it("should return sitemap-1.xml for default with index 1", () => {
      expect(getSitemapFilename("default", 1)).toBe("sitemap-1.xml");
    });
  });

  describe("named export names", () => {
    it("should return sitemap-pages.xml for pages name", () => {
      expect(getSitemapFilename("pages")).toBe("sitemap-pages.xml");
    });

    it("should return sitemap-products.xml for products name", () => {
      expect(getSitemapFilename("products")).toBe("sitemap-products.xml");
    });

    it("should return sitemap-pages-0.xml for pages with index 0", () => {
      expect(getSitemapFilename("pages", 0)).toBe("sitemap-pages-0.xml");
    });

    it("should return sitemap-blog-2.xml for blog with index 2", () => {
      expect(getSitemapFilename("blog", 2)).toBe("sitemap-blog-2.xml");
    });
  });
});

describe("mergeRoutes", () => {
  it("should merge multiple route arrays", () => {
    const routes1: Route[] = [{ url: "https://example.com/a" }];
    const routes2: Route[] = [{ url: "https://example.com/b" }];

    const merged = mergeRoutes(routes1, routes2);

    expect(merged).toHaveLength(2);
    expect(merged[0]!.url).toBe("https://example.com/a");
    expect(merged[1]!.url).toBe("https://example.com/b");
  });

  it("should deduplicate routes by URL", () => {
    const routes1: Route[] = [{ url: "https://example.com/a" }];
    const routes2: Route[] = [{ url: "https://example.com/a" }];

    const merged = mergeRoutes(routes1, routes2);

    expect(merged).toHaveLength(1);
  });

  it("should keep first occurrence when deduplicating", () => {
    const routes1: Route[] = [{ priority: 0.8, url: "https://example.com/a" }];
    const routes2: Route[] = [{ priority: 0.5, url: "https://example.com/a" }];

    const merged = mergeRoutes(routes1, routes2);

    expect(merged).toHaveLength(1);
    expect(merged[0]!.priority).toBe(0.8);
  });

  it("should handle empty arrays", () => {
    const merged = mergeRoutes([], [], []);

    expect(merged).toHaveLength(0);
  });

  it("should handle single array", () => {
    const routes: Route[] = [{ url: "https://example.com/a" }];

    const merged = mergeRoutes(routes);

    expect(merged).toHaveLength(1);
  });

  it("should merge three arrays", () => {
    const routes1: Route[] = [{ url: "https://example.com/a" }];
    const routes2: Route[] = [{ url: "https://example.com/b" }];
    const routes3: Route[] = [{ url: "https://example.com/c" }];

    const merged = mergeRoutes(routes1, routes2, routes3);

    expect(merged).toHaveLength(3);
  });
});

describe("resolveRoutes", () => {
  it("should resolve sync array routes", async () => {
    const loadResult: LoadResult = {
      allSources: [
        {
          name: "default",
          routes: [{ url: "https://example.com/" }],
        },
      ],
      defaultRoutes: [{ url: "https://example.com/" }],
      namedExports: new Map(),
    };

    const resolved = await resolveRoutes(loadResult);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.name).toBe("default");
    expect(resolved[0]!.routes).toHaveLength(1);
    expect(resolved[0]!.routes[0]!.url).toBe("https://example.com/");
  });

  it("should resolve async function routes", async () => {
    const asyncRoutes = async (): Promise<Route[]> => {
      return [{ url: "https://example.com/async" }];
    };

    const loadResult: LoadResult = {
      allSources: [
        {
          name: "default",
          routes: asyncRoutes,
        },
      ],
      defaultRoutes: asyncRoutes,
      namedExports: new Map(),
    };

    const resolved = await resolveRoutes(loadResult);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.routes[0]!.url).toBe("https://example.com/async");
  });

  it("should resolve sync function routes", async () => {
    const syncFn = (): Route[] => [{ url: "https://example.com/sync" }];

    const loadResult: LoadResult = {
      allSources: [
        {
          name: "default",
          routes: syncFn,
        },
      ],
      defaultRoutes: syncFn,
      namedExports: new Map(),
    };

    const resolved = await resolveRoutes(loadResult);

    expect(resolved).toHaveLength(1);
    expect(resolved[0]!.routes[0]!.url).toBe("https://example.com/sync");
  });

  it("should resolve multiple named exports", async () => {
    const pagesRoutes: Route[] = [{ url: "https://example.com/page" }];
    const blogRoutes: Route[] = [{ url: "https://example.com/blog" }];

    const namedExports = new Map<string, Route[]>();
    namedExports.set("pages", pagesRoutes);
    namedExports.set("blog", blogRoutes);

    const loadResult: LoadResult = {
      allSources: [
        { name: "pages", routes: pagesRoutes },
        { name: "blog", routes: blogRoutes },
      ],
      defaultRoutes: undefined,
      namedExports,
    };

    const resolved = await resolveRoutes(loadResult);

    expect(resolved).toHaveLength(2);
    expect(resolved[0]!.name).toBe("pages");
    expect(resolved[1]!.name).toBe("blog");
  });

  it("should handle empty allSources", async () => {
    const loadResult: LoadResult = {
      allSources: [],
      defaultRoutes: undefined,
      namedExports: new Map(),
    };

    const resolved = await resolveRoutes(loadResult);

    expect(resolved).toHaveLength(0);
  });

  it("should handle mixed sync and async sources", async () => {
    const syncRoutes: Route[] = [{ url: "https://example.com/sync" }];
    const asyncFn = async (): Promise<Route[]> => [{ url: "https://example.com/async" }];

    const loadResult: LoadResult = {
      allSources: [
        { name: "sync", routes: syncRoutes },
        { name: "async", routes: asyncFn },
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
