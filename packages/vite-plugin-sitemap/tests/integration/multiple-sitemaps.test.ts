/**
 * Integration tests for multiple sitemap generation.
 * Tests named exports producing separate sitemap files.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createViteProject,
  getRouteTypesImportPath,
  type ViteProjectContext,
} from "../helpers/vite-project";

describe("Multiple sitemaps (named exports)", () => {
  let project: ViteProjectContext;

  afterEach(async () => {
    if (project) {
      await project.cleanup();
    }
  });

  it("should generate separate files for each named export", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
] satisfies Route[];

export const blog: Route[] = [
  { url: "https://example.com/blog" },
];

export const products: Route[] = [
  { url: "https://example.com/products" },
];
`,
    });

    await project.build();

    // Check that all sitemap files exist
    expect(existsSync(join(project.outDir, "sitemap.xml"))).toBe(true);
    expect(existsSync(join(project.outDir, "sitemap-blog.xml"))).toBe(true);
    expect(existsSync(join(project.outDir, "sitemap-products.xml"))).toBe(true);
  });

  it("should include correct routes in each sitemap file", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
] satisfies Route[];

export const blog: Route[] = [
  { url: "https://example.com/blog/post-1" },
  { url: "https://example.com/blog/post-2" },
];
`,
    });

    await project.build();

    // Check default sitemap content
    const defaultContent = readFileSync(join(project.outDir, "sitemap.xml"), "utf-8");
    expect(defaultContent).toContain("https://example.com/");
    expect(defaultContent).toContain("https://example.com/about");
    expect(defaultContent).not.toContain("https://example.com/blog/post-1");

    // Check blog sitemap content
    const blogContent = readFileSync(join(project.outDir, "sitemap-blog.xml"), "utf-8");
    expect(blogContent).toContain("https://example.com/blog/post-1");
    expect(blogContent).toContain("https://example.com/blog/post-2");
    expect(blogContent).not.toContain("https://example.com/about");
  });

  it("should not overwrite named exports with default filename", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      pluginOptions: {
        filename: "sitemap.xml", // Explicit default filename
      },
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
] satisfies Route[];

export const pages: Route[] = [
  { url: "https://example.com/page-1" },
];

export const docs: Route[] = [
  { url: "https://example.com/docs" },
];
`,
    });

    await project.build();

    // All three should exist as separate files
    expect(existsSync(join(project.outDir, "sitemap.xml"))).toBe(true);
    expect(existsSync(join(project.outDir, "sitemap-pages.xml"))).toBe(true);
    expect(existsSync(join(project.outDir, "sitemap-docs.xml"))).toBe(true);

    // Verify content is not mixed
    const defaultContent = readFileSync(join(project.outDir, "sitemap.xml"), "utf-8");
    expect(defaultContent).toContain("https://example.com/");
    expect(defaultContent).not.toContain("https://example.com/page-1");
    expect(defaultContent).not.toContain("https://example.com/docs");

    const pagesContent = readFileSync(join(project.outDir, "sitemap-pages.xml"), "utf-8");
    expect(pagesContent).toContain("https://example.com/page-1");

    const docsContent = readFileSync(join(project.outDir, "sitemap-docs.xml"), "utf-8");
    expect(docsContent).toContain("https://example.com/docs");
  });

  it("should use custom filename only for default export", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      pluginOptions: {
        filename: "custom-sitemap.xml",
      },
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
] satisfies Route[];

export const blog: Route[] = [
  { url: "https://example.com/blog" },
];
`,
    });

    await project.build();

    // Default export uses custom filename
    expect(existsSync(join(project.outDir, "custom-sitemap.xml"))).toBe(true);
    // Named export uses standard naming
    expect(existsSync(join(project.outDir, "sitemap-blog.xml"))).toBe(true);
    // Old default name should not exist
    expect(existsSync(join(project.outDir, "sitemap.xml"))).toBe(false);
  });

  it("should handle only named exports (no default)", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      sitemapContent: `import type { Route } from "${typesPath}";

export const pages: Route[] = [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
];

export const blog: Route[] = [
  { url: "https://example.com/blog" },
];
`,
    });

    await project.build();

    // No default sitemap.xml
    expect(existsSync(join(project.outDir, "sitemap.xml"))).toBe(false);
    // Named exports exist
    expect(existsSync(join(project.outDir, "sitemap-pages.xml"))).toBe(true);
    expect(existsSync(join(project.outDir, "sitemap-blog.xml"))).toBe(true);
  });

  it("should apply hostname to all named export routes", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      pluginOptions: {
        hostname: "https://mysite.com",
      },
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "/" },
] satisfies Route[];

export const blog: Route[] = [
  { url: "/blog/post-1" },
];
`,
    });

    await project.build();

    const defaultContent = readFileSync(join(project.outDir, "sitemap.xml"), "utf-8");
    expect(defaultContent).toContain("<loc>https://mysite.com/</loc>");

    const blogContent = readFileSync(join(project.outDir, "sitemap-blog.xml"), "utf-8");
    expect(blogContent).toContain("<loc>https://mysite.com/blog/post-1</loc>");
  });

  it("should generate valid XML for all named exports", async () => {
    const typesPath = getRouteTypesImportPath();
    project = await createViteProject({
      sitemapContent: `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
] satisfies Route[];

export const blog: Route[] = [
  { url: "https://example.com/blog" },
];
`,
    });

    await project.build();

    // Check XML structure for both files
    const defaultContent = readFileSync(join(project.outDir, "sitemap.xml"), "utf-8");
    expect(defaultContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(defaultContent).toContain("<urlset");
    expect(defaultContent).toContain("</urlset>");

    const blogContent = readFileSync(join(project.outDir, "sitemap-blog.xml"), "utf-8");
    expect(blogContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(blogContent).toContain("<urlset");
    expect(blogContent).toContain("</urlset>");
  });
});
