# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- Comprehensive test suite covering unit, integration, and edge cases
- Test helpers for CLI execution, temp directories, and Vite project scaffolding
- Edge case tests for boundary values, concurrent operations, empty sitemaps, invalid input, and large sitemaps
- Unit tests for CLI commands (generate, preview, validate)
- Unit tests for core modules (discovery, generator, loader, robots, splitter)
- Vite integration tests with actual build scenarios

### Changed

- Lint scripts now include tests directory
- Discovery module now uses dependency injection for fs functions to avoid Vite build caching issues
- Transform function now correctly distinguishes `undefined` (keep original route) from `null` (remove route)
- URL encoding now XML-escapes ampersands and special characters per sitemap.org specification
- Simplified W3C datetime regex pattern

### Fixed

- Plugin now correctly handles absolute output directory paths
- Default sitemapFile option is now undefined to enable auto-discovery
