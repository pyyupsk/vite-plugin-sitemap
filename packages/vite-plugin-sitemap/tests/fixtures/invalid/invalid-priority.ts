/**
 * Invalid sitemap with bad priority values.
 * Priority must be between 0.0 and 1.0.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Priority too high
  { priority: 1.5, url: "https://example.com/page1" },

  // Negative priority
  { priority: -0.5, url: "https://example.com/page2" },

  // Priority way out of range
  { priority: 100, url: "https://example.com/page3" },
] satisfies Route[];
