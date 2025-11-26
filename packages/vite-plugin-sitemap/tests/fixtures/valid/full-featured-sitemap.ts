/**
 * Full-featured sitemap with all extensions.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Basic page
  { url: "https://example.com/" },

  // Page with all standard attributes
  {
    url: "https://example.com/about",
    lastmod: "2024-01-15",
    changefreq: "monthly",
    priority: 0.8,
  },

  // Page with images
  {
    url: "https://example.com/gallery",
    lastmod: "2024-01-10",
    images: [
      {
        loc: "https://example.com/images/photo1.jpg",
        title: "Beautiful sunset",
        caption: "A stunning sunset over the mountains",
      },
      {
        loc: "https://example.com/images/photo2.jpg",
        title: "City skyline",
      },
    ],
  },

  // Page with video
  {
    url: "https://example.com/videos/intro",
    videos: [
      {
        thumbnail_loc: "https://example.com/thumbnails/intro.jpg",
        title: "Introduction Video",
        description: "An introduction to our company and services",
        content_loc: "https://example.com/videos/intro.mp4",
        duration: 300,
        publication_date: "2024-01-01",
        family_friendly: true,
        tag: ["intro", "company", "about"],
      },
    ],
  },

  // News article
  {
    url: "https://example.com/news/announcement",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2024-01-15T10:30:00Z",
      title: "Big Announcement",
      keywords: "announcement, news, update",
    },
  },

  // Page with hreflang alternates
  {
    url: "https://example.com/products",
    alternates: [
      { hreflang: "en", href: "https://example.com/products" },
      { hreflang: "es", href: "https://example.com/es/productos" },
      { hreflang: "fr", href: "https://example.com/fr/produits" },
      { hreflang: "x-default", href: "https://example.com/products" },
    ],
  },
] satisfies Route[];
