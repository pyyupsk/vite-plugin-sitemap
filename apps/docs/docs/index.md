---
layout: home

hero:
  name: "vite-plugin-sitemap"
  text: "XML Sitemaps for Vite"
  tagline: A modern, type-safe Vite plugin for generating XML sitemaps with full Google extensions support
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pyyupsk/vite-plugin-sitemap

features:
  - icon: 🛡️
    title: Type-Safe
    details: Full TypeScript support with strict mode. Zod-powered runtime validation ensures your sitemap configuration is always correct.
  - icon: 🌐
    title: Google Extensions
    details: First-class support for Image, Video, News sitemaps and hreflang internationalization annotations.
  - icon: ⚡
    title: Zero Runtime
    details: Generates sitemaps at build time only. No impact on your client bundle size or runtime performance.
  - icon: 🔧
    title: Dev Mode Support
    details: Preview sitemap.xml and robots.txt dynamically during development without running a build.
  - icon: 💻
    title: Powerful CLI
    details: Validate, preview, and generate sitemaps without a full Vite build. Perfect for CI/CD pipelines.
  - icon: 📈
    title: Scalable
    details: Automatic splitting for large sitemaps. Handles 50,000+ URLs with sitemap index generation.
  - icon: 🔄
    title: Async Routes
    details: Fetch routes from APIs, databases, or CMSs at build time with async route generators.
  - icon: 🤖
    title: LLM-Friendly Docs
    details: Machine-readable documentation via llms.txt for AI assistants and code generation tools.
    link: /llms.txt
    linkText: View llms.txt
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
