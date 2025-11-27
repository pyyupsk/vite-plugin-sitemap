/**
 * Invalid sitemap with bad date formats.
 * Used for testing validation error messages.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Invalid date format (US style)
  { lastmod: "01/15/2024", url: "https://example.com/page1" },

  // Invalid date format (wrong separator)
  { lastmod: "2024.01.15", url: "https://example.com/page2" },

  // Invalid month
  { lastmod: "2024-13-01", url: "https://example.com/page3" },

  // Invalid day
  { lastmod: "2024-01-32", url: "https://example.com/page4" },

  // Invalid format (just text)
  { lastmod: "January 15, 2024", url: "https://example.com/page5" },
] satisfies Route[];
