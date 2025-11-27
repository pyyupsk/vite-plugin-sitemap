/**
 * Zod schema validation tests.
 * Tests for schemas.ts module.
 */

import { describe, expect, it } from "vitest";

import {
  alternateSchema,
  changeFrequencySchema,
  imageSchema,
  newsSchema,
  prioritySchema,
  routeSchema,
  urlSchema,
  videoSchema,
  w3cDatetimeSchema,
} from "../../../src/validation/schemas";

describe("changeFrequencySchema", () => {
  const validValues = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

  it.each(validValues)("should accept valid changefreq value: %s", (value) => {
    const result = changeFrequencySchema.safeParse(value);
    expect(result.success).toBe(true);
  });

  it("should reject invalid changefreq value", () => {
    const result = changeFrequencySchema.safeParse("sometimes");
    expect(result.success).toBe(false);
  });

  it("should reject number instead of string", () => {
    const result = changeFrequencySchema.safeParse(7);
    expect(result.success).toBe(false);
  });

  it("should reject empty string", () => {
    const result = changeFrequencySchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("urlSchema", () => {
  it("should accept valid https URL", () => {
    const result = urlSchema.safeParse("https://example.com/page");
    expect(result.success).toBe(true);
  });

  it("should accept valid http URL", () => {
    const result = urlSchema.safeParse("http://example.com/page");
    expect(result.success).toBe(true);
  });

  it("should reject URL without protocol", () => {
    const result = urlSchema.safeParse("example.com/page");
    expect(result.success).toBe(false);
  });

  it("should reject URL with fragment", () => {
    const result = urlSchema.safeParse("https://example.com/page#section");
    expect(result.success).toBe(false);
  });

  it("should reject URL exceeding max length", () => {
    const longUrl = "https://example.com/" + "x".repeat(2050);
    const result = urlSchema.safeParse(longUrl);
    expect(result.success).toBe(false);
  });
});

describe("w3cDatetimeSchema", () => {
  it("should accept valid YYYY-MM-DD date", () => {
    const result = w3cDatetimeSchema.safeParse("2024-01-15");
    expect(result.success).toBe(true);
  });

  it("should accept valid YYYY date", () => {
    const result = w3cDatetimeSchema.safeParse("2024");
    expect(result.success).toBe(true);
  });

  it("should accept valid datetime with timezone", () => {
    const result = w3cDatetimeSchema.safeParse("2024-01-15T10:30:00Z");
    expect(result.success).toBe(true);
  });

  it("should reject invalid date format", () => {
    const result = w3cDatetimeSchema.safeParse("2024/01/15");
    expect(result.success).toBe(false);
  });

  it("should reject invalid date", () => {
    const result = w3cDatetimeSchema.safeParse("invalid");
    expect(result.success).toBe(false);
  });
});

describe("prioritySchema", () => {
  it("should accept 0.0", () => {
    const result = prioritySchema.safeParse(0.0);
    expect(result.success).toBe(true);
  });

  it("should accept 0.5", () => {
    const result = prioritySchema.safeParse(0.5);
    expect(result.success).toBe(true);
  });

  it("should accept 1.0", () => {
    const result = prioritySchema.safeParse(1.0);
    expect(result.success).toBe(true);
  });

  it("should reject negative value", () => {
    const result = prioritySchema.safeParse(-0.1);
    expect(result.success).toBe(false);
  });

  it("should reject value greater than 1.0", () => {
    const result = prioritySchema.safeParse(1.5);
    expect(result.success).toBe(false);
  });

  it("should reject non-number", () => {
    const result = prioritySchema.safeParse("high");
    expect(result.success).toBe(false);
  });
});

describe("imageSchema", () => {
  it("should accept valid image with required loc", () => {
    const result = imageSchema.safeParse({
      loc: "https://example.com/image.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("should accept image with all optional fields", () => {
    const result = imageSchema.safeParse({
      caption: "Test image",
      geo_location: "New York, NY",
      license: "https://example.com/license",
      loc: "https://example.com/image.jpg",
      title: "Image Title",
    });
    expect(result.success).toBe(true);
  });

  it("should reject image without loc", () => {
    const result = imageSchema.safeParse({
      caption: "Test image",
    });
    expect(result.success).toBe(false);
  });

  it("should reject image with invalid loc URL", () => {
    const result = imageSchema.safeParse({
      loc: "invalid-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("videoSchema", () => {
  const validVideo = {
    content_loc: "https://example.com/video.mp4",
    description: "A test video description",
    thumbnail_loc: "https://example.com/thumb.jpg",
    title: "Test Video",
  };

  it("should accept valid video with content_loc", () => {
    const result = videoSchema.safeParse(validVideo);
    expect(result.success).toBe(true);
  });

  it("should accept valid video with player_loc", () => {
    const result = videoSchema.safeParse({
      description: "A test video description",
      player_loc: "https://example.com/player",
      thumbnail_loc: "https://example.com/thumb.jpg",
      title: "Test Video",
    });
    expect(result.success).toBe(true);
  });

  it("should reject video without content_loc or player_loc", () => {
    const result = videoSchema.safeParse({
      description: "A test video description",
      thumbnail_loc: "https://example.com/thumb.jpg",
      title: "Test Video",
    });
    expect(result.success).toBe(false);
  });

  it("should reject video with duration exceeding max", () => {
    const result = videoSchema.safeParse({
      ...validVideo,
      duration: 30000, // exceeds 28800 max
    });
    expect(result.success).toBe(false);
  });

  it("should reject video with rating exceeding max", () => {
    const result = videoSchema.safeParse({
      ...validVideo,
      rating: 6.0, // exceeds 5.0 max
    });
    expect(result.success).toBe(false);
  });

  it("should accept video with all optional fields", () => {
    const result = videoSchema.safeParse({
      ...validVideo,
      duration: 300,
      family_friendly: true,
      live: false,
      publication_date: "2024-01-15",
      rating: 4.5,
      requires_subscription: false,
      tag: ["test", "video"],
      view_count: 1000,
    });
    expect(result.success).toBe(true);
  });
});

describe("newsSchema", () => {
  const validNews = {
    publication: {
      language: "en",
      name: "Test Publication",
    },
    publication_date: "2024-01-15",
    title: "Test News Article",
  };

  it("should accept valid news item", () => {
    const result = newsSchema.safeParse(validNews);
    expect(result.success).toBe(true);
  });

  it("should accept news with optional fields", () => {
    const result = newsSchema.safeParse({
      ...validNews,
      keywords: "test, news, article",
      stock_tickers: "GOOG, AAPL",
    });
    expect(result.success).toBe(true);
  });

  it("should reject news without publication", () => {
    const result = newsSchema.safeParse({
      publication_date: "2024-01-15",
      title: "Test News Article",
    });
    expect(result.success).toBe(false);
  });

  it("should reject news with too many stock tickers", () => {
    const result = newsSchema.safeParse({
      ...validNews,
      stock_tickers: "A, B, C, D, E, F", // more than 5
    });
    expect(result.success).toBe(false);
  });
});

describe("alternateSchema", () => {
  it("should accept valid alternate", () => {
    const result = alternateSchema.safeParse({
      href: "https://example.com/en/page",
      hreflang: "en",
    });
    expect(result.success).toBe(true);
  });

  it("should accept alternate with region code", () => {
    const result = alternateSchema.safeParse({
      href: "https://example.com/en-us/page",
      hreflang: "en-US",
    });
    expect(result.success).toBe(true);
  });

  it("should reject alternate without href", () => {
    const result = alternateSchema.safeParse({
      hreflang: "en",
    });
    expect(result.success).toBe(false);
  });

  it("should reject alternate with too short hreflang", () => {
    const result = alternateSchema.safeParse({
      href: "https://example.com/page",
      hreflang: "e",
    });
    expect(result.success).toBe(false);
  });
});

describe("routeSchema", () => {
  it("should accept minimal route with just URL", () => {
    const result = routeSchema.safeParse({
      url: "https://example.com/",
    });
    expect(result.success).toBe(true);
  });

  it("should accept route with all optional fields", () => {
    const result = routeSchema.safeParse({
      changefreq: "daily",
      lastmod: "2024-01-15",
      priority: 0.8,
      url: "https://example.com/",
    });
    expect(result.success).toBe(true);
  });

  it("should accept route with images", () => {
    const result = routeSchema.safeParse({
      images: [{ loc: "https://example.com/image.jpg" }],
      url: "https://example.com/",
    });
    expect(result.success).toBe(true);
  });

  it("should reject route with too many images", () => {
    const images = Array.from({ length: 1001 }, (_, i) => ({
      loc: `https://example.com/image${i}.jpg`,
    }));
    const result = routeSchema.safeParse({
      images,
      url: "https://example.com/",
    });
    expect(result.success).toBe(false);
  });

  it("should accept route with alternates", () => {
    const result = routeSchema.safeParse({
      alternates: [
        { href: "https://example.com/en/", hreflang: "en" },
        { href: "https://example.com/de/", hreflang: "de" },
      ],
      url: "https://example.com/",
    });
    expect(result.success).toBe(true);
  });

  it("should reject route without URL", () => {
    const result = routeSchema.safeParse({
      lastmod: "2024-01-15",
    });
    expect(result.success).toBe(false);
  });

  it("should reject route with invalid URL", () => {
    const result = routeSchema.safeParse({
      url: "invalid-url",
    });
    expect(result.success).toBe(false);
  });
});
