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
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
        description: "A test video",
        // Missing content_loc and player_loc - one is required
      },
    ],
  },

  // Video with invalid rating (too high)
  {
    url: "https://example.com/video2",
    videos: [
      {
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
        description: "A test video",
        content_loc: "https://example.com/video.mp4",
        rating: 10, // Max is 5.0
      },
    ],
  },

  // Video with duration too long
  {
    url: "https://example.com/video3",
    videos: [
      {
        thumbnail_loc: "https://example.com/thumb.jpg",
        title: "Test Video",
        description: "A test video",
        content_loc: "https://example.com/video.mp4",
        duration: 50000, // Max is 28800 seconds (8 hours)
      },
    ],
  },
] satisfies Route[];
