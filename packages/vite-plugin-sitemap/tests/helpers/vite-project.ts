/**
 * Vite project template helper for integration tests.
 * Creates minimal Vite projects for testing the plugin.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { build, type InlineConfig } from "vite";

import { type PluginOptions, sitemapPlugin } from "../../src/index";
import { cleanupTempDir, createTempDir } from "./temp-dir";

/**
 * Get the absolute path to the package source.
 */
const PACKAGE_ROOT = resolve(__dirname, "..", "..");

/**
 * Context for a test Vite project.
 */
export interface ViteProjectContext {
  /** Run vite build */
  // eslint-disable-next-line no-unused-vars
  build: (config?: InlineConfig) => Promise<void>;
  /** Clean up the project directory */
  cleanup: () => Promise<void>;
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
  pluginOptions?: PluginOptions;
  /** Sitemap file content (TypeScript) */
  sitemapContent?: string;
}

/**
 * Get the absolute path to the Route type import for use in custom sitemap content.
 */
export function getRouteTypesImportPath(): string {
  return join(PACKAGE_ROOT, "src", "types", "sitemap").replaceAll("\\", "/");
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
 * Create a Vite project with async sitemap content.
 */
export async function createAsyncSitemapProject(): Promise<ViteProjectContext> {
  const typesPath = join(PACKAGE_ROOT, "src", "types", "sitemap").replaceAll("\\", "/");
  return createViteProject({
    sitemapContent: `import type { Route } from "${typesPath}";

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
  const { files = {}, pluginOptions = {}, sitemapContent = getDefaultSitemapContent() } = options;

  // Create temp directory
  const root = await createTempDir("vite-test-");
  const srcDir = join(root, "src");
  const outDir = join(root, "dist");

  // Create directories
  await mkdir(srcDir, { recursive: true });

  // Create index.html
  await writeFile(join(root, "index.html"), DEFAULT_INDEX_HTML);

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
        build: {
          outDir,
          rollupOptions: {
            input: join(root, "index.html"),
          },
        },
        configFile: false,
        logLevel: "silent",
        plugins: [sitemapPlugin(pluginOptions)],
        root,
        ...config,
      });
    },
    cleanup: () => cleanupTempDir(root),
    outDir,
    root,
    sitemapPath,
  };

  return context;
}

/**
 * Get the default sitemap.ts content with absolute import path.
 */
function getDefaultSitemapContent(): string {
  const typesPath = join(PACKAGE_ROOT, "src", "types", "sitemap").replaceAll("\\", "/");
  return `import type { Route } from "${typesPath}";

export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
] satisfies Route[];
`;
}
