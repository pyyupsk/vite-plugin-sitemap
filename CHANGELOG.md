# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-11-29

### Added

- Dev mode support: serve `/sitemap.xml` dynamically during development
- Dev mode support: serve `/robots.txt` during development (when `generateRobotsTxt: true`)

## [0.1.1] - 2025-11-29

### Fixed

- Fix TypeScript type conflict when using `bun link` for local development
- Remove Vite types from public API to avoid type resolution conflicts when package is symlinked
- Use `Symbol.for()` to store plugin options for CLI access across module boundaries

## [0.1.0] - 2025-11-28

### Added

- **Vite Plugin**: Automatic sitemap generation during build via `closeBundle` hook
- **File-based Configuration**: Define routes in `src/sitemap.ts` with TypeScript support
- **Route Discovery**: Auto-discovery of sitemap files with configurable paths
- **Google Sitemap Extensions**:
  - Image sitemaps with caption, title, license, and geo-location support
  - Video sitemaps with full metadata (duration, rating, platform restrictions, etc.)
  - News sitemaps with publication info and stock tickers
  - Multilingual support via `hreflang` alternate links
- **Auto-splitting**: Automatic sitemap splitting when exceeding 50,000 URLs or 45MB size limit
- **Sitemap Index**: Automatic generation of sitemap index for split sitemaps
- **robots.txt Integration**: Optional generation/update of robots.txt with Sitemap directive
- **Validation**: Comprehensive Zod-based validation with detailed error messages
  - URL validation (protocol, length, format)
  - W3C Datetime format validation
  - Priority range validation (0.0-1.0)
  - Extension-specific validation (video duration, tag limits, etc.)
- **CLI Tool** (`vite-sitemap`):
  - `validate` - Validate sitemap configuration without generating files
  - `preview` - Preview generated sitemap XML in console
  - `generate` - Generate sitemap files outside of Vite build
- **Route Transformation**: Custom `transform` function to modify or filter routes
- **Custom Serialization**: Optional `serialize` function for custom XML output
- **Exclusion Patterns**: Support for string and RegExp patterns to exclude URLs
- **Default Values**: Configurable defaults for `changefreq`, `lastmod`, and `priority`
- **Named Exports**: Support for multiple sitemaps via named exports in sitemap file
- **TypeScript**: Full TypeScript support with exported types for routes and configuration
