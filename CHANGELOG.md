## [0.2.3](https://github.com/pyyupsk/vite-plugin-sitemap/compare/v0.2.2...v0.2.3) (2026-01-16)

### Features

- add release workflow with standard-version ([73a9869](https://github.com/pyyupsk/vite-plugin-sitemap/commit/73a9869109febf067e385821acdc62a5ed617f52))
- **release:** add changelogithub for GitHub release notes ([033b593](https://github.com/pyyupsk/vite-plugin-sitemap/commit/033b5934cb36c7f8c50ee0cd32d2734c563ad1d0))
- **release:** migrate from standard-version to release-it ([63c2cff](https://github.com/pyyupsk/vite-plugin-sitemap/commit/63c2cffa623a9817a023846beea107c1c9541f0b))
- **release:** use changelogithub for GitHub release notes ([1ab5a74](https://github.com/pyyupsk/vite-plugin-sitemap/commit/1ab5a74527e793e6167703292df3a2d15201bbc4))

### Bug Fixes

- **ci:** install conventionalcommits preset for changelog generation ([c30f5cc](https://github.com/pyyupsk/vite-plugin-sitemap/commit/c30f5cc8bacd04035489943e0c0763d6e0fcab06))
- **ci:** use jq for version bump to avoid npm workspace protocol error ([b164db2](https://github.com/pyyupsk/vite-plugin-sitemap/commit/b164db2a35e6c72f6bc2aef5e27397b39146d73e))
- **deps:** pin conventional-changelog-conventionalcommits to v8 ([3511e73](https://github.com/pyyupsk/vite-plugin-sitemap/commit/3511e7325531a8641d8eb69c8460c645448aa3f7))
- **docs:** use bunx for vite-sitemap CLI in postbuild script ([634003b](https://github.com/pyyupsk/vite-plugin-sitemap/commit/634003bd64e9053aa64af30561410d05627301cd))
- **docs:** use direct path to CLI for CI compatibility ([eb93029](https://github.com/pyyupsk/vite-plugin-sitemap/commit/eb93029140420355e6cd2e9bbc43248a40af08e2))
- **docs:** use local bin path for vite-sitemap CLI ([83852a8](https://github.com/pyyupsk/vite-plugin-sitemap/commit/83852a8428686be73c90a319ad2e11a92124d439))
- **test:** use correct assertion for promise resolution check ([f88f1d1](https://github.com/pyyupsk/vite-plugin-sitemap/commit/f88f1d104fb1b4cbe708dd41b871e7118fdafe36))

# Changelog

All notable changes to this project will be documented in this file.

See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.2](https://github.com/pyyupsk/vite-plugin-sitemap/compare/v0.2.1...v0.2.2) (2025-12-03)

### Features

- add examples workspace with basic Vue example ([779aa7a](https://github.com/pyyupsk/vite-plugin-sitemap/commit/779aa7a4487e697b0a56b29115af3f098a0e6e22))
- **eslint-config:** add library config with eslint-plugin-jsdoc ([6fa4ad7](https://github.com/pyyupsk/vite-plugin-sitemap/commit/6fa4ad7d3baaaefaef80851b5985a88d654b1f49))
- **examples:** add feature-focused examples ([a6d66c0](https://github.com/pyyupsk/vite-plugin-sitemap/commit/a6d66c00ea93c998980f73cfda6b75381bab499b))
- **examples:** add react, extensions, multiple-sitemaps, and dynamic-routes examples ([c95421d](https://github.com/pyyupsk/vite-plugin-sitemap/commit/c95421d5828d413e403b9627ce21a09c7a52489f))

### Bug Fixes

- generate separate files for named sitemap exports ([ae601cf](https://github.com/pyyupsk/vite-plugin-sitemap/commit/ae601cfe0ee04e3850c91d4a7b6e01b841a0e784))

## [0.2.1](https://github.com/pyyupsk/vite-plugin-sitemap/compare/v0.2.0...v0.2.1) (2025-11-29)

### Bug Fixes

- add guard for indexXml before writing split sitemap index ([11634ab](https://github.com/pyyupsk/vite-plugin-sitemap/commit/11634abd63c61df8882c2a3cd54a07e42d647e8f))
- **docs:** correct llms.txt links with base path ([9190fd6](https://github.com/pyyupsk/vite-plugin-sitemap/commit/9190fd6e407f17aa08afbccbc7257a0dd78024a1))
- preserve priority precision in XML output ([cf437a8](https://github.com/pyyupsk/vite-plugin-sitemap/commit/cf437a81f49269087c38a770dbe6e14b2f23e56d))
- use anyWasSplit flag for robots.txt sitemap URL ([c06df58](https://github.com/pyyupsk/vite-plugin-sitemap/commit/c06df58eb8595833bb3931a31ca097c137ad9dd5))

### Performance Improvements

- cache base XML size in splitByUrlsAndSize ([f091a17](https://github.com/pyyupsk/vite-plugin-sitemap/commit/f091a1709ec30246bcc94107e1fd25c8a275ce1d))

## [0.2.0](https://github.com/pyyupsk/vite-plugin-sitemap/compare/v0.1.1...v0.2.0) (2025-11-29)

### Features

- add dev mode support for sitemap.xml and robots.txt ([80327c5](https://github.com/pyyupsk/vite-plugin-sitemap/commit/80327c5b3030d9ed164e5415f5b13076078f7b7c))

## [0.1.1](https://github.com/pyyupsk/vite-plugin-sitemap/compare/v0.1.0...v0.1.1) (2025-11-29)

### Bug Fixes

- add missing eslint dependencies to packages ([9f9606a](https://github.com/pyyupsk/vite-plugin-sitemap/commit/9f9606ad68106c86444b0a68ff3817c32184d2ee))
- **docs:** add base path for GitHub Pages deployment ([0ea382c](https://github.com/pyyupsk/vite-plugin-sitemap/commit/0ea382cee10ca72647d708e5b00cab47ecea81eb))
- resolve TypeScript type conflict when using bun link ([bd3c6d2](https://github.com/pyyupsk/vite-plugin-sitemap/commit/bd3c6d23e9c8c81ac8c3effab67a1e12108f8b8e))

## [0.1.0](https://github.com/pyyupsk/vite-plugin-sitemap/compare/0cb040f3b1f05c980329e539df2907b74db0d534...v0.1.0) (2025-11-28)

### Features

- **create-turbo:** apply official-starter transform ([0cb040f](https://github.com/pyyupsk/vite-plugin-sitemap/commit/0cb040f3b1f05c980329e539df2907b74db0d534))
- **create-turbo:** apply package-manager transform ([3b05fbe](https://github.com/pyyupsk/vite-plugin-sitemap/commit/3b05fbe98606114876a0b6c646625d6c05562f6d))
- **create-turbo:** restructure monorepo layout ([9ab5192](https://github.com/pyyupsk/vite-plugin-sitemap/commit/9ab5192d29dbc80c3e9265d9bb4ea73774ef90c2))
- **vite-plugin-sitemap:** add auto-splitting for large sitemaps ([f15995e](https://github.com/pyyupsk/vite-plugin-sitemap/commit/f15995e9358a0f4d12e7d9383429a24ba0851d6c))
- **vite-plugin-sitemap:** add CLI generate command ([2b5c8e4](https://github.com/pyyupsk/vite-plugin-sitemap/commit/2b5c8e42791ef1112b702e511f27f3010810207d))
- **vite-plugin-sitemap:** add CLI with validate and preview commands ([2a92a14](https://github.com/pyyupsk/vite-plugin-sitemap/commit/2a92a14a9a103c17cce152cf4be39cb06c43d5c4))
- **vite-plugin-sitemap:** add core plugin implementation ([fb918c4](https://github.com/pyyupsk/vite-plugin-sitemap/commit/fb918c4029fd6c3b75bfd85c08bb5926326b8154))
- **vite-plugin-sitemap:** add initial package structure ([769ba61](https://github.com/pyyupsk/vite-plugin-sitemap/commit/769ba61b1ff059e056db5a827f9c43972fb35042))
- **vite-plugin-sitemap:** add robots.txt generation support ([2af31c1](https://github.com/pyyupsk/vite-plugin-sitemap/commit/2af31c16f84c7e762ce869249cc3d46c95e55c83))
- **vite-plugin-sitemap:** add type definitions and XML builder utilities ([3d8b518](https://github.com/pyyupsk/vite-plugin-sitemap/commit/3d8b5185f73b34d6ae33f3c745d92e3af205f648))
- **vite-plugin-sitemap:** add validation module with Zod schemas ([3fa5649](https://github.com/pyyupsk/vite-plugin-sitemap/commit/3fa5649617b4a62ada0db498eafeefcedd27b43e))
- **vite-plugin-sitemap:** CLI reads plugin options from vite.config ([d53fd4a](https://github.com/pyyupsk/vite-plugin-sitemap/commit/d53fd4aa9f0806c88e123bf7162014d2bcd4b37d))

### Bug Fixes

- **vite-plugin-sitemap:** enable Vite integration tests and fix plugin issues ([184160f](https://github.com/pyyupsk/vite-plugin-sitemap/commit/184160f6a31832dbc4dc2c43c0d16f96b37c1bb6))
- **vite-plugin-sitemap:** resolve build caching and transform issues ([dee1448](https://github.com/pyyupsk/vite-plugin-sitemap/commit/dee14483787eb3e608430289ad3ff33f85a487d2))
- **vite-plugin-sitemap:** support milliseconds in W3C datetime validation ([dbba188](https://github.com/pyyupsk/vite-plugin-sitemap/commit/dbba1882d8d31fd2d58a319316765ea67ad8b68e))
