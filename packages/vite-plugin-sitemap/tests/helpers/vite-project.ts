/**
 * Vite project template helper for integration tests.
 * Creates minimal Vite projects for testing the plugin.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { build, type InlineConfig } from "vite";

import { cleanupTempDir, createTempDir } from "./temp-dir";

/**
 * Context for a test Vite project.
 */
export interface ViteProjectContext {
  /** Run vite build */
  // eslint-disable-next-line no-unused-vars
  build: (config?: InlineConfig) => Promise<void>;
  /** Clean up the project directory */
  cleanup: () => Promise<void>;
  /** Path to vite.config.ts */
  configPath: string;
  /** Output directory (dist) */
  outDir: string;
  /** Root directory of the project */
  root: string;
  /** Path to sitemap.ts (if created) */
  sitemapPath?: string;
}

/**
 * Options for creating a test Vite project.
 */
export interface ViteProjectOptions {
  /** Additional files to create: { path: content } */
  files?: Record<string, string>;
  /** Plugin options to pass */
  pluginOptions?: Record<string, unknown>;
  /** Sitemap file content (TypeScript) */
  sitemapContent?: string;
  /** Custom vite.config.ts content */
  viteConfig?: string;
}

/**
 * Default minimal vite.config.ts template.
 */
function getDefaultViteConfig(pluginOptions: Record<string, unknown> = {}): string {
  const optionsStr = JSON.stringify(pluginOptions, null, 2);
  return `import { defineConfig } from "vite";
import sitemap from "../../../src/index";

export default defineConfig({
  plugins: [sitemap(${optionsStr})],
  build: {
    rollupOptions: {
      input: "./index.html"
    }
  }
});
`;
}

/**
 * Default minimal index.html.
 */
const DEFAULT_INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Test Page</h1>
  </body>
</html>
`;

/**
 * Default sitemap.ts content.
 */
const DEFAULT_SITEMAP_CONTENT = `import type { Route } from "../../../src/types/sitemap";

export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
] satisfies Route[];
`;

/**
 * Create a Vite project with async sitemap content.
 */
export async function createAsyncSitemapProject(): Promise<ViteProjectContext> {
  return createViteProject({
    sitemapContent: `import type { Route } from "../../../src/types/sitemap";

export default async function getRoutes(): Promise<Route[]> {
  // Simulate async data fetching
  await new Promise(resolve => setTimeout(resolve, 10));
  return [
    { url: "https://example.com/" },
    { url: "https://example.com/async-page" },
  ];
}
`,
  });
}

/**
 * Create a Vite project without a sitemap file.
 */
export async function createProjectWithoutSitemap(): Promise<ViteProjectContext> {
  return createViteProject({
    sitemapContent: undefined,
  });
}

/**
 * Create a Vite project with robots.txt generation enabled.
 */
export async function createProjectWithRobots(
  existingRobots?: string,
): Promise<ViteProjectContext> {
  const files: Record<string, string> = {};

  if (existingRobots) {
    files["public/robots.txt"] = existingRobots;
  }

  return createViteProject({
    files,
    pluginOptions: {
      generateRobotsTxt: true,
      hostname: "https://example.com",
    },
  });
}

/**
 * Create a minimal Vite project for testing.
 *
 * @param options Project options
 * @returns Project context with paths and utilities
 */
export async function createViteProject(
  options: ViteProjectOptions = {},
): Promise<ViteProjectContext> {
  const {
    files = {},
    pluginOptions = {},
    sitemapContent = DEFAULT_SITEMAP_CONTENT,
    viteConfig,
  } = options;

  // Create temp directory
  const root = await createTempDir("vite-test-");
  const srcDir = join(root, "src");
  const outDir = join(root, "dist");

  // Create directories
  await mkdir(srcDir, { recursive: true });

  // Create index.html
  await writeFile(join(root, "index.html"), DEFAULT_INDEX_HTML);

  // Create vite.config.ts
  const configPath = join(root, "vite.config.ts");
  const configContent = viteConfig ?? getDefaultViteConfig(pluginOptions);
  await writeFile(configPath, configContent);

  // Create sitemap.ts if content provided
  let sitemapPath: string | undefined;
  if (sitemapContent) {
    sitemapPath = join(srcDir, "sitemap.ts");
    await writeFile(sitemapPath, sitemapContent);
  }

  // Create additional files
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = join(root, relativePath);
    const fileDir = join(filePath, "..");
    await mkdir(fileDir, { recursive: true });
    await writeFile(filePath, content);
  }

  const context: ViteProjectContext = {
    build: async (config?: InlineConfig) => {
      await build({
        configFile: configPath,
        logLevel: "silent",
        root,
        ...config,
      });
    },
    cleanup: () => cleanupTempDir(root),
    configPath,
    outDir,
    root,
    sitemapPath,
  };

  return context;
}
