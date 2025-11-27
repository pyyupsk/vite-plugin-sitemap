# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive unit tests for validation and XML modules
- Test helpers for CLI execution, temp directories, and Vite project scaffolding
- New test fixtures (empty-sitemap, large-sitemap, invalid-changefreq)

### Changed

- Lint scripts now include tests directory

## [0.1.0] - 2025-11-26

### Added

- Initial release of @pyyupsk/vite-plugin-sitemap
- File-based sitemap configuration via `src/sitemap.ts`
- Support for async route generation (fetch from APIs/databases)
- Google sitemap extensions:
  - Image sitemaps
  - Video sitemaps
  - News sitemaps
  - Internationalization (hreflang alternates)
- Auto-splitting for large sitemaps (50,000+ URLs)
- Sitemap index generation for multiple sitemaps
- robots.txt generation with Sitemap directive
- CLI commands:
  - `vite-sitemap validate` - Check configuration for errors
  - `vite-sitemap preview` - Preview generated XML
  - `vite-sitemap generate` - Generate sitemaps without full build
- Zod-based validation with helpful error messages
- TypeScript-first with full type definitions
- Zero client bundle impact (build-time only)
- Support for Vite 7.x
