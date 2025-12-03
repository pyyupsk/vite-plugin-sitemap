import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  // Page with images
  {
    url: "https://example.com/gallery",
    images: [
      {
        loc: "https://example.com/images/photo1.jpg",
        title: "Beautiful Sunset",
        caption: "A stunning sunset over the mountains",
        geo_location: "Rocky Mountains, Colorado",
      },
      {
        loc: "https://example.com/images/photo2.jpg",
        title: "City Skyline",
        caption: "Downtown skyline at night",
      },
    ],
  },

  // Page with video
  {
    url: "https://example.com/tutorials/getting-started",
    videos: [
      {
        title: "Getting Started Tutorial",
        description: "Learn how to get started with our product in 5 minutes",
        thumbnail_loc: "https://example.com/thumbnails/tutorial-1.jpg",
        content_loc: "https://example.com/videos/tutorial-1.mp4",
        duration: 300,
        publication_date: "2025-01-15",
        rating: 4.5,
        view_count: 12500,
        family_friendly: true,
        tag: ["tutorial", "beginner", "getting-started"],
      },
    ],
  },

  // Page with both images and videos
  {
    url: "https://example.com/products/awesome-widget",
    images: [
      {
        loc: "https://example.com/products/widget-front.jpg",
        title: "Awesome Widget - Front View",
      },
      {
        loc: "https://example.com/products/widget-side.jpg",
        title: "Awesome Widget - Side View",
      },
    ],
    videos: [
      {
        title: "Awesome Widget Demo",
        description: "See the Awesome Widget in action",
        thumbnail_loc: "https://example.com/thumbnails/widget-demo.jpg",
        player_loc: "https://youtube.com/embed/abc123",
        duration: 180,
      },
    ],
  },

  // Regular pages
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
] satisfies Route[];
