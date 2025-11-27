/**
 * Full-featured sitemap with all extensions.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Basic page
  { url: "https://example.com/" },

  // Page with all standard attributes
  {
    changefreq: "monthly",
    lastmod: "2024-01-15",
    priority: 0.8,
    url: "https://example.com/about",
  },

  // Page with images
  {
    images: [
      {
        caption: "A stunning sunset over the mountains",
        loc: "https://example.com/images/photo1.jpg",
        title: "Beautiful sunset",
      },
      {
        loc: "https://example.com/images/photo2.jpg",
        title: "City skyline",
      },
    ],
    lastmod: "2024-01-10",
    url: "https://example.com/gallery",
  },

  // Page with video
  {
    url: "https://example.com/videos/intro",
    videos: [
      {
        content_loc: "https://example.com/videos/intro.mp4",
        description: "An introduction to our company and services",
        duration: 300,
        family_friendly: true,
        publication_date: "2024-01-01",
        tag: ["intro", "company", "about"],
        thumbnail_loc: "https://example.com/thumbnails/intro.jpg",
        title: "Introduction Video",
      },
    ],
  },

  // News article
  {
    news: {
      keywords: "announcement, news, update",
      publication: {
        language: "en",
        name: "Example News",
      },
      publication_date: "2024-01-15T10:30:00Z",
      title: "Big Announcement",
    },
    url: "https://example.com/news/announcement",
  },

  // Page with hreflang alternates
  {
    alternates: [
      { href: "https://example.com/products", hreflang: "en" },
      { href: "https://example.com/es/productos", hreflang: "es" },
      { href: "https://example.com/fr/produits", hreflang: "fr" },
      { href: "https://example.com/products", hreflang: "x-default" },
    ],
    url: "https://example.com/products",
  },
] satisfies Route[];
