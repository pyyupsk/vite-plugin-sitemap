/**
 * Temporary directory utilities for integration tests.
 * Provides isolated test environments with automatic cleanup.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Context manager for temporary directory.
 * Automatically cleans up when done.
 */
export interface TempDirContext {
  /** Clean up the temp directory */
  cleanup: () => Promise<void>;
  /** Absolute path to the temp directory */
  path: string;
}

/**
 * Clean up a temporary directory.
 *
 * @param path Path to the directory to remove
 */
export async function cleanupTempDir(path: string): Promise<void> {
  try {
    await rm(path, { force: true, recursive: true });
  } catch {
    // Ignore cleanup errors - directory may already be removed
  }
}

/**
 * Create a temporary directory for testing.
 *
 * @param prefix Prefix for the temp directory name
 * @returns Absolute path to the created directory
 */
export async function createTempDir(prefix = "vite-sitemap-test-"): Promise<string> {
  return await mkdtemp(join(tmpdir(), prefix));
}

/**
 * Create a temp directory context for use in tests.
 * Call cleanup() in afterEach/afterAll.
 *
 * @param prefix Prefix for the temp directory name
 * @returns Context with path and cleanup function
 */
export async function createTempDirContext(prefix = "vite-sitemap-test-"): Promise<TempDirContext> {
  const path = await createTempDir(prefix);

  return {
    cleanup: () => cleanupTempDir(path),
    path,
  };
}
