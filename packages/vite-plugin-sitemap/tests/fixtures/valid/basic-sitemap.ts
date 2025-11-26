/**
 * Basic sitemap with minimal configuration.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
] satisfies Route[];
