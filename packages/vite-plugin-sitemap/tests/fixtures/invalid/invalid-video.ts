/**
 * Invalid sitemap with bad video configuration.
 * Used for testing validation error messages.
 */

import type { Route } from "../../../src/types/sitemap";

export default [
  // Video missing both content_loc and player_loc
  {
    url: "https://example.com/video1",
    videos: [
      {
        description: "A test video",
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
        // Missing content_loc and player_loc - one is required
      },
    ],
  },

  // Video with invalid rating (too high)
  {
    url: "https://example.com/video2",
    videos: [
      {
        content_loc: "https://example.com/video.mp4",
        description: "A test video",
        rating: 10, // Max is 5.0
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
      },
    ],
  },

  // Video with duration too long
  {
    url: "https://example.com/video3",
    videos: [
      {
        content_loc: "https://example.com/video.mp4",
        description: "A test video",
        duration: 50000, // Max is 28800 seconds (8 hours)
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
      },
    ],
  },
] satisfies Route[];
