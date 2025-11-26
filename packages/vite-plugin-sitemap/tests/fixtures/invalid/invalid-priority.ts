/**
 * Invalid sitemap with bad priority values.
 * Priority must be between 0.0 and 1.0.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Priority too high
  { url: "https://example.com/page1", priority: 1.5 },

  // Negative priority
  { url: "https://example.com/page2", priority: -0.5 },

  // Priority way out of range
  { url: "https://example.com/page3", priority: 100 },
] satisfies Route[];
