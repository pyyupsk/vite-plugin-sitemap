/**
 * Invalid sitemap with bad date formats.
 * Used for testing validation error messages.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Invalid date format (US style)
  { url: "https://example.com/page1", lastmod: "01/15/2024" },

  // Invalid date format (wrong separator)
  { url: "https://example.com/page2", lastmod: "2024.01.15" },

  // Invalid month
  { url: "https://example.com/page3", lastmod: "2024-13-01" },

  // Invalid day
  { url: "https://example.com/page4", lastmod: "2024-01-32" },

  // Invalid format (just text)
  { url: "https://example.com/page5", lastmod: "January 15, 2024" },
] satisfies Route[];
