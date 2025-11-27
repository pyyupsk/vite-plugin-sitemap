/**
 * XML builder tests.
 * Tests for builder.ts module functions.
 */

import { describe, expect, it } from "vitest";

import type { Alternate, Image, News, Video } from "../../../src/types/extensions";
import type { Route } from "../../../src/types/sitemap";

import {
  buildAlternateElement,
  buildImageElement,
  buildNewsElement,
  buildSitemapIndexXml,
  buildSitemapXml,
  buildUrlElement,
  buildVideoElement,
  calculateByteSize,
} from "../../../src/xml/builder";

describe("buildUrlElement", () => {
  it("should build URL element with only required loc", () => {
    const route: Route = { url: "https://example.com/" };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<url>");
    expect(xml).toContain("</url>");
    expect(xml).toContain("<loc>https://example.com/</loc>");
  });

  it("should include lastmod when provided", () => {
    const route: Route = {
      lastmod: "2024-01-15",
      url: "https://example.com/",
    };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<lastmod>2024-01-15</lastmod>");
  });

  it("should include changefreq when provided", () => {
    const route: Route = {
      changefreq: "daily",
      url: "https://example.com/",
    };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<changefreq>daily</changefreq>");
  });

  it("should include priority with one decimal place", () => {
    const route: Route = {
      priority: 0.8,
      url: "https://example.com/",
    };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<priority>0.8</priority>");
  });

  it("should format priority 1 as 1.0", () => {
    const route: Route = {
      priority: 1,
      url: "https://example.com/",
    };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<priority>1.0</priority>");
  });

  it("should include all optional fields", () => {
    const route: Route = {
      changefreq: "weekly",
      lastmod: "2024-01-15",
      priority: 0.5,
      url: "https://example.com/",
    };
    const xml = buildUrlElement(route);

    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<lastmod>2024-01-15</lastmod>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>0.5</priority>");
  });
});

describe("buildImageElement", () => {
  it("should build image element with required loc", () => {
    const image: Image = { loc: "https://example.com/image.jpg" };
    const xml = buildImageElement(image);

    expect(xml).toContain("<image:image>");
    expect(xml).toContain("</image:image>");
    expect(xml).toContain("<image:loc>https://example.com/image.jpg</image:loc>");
  });

  it("should include caption when provided", () => {
    const image: Image = {
      caption: "A beautiful sunset",
      loc: "https://example.com/image.jpg",
    };
    const xml = buildImageElement(image);

    expect(xml).toContain("<image:caption>A beautiful sunset</image:caption>");
  });

  it("should include title when provided", () => {
    const image: Image = {
      loc: "https://example.com/image.jpg",
      title: "Sunset Photo",
    };
    const xml = buildImageElement(image);

    expect(xml).toContain("<image:title>Sunset Photo</image:title>");
  });

  it("should include geo_location when provided", () => {
    const image: Image = {
      geo_location: "New York, NY",
      loc: "https://example.com/image.jpg",
    };
    const xml = buildImageElement(image);

    expect(xml).toContain("<image:geo_location>New York, NY</image:geo_location>");
  });

  it("should include license when provided", () => {
    const image: Image = {
      license: "https://creativecommons.org/licenses/by/4.0/",
      loc: "https://example.com/image.jpg",
    };
    const xml = buildImageElement(image);

    expect(xml).toContain(
      "<image:license>https://creativecommons.org/licenses/by/4.0/</image:license>",
    );
  });

  it("should escape special characters in caption", () => {
    const image: Image = {
      caption: "Tom & Jerry's <adventure>",
      loc: "https://example.com/image.jpg",
    };
    const xml = buildImageElement(image);

    expect(xml).toContain(
      "<image:caption>Tom &amp; Jerry&apos;s &lt;adventure&gt;</image:caption>",
    );
  });
});

describe("buildVideoElement", () => {
  const validVideo: Video = {
    content_loc: "https://example.com/video.mp4",
    description: "A test video",
    thumbnail_loc: "https://example.com/thumb.jpg",
    title: "Test Video",
  };

  it("should build video element with required fields", () => {
    const xml = buildVideoElement(validVideo);

    expect(xml).toContain("<video:video>");
    expect(xml).toContain("</video:video>");
    expect(xml).toContain(
      "<video:thumbnail_loc>https://example.com/thumb.jpg</video:thumbnail_loc>",
    );
    expect(xml).toContain("<video:title>Test Video</video:title>");
    expect(xml).toContain("<video:description>A test video</video:description>");
    expect(xml).toContain("<video:content_loc>https://example.com/video.mp4</video:content_loc>");
  });

  it("should include player_loc when provided", () => {
    const video: Video = {
      ...validVideo,
      player_loc: "https://example.com/player",
    };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:player_loc>https://example.com/player</video:player_loc>");
  });

  it("should include duration when provided", () => {
    const video: Video = { ...validVideo, duration: 300 };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:duration>300</video:duration>");
  });

  it("should include rating with one decimal", () => {
    const video: Video = { ...validVideo, rating: 4.5 };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:rating>4.5</video:rating>");
  });

  it("should include view_count when provided", () => {
    const video: Video = { ...validVideo, view_count: 1000 };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:view_count>1000</video:view_count>");
  });

  it("should format family_friendly as yes/no", () => {
    const video: Video = { ...validVideo, family_friendly: true };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:family_friendly>yes</video:family_friendly>");
  });

  it("should format family_friendly false as no", () => {
    const video: Video = { ...validVideo, family_friendly: false };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:family_friendly>no</video:family_friendly>");
  });

  it("should format live as yes/no", () => {
    const video: Video = { ...validVideo, live: true };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:live>yes</video:live>");
  });

  it("should format requires_subscription as yes/no", () => {
    const video: Video = { ...validVideo, requires_subscription: true };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:requires_subscription>yes</video:requires_subscription>");
  });

  it("should include tags when provided", () => {
    const video: Video = { ...validVideo, tag: ["test", "video", "sample"] };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:tag>test</video:tag>");
    expect(xml).toContain("<video:tag>video</video:tag>");
    expect(xml).toContain("<video:tag>sample</video:tag>");
  });

  it("should include restriction when provided", () => {
    const video: Video = {
      ...validVideo,
      restriction: { countries: ["US", "CA"], relationship: "allow" },
    };
    const xml = buildVideoElement(video);

    expect(xml).toContain('<video:restriction relationship="allow">US CA</video:restriction>');
  });

  it("should include platform when provided", () => {
    const video: Video = {
      ...validVideo,
      platform: { platforms: ["web", "mobile"], relationship: "allow" },
    };
    const xml = buildVideoElement(video);

    expect(xml).toContain('<video:platform relationship="allow">web mobile</video:platform>');
  });

  it("should include uploader when provided", () => {
    const video: Video = {
      ...validVideo,
      uploader: { name: "Test User" },
    };
    const xml = buildVideoElement(video);

    expect(xml).toContain("<video:uploader>Test User</video:uploader>");
  });

  it("should include uploader with info attribute", () => {
    const video: Video = {
      ...validVideo,
      uploader: { info: "https://example.com/user", name: "Test User" },
    };
    const xml = buildVideoElement(video);

    expect(xml).toContain(
      '<video:uploader info="https://example.com/user">Test User</video:uploader>',
    );
  });
});

describe("buildNewsElement", () => {
  const validNews: News = {
    publication: { language: "en", name: "Test Publication" },
    publication_date: "2024-01-15",
    title: "Test Article",
  };

  it("should build news element with required fields", () => {
    const xml = buildNewsElement(validNews);

    expect(xml).toContain("<news:news>");
    expect(xml).toContain("</news:news>");
    expect(xml).toContain("<news:publication>");
    expect(xml).toContain("<news:name>Test Publication</news:name>");
    expect(xml).toContain("<news:language>en</news:language>");
    expect(xml).toContain("<news:publication_date>2024-01-15</news:publication_date>");
    expect(xml).toContain("<news:title>Test Article</news:title>");
  });

  it("should include keywords when provided", () => {
    const news: News = { ...validNews, keywords: "test, news, article" };
    const xml = buildNewsElement(news);

    expect(xml).toContain("<news:keywords>test, news, article</news:keywords>");
  });

  it("should include stock_tickers when provided", () => {
    const news: News = { ...validNews, stock_tickers: "GOOG, AAPL" };
    const xml = buildNewsElement(news);

    expect(xml).toContain("<news:stock_tickers>GOOG, AAPL</news:stock_tickers>");
  });

  it("should escape special characters in title", () => {
    const news: News = { ...validNews, title: 'Breaking: "Test" & More' };
    const xml = buildNewsElement(news);

    expect(xml).toContain("<news:title>Breaking: &quot;Test&quot; &amp; More</news:title>");
  });
});

describe("buildAlternateElement", () => {
  it("should build xhtml:link element", () => {
    const alternate: Alternate = {
      href: "https://example.com/en/page",
      hreflang: "en",
    };
    const xml = buildAlternateElement(alternate);

    expect(xml).toContain("<xhtml:link");
    expect(xml).toContain('rel="alternate"');
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('href="https://example.com/en/page"');
    expect(xml).toContain("/>");
  });

  it("should handle hreflang with region code", () => {
    const alternate: Alternate = {
      href: "https://example.com/en-us/page",
      hreflang: "en-US",
    };
    const xml = buildAlternateElement(alternate);

    expect(xml).toContain('hreflang="en-US"');
  });

  it("should escape special characters in hreflang", () => {
    const alternate: Alternate = {
      href: "https://example.com/page",
      hreflang: "x-default",
    };
    const xml = buildAlternateElement(alternate);

    expect(xml).toContain('hreflang="x-default"');
  });
});

describe("buildSitemapXml", () => {
  it("should build complete sitemap with XML declaration", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("</urlset>");
  });

  it("should include base namespace", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it("should include image namespace when images present", () => {
    const routes: Route[] = [
      {
        images: [{ loc: "https://example.com/image.jpg" }],
        url: "https://example.com/",
      },
    ];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  });

  it("should include video namespace when videos present", () => {
    const routes: Route[] = [
      {
        url: "https://example.com/",
        videos: [
          {
            content_loc: "https://example.com/video.mp4",
            description: "Test",
            thumbnail_loc: "https://example.com/thumb.jpg",
            title: "Test",
          },
        ],
      },
    ];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  });

  it("should include news namespace when news present", () => {
    const routes: Route[] = [
      {
        news: {
          publication: { language: "en", name: "Test" },
          publication_date: "2024-01-15",
          title: "Test",
        },
        url: "https://example.com/",
      },
    ];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  });

  it("should include xhtml namespace when alternates present", () => {
    const routes: Route[] = [
      {
        alternates: [{ href: "https://example.com/en/", hreflang: "en" }],
        url: "https://example.com/",
      },
    ];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it("should not include unused namespaces", () => {
    const routes: Route[] = [{ url: "https://example.com/" }];
    const xml = buildSitemapXml(routes);

    expect(xml).not.toContain("xmlns:image");
    expect(xml).not.toContain("xmlns:video");
    expect(xml).not.toContain("xmlns:news");
    expect(xml).not.toContain("xmlns:xhtml");
  });

  it("should build multiple URL elements", () => {
    const routes: Route[] = [
      { url: "https://example.com/" },
      { url: "https://example.com/about" },
      { url: "https://example.com/contact" },
    ];
    const xml = buildSitemapXml(routes);

    expect(xml).toContain("<loc>https://example.com/</loc>");
    expect(xml).toContain("<loc>https://example.com/about</loc>");
    expect(xml).toContain("<loc>https://example.com/contact</loc>");
  });
});

describe("buildSitemapIndexXml", () => {
  it("should build sitemap index with XML declaration", () => {
    const sitemaps = [{ loc: "https://example.com/sitemap-1.xml" }];
    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<sitemapindex");
    expect(xml).toContain("</sitemapindex>");
  });

  it("should include base namespace", () => {
    const sitemaps = [{ loc: "https://example.com/sitemap-1.xml" }];
    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it("should build sitemap entries with loc", () => {
    const sitemaps = [
      { loc: "https://example.com/sitemap-1.xml" },
      { loc: "https://example.com/sitemap-2.xml" },
    ];
    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain("<sitemap>");
    expect(xml).toContain("<loc>https://example.com/sitemap-1.xml</loc>");
    expect(xml).toContain("<loc>https://example.com/sitemap-2.xml</loc>");
  });

  it("should include lastmod when provided", () => {
    const sitemaps = [{ lastmod: "2024-01-15", loc: "https://example.com/sitemap-1.xml" }];
    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).toContain("<lastmod>2024-01-15</lastmod>");
  });

  it("should not include lastmod when not provided", () => {
    const sitemaps = [{ loc: "https://example.com/sitemap-1.xml" }];
    const xml = buildSitemapIndexXml(sitemaps);

    expect(xml).not.toContain("<lastmod>");
  });
});

describe("calculateByteSize", () => {
  it("should calculate byte size of ASCII string", () => {
    const xml = "Hello World";
    expect(calculateByteSize(xml)).toBe(11);
  });

  it("should calculate byte size of UTF-8 string with unicode", () => {
    const xml = "日本語"; // 3 characters, 9 bytes in UTF-8
    expect(calculateByteSize(xml)).toBe(9);
  });

  it("should calculate byte size of empty string", () => {
    expect(calculateByteSize("")).toBe(0);
  });

  it("should calculate byte size of typical sitemap XML", () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>';
    expect(calculateByteSize(xml)).toBeGreaterThan(0);
    expect(calculateByteSize(xml)).toBe(xml.length); // ASCII only
  });

  it("should handle emojis correctly", () => {
    const xml = "🎉"; // 1 character, 4 bytes in UTF-8
    expect(calculateByteSize(xml)).toBe(4);
  });
});
