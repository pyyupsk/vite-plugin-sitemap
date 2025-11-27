/**
 * Invalid sitemap with bad changefreq values.
 * Used for testing validation error messages.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Invalid changefreq value - not in allowed enum
  // @ts-expect-error - intentionally invalid for testing
  { changefreq: "sometimes", url: "https://example.com/page1" },

  // Another invalid value
  // @ts-expect-error - intentionally invalid for testing
  { changefreq: "often", url: "https://example.com/page2" },

  // Invalid type (number instead of string)
  // @ts-expect-error - intentionally invalid for testing
  { changefreq: 7, url: "https://example.com/page3" },

  // Empty string
  // @ts-expect-error - intentionally invalid for testing
  { changefreq: "", url: "https://example.com/page4" },
] satisfies Route[];
