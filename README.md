# @pyyupsk/vite-plugin-sitemap

A TypeScript-first Vite plugin for generating XML sitemaps from a file-based convention. Zero runtime footprint.

## Features

- **File-based configuration** - Define routes in `src/sitemap.ts`
- **Async support** - Fetch routes from APIs or databases at build time
- **Auto-splitting** - Automatically splits large sitemaps (50,000+ URLs)
- **Google extensions** - Support for images, videos, news, and i18n (hreflang)
- **CLI tools** - Validate, preview, and generate sitemaps without building
- **Zero runtime** - No client bundle impact

## Installation

```bash
npm install --save-dev @pyyupsk/vite-plugin-sitemap
```

## Quick Start

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import sitemap from "@pyyupsk/vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
    }),
  ],
});
```

## Documentation

For full documentation, visit [pyyupsk.github.io/vite-plugin-sitemap](https://pyyupsk.github.io/vite-plugin-sitemap).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
