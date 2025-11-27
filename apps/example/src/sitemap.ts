import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  // Basic route
  {
    changefreq: "daily",
    priority: 1.0,
    url: "/",
  },

  // Route with images (Google Image sitemap extension)
  {
    changefreq: "weekly",
    images: [
      {
        caption: "A stunning mountain view at sunset",
        geo_location: "Swiss Alps, Switzerland",
        loc: "https://example.com/images/photo1.jpg",
        title: "Beautiful Landscape",
      },
      {
        license: "https://example.com/license",
        loc: "https://example.com/images/photo2.jpg",
        title: "City Skyline",
      },
    ],
    priority: 0.8,
    url: "/gallery",
  },

  // Route with video (Google Video sitemap extension)
  {
    changefreq: "monthly",
    priority: 0.9,
    url: "/videos/tutorial",
    videos: [
      {
        content_loc: "https://example.com/videos/tutorial.mp4",
        description: "Learn how to use our product in this comprehensive guide",
        duration: 300,
        family_friendly: true,
        publication_date: "2025-01-15",
        rating: 4.8,
        tag: ["tutorial", "beginner", "guide"],
        thumbnail_loc: "https://example.com/thumbnails/tutorial.jpg",
        title: "Getting Started Tutorial",
        view_count: 15000,
      },
    ],
  },

  // Route with news (Google News sitemap extension)
  {
    news: {
      keywords: "breaking, news, announcement",
      publication: {
        language: "en",
        name: "Example News",
      },
      publication_date: new Date().toISOString(),
      title: "Breaking: Important Announcement",
    },
    url: "/news/breaking-story",
  },

  // Route with internationalization (hreflang alternates)
  {
    alternates: [
      { href: "https://example.com/products", hreflang: "en" },
      { href: "https://example.com/es/productos", hreflang: "es" },
      { href: "https://example.com/fr/produits", hreflang: "fr" },
      { href: "https://example.com/de/produkte", hreflang: "de" },
      { href: "https://example.com/products", hreflang: "x-default" },
    ],
    changefreq: "weekly",
    priority: 0.8,
    url: "/products",
  },

  // Blog with lastmod
  {
    changefreq: "daily",
    lastmod: new Date().toISOString().split("T")[0],
    priority: 0.9,
    url: "/blog",
  },
] satisfies Route[];
