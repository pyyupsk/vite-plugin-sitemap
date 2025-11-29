import { defineConfig } from "vitepress";

export default defineConfig({
  title: "vite-plugin-sitemap",
  description: "A modern Vite plugin for generating XML sitemaps with Google extensions support",
  base: "/vite-plugin-sitemap/",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#646cff" }],
    [
      "meta",
      {
        name: "og:description",
        content: "A modern Vite plugin for generating XML sitemaps with Google extensions support",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Config", link: "/config/" },
      { text: "API", link: "/api/" },
      {
        text: "v0.2.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/pyyupsk/vite-plugin-sitemap/releases",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Why This Plugin?", link: "/guide/why" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "Route Definition", link: "/guide/routes" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
        {
          text: "Google Extensions",
          items: [
            { text: "Image Sitemaps", link: "/guide/extensions/images" },
            { text: "Video Sitemaps", link: "/guide/extensions/videos" },
            { text: "News Sitemaps", link: "/guide/extensions/news" },
            { text: "Internationalization", link: "/guide/extensions/i18n" },
          ],
        },
        {
          text: "Tools",
          items: [{ text: "CLI", link: "/guide/cli" }],
        },
        {
          text: "Advanced",
          items: [
            { text: "Large Sitemaps", link: "/guide/advanced/large-sitemaps" },
            { text: "Dynamic Routes", link: "/guide/advanced/dynamic-routes" },
            { text: "Custom Serialization", link: "/guide/advanced/custom-serialization" },
          ],
        },
      ],
      "/config/": [
        {
          text: "Configuration",
          items: [
            { text: "Plugin Options", link: "/config/" },
            { text: "Route Options", link: "/config/route" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Overview", link: "/api/" },
            { text: "Types", link: "/api/types" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/pyyupsk/vite-plugin-sitemap" },
      { icon: "npm", link: "https://www.npmjs.com/package/@pyyupsk/vite-plugin-sitemap" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 pyyupsk",
    },

    search: {
      provider: "local",
    },

    editLink: {
      pattern: "https://github.com/pyyupsk/vite-plugin-sitemap/edit/main/apps/docs/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
