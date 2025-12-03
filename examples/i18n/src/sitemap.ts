import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Helper to generate alternates for all supported languages
const languages = ["en", "es", "fr", "de", "ja"] as const;

function createMultilingualRoute(path: string): Route {
  const baseUrl = "https://example.com";

  return {
    url: `${baseUrl}/en${path}`,
    alternates: [
      // x-default points to the default language version
      { hreflang: "x-default", href: `${baseUrl}/en${path}` },
      // All language versions
      ...languages.map((lang) => ({
        hreflang: lang,
        href: `${baseUrl}/${lang}${path}`,
      })),
    ],
  };
}

// Generate routes for each language version
function generateAllLanguageRoutes(path: string): Route[] {
  const baseUrl = "https://example.com";

  return languages.map((lang) => ({
    url: `${baseUrl}/${lang}${path}`,
    alternates: [
      { hreflang: "x-default", href: `${baseUrl}/en${path}` },
      ...languages.map((l) => ({
        hreflang: l,
        href: `${baseUrl}/${l}${path}`,
      })),
    ],
  }));
}

export default [
  // Homepage - all language versions with cross-references
  ...generateAllLanguageRoutes("/"),

  // About page - all language versions
  ...generateAllLanguageRoutes("/about"),

  // Contact page - all language versions
  ...generateAllLanguageRoutes("/contact"),

  // Products page - all language versions
  ...generateAllLanguageRoutes("/products"),

  // Region-specific pages (e.g., only available in certain languages)
  {
    url: "https://example.com/en-US/local-deals",
    alternates: [
      { hreflang: "en-US", href: "https://example.com/en-US/local-deals" },
      { hreflang: "en-GB", href: "https://example.com/en-GB/local-deals" },
      { hreflang: "en-AU", href: "https://example.com/en-AU/local-deals" },
    ],
  },
] satisfies Route[];
