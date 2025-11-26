/**
 * Invalid sitemap with bad URLs.
 * Used for testing validation error messages.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Missing protocol
  { url: "example.com/page" },

  // Invalid protocol
  { url: "ftp://example.com/file" },

  // URL with fragment (not allowed in sitemaps)
  { url: "https://example.com/page#section" },

  // Empty URL
  { url: "" },

  // Relative URL without hostname configured
  { url: "/relative/path" },
] satisfies Route[];
