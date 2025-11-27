# CLI

The `vite-sitemap` CLI provides commands for validating, previewing, and generating sitemaps without running a full Vite build.

## Installation

The CLI is included when you install the package:

```bash
npm install @pyyupsk/vite-plugin-sitemap
```

Run with `npx`:

```bash
npx vite-sitemap <command>
```

Or add scripts to your `package.json`:

```json
{
  "scripts": {
    "sitemap:validate": "vite-sitemap validate",
    "sitemap:preview": "vite-sitemap preview",
    "sitemap:generate": "vite-sitemap generate"
  }
}
```

## Commands

### validate

Validate your sitemap configuration without generating files.

```bash
vite-sitemap validate [options]
```

**Options:**

| Option                 | Description                | Default         |
| ---------------------- | -------------------------- | --------------- |
| `-r, --root <path>`    | Project root directory     | `process.cwd()` |
| `-s, --sitemap <path>` | Path to sitemap file       | Auto-discovered |
| `-h, --hostname <url>` | Hostname for relative URLs | From config     |
| `-v, --verbose`        | Show detailed output       | `false`         |

**Examples:**

```bash
# Basic validation
vite-sitemap validate

# With custom root
vite-sitemap validate --root ./my-project

# With custom sitemap file
vite-sitemap validate --sitemap config/sitemap.ts

# Verbose output
vite-sitemap validate --verbose
```

**Output:**

```bash
$ vite-sitemap validate

ℹ Validating sitemap configuration...

✓ Validation passed! 42 routes validated in 156ms
```

On error:

```bash
$ vite-sitemap validate

ℹ Validating sitemap configuration...

✗ Validation failed for default:

  Route "/blog/post-1":
    - lastmod: Invalid W3C Datetime format
      Received: "2025-13-45"
      Suggestion: Use format like "2025-01-15" or "2025-01-15T10:30:00Z"

  Route "/products/widget":
    - priority: Must be between 0.0 and 1.0
      Received: 1.5
```

### preview

Preview the generated XML without writing files.

```bash
vite-sitemap preview [options]
```

**Options:**

| Option                 | Description                   | Default         |
| ---------------------- | ----------------------------- | --------------- |
| `-r, --root <path>`    | Project root directory        | `process.cwd()` |
| `-s, --sitemap <path>` | Path to sitemap file          | Auto-discovered |
| `-h, --hostname <url>` | Hostname for URLs             | From config     |
| `-n, --name <name>`    | Preview specific named export | All             |
| `-l, --limit <number>` | Limit output lines            | `50`            |
| `-f, --full`           | Show full XML output          | `false`         |
| `-v, --verbose`        | Show detailed output          | `false`         |

**Examples:**

```bash
# Preview all sitemaps
vite-sitemap preview

# Preview specific export
vite-sitemap preview --name blog

# Full output (no truncation)
vite-sitemap preview --full

# Custom hostname
vite-sitemap preview --hostname https://staging.example.com
```

**Output:**

```bash
$ vite-sitemap preview

ℹ Loading sitemap configuration...

ℹ Preview: default (5 routes)

────────────────────────────────────────────────────────
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <priority>0.8</priority>
  </url>
  ...
────────────────────────────────────────────────────────

Size: 1.2 KB
Routes: 5

✓ Preview complete in 89ms
```

### generate

Generate sitemap files without running a full Vite build.

```bash
vite-sitemap generate [options]
```

**Options:**

| Option                 | Description            | Default         |
| ---------------------- | ---------------------- | --------------- |
| `-r, --root <path>`    | Project root directory | `process.cwd()` |
| `-s, --sitemap <path>` | Path to sitemap file   | Auto-discovered |
| `-o, --output <dir>`   | Output directory       | `dist`          |
| `-h, --hostname <url>` | Base hostname          | From config     |
| `--robots-txt`         | Generate robots.txt    | From config     |
| `-v, --verbose`        | Show detailed output   | `false`         |

**Examples:**

```bash
# Basic generation
vite-sitemap generate --hostname https://example.com

# Custom output directory
vite-sitemap generate -h https://example.com -o public

# With robots.txt
vite-sitemap generate -h https://example.com --robots-txt

# Verbose output
vite-sitemap generate -h https://example.com --verbose
```

**Output:**

```bash
$ vite-sitemap generate -h https://example.com --robots-txt --verbose

ℹ Generating sitemap...
  Working directory: /home/user/project
  Output directory: dist

ℹ sitemap.xml (42 URLs, 8.5 KB)

✓ Created robots.txt with Sitemap directive

──────────────────────────────────────────────────────
✓ built 1 sitemap(s) with 42 URLs in 234ms

Generated files:
  ➜  dist/sitemap.xml
  ➜  dist/robots.txt
```

## Global Options

These options work with all commands:

| Option                | Description              |
| --------------------- | ------------------------ |
| `-c, --config <path>` | Path to vite.config file |
| `--verbose`           | Enable verbose output    |
| `-V, --version`       | Display version number   |
| `--help`              | Display help for command |

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Sitemap

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vite-sitemap validate
```

### Pre-commit Hook

Using [husky](https://github.com/typicode/husky):

```bash
# .husky/pre-commit
npx vite-sitemap validate
```

### Build Script

```json
{
  "scripts": {
    "build": "vite build && vite-sitemap generate -h https://example.com",
    "prebuild": "vite-sitemap validate"
  }
}
```

## Config File Integration

The CLI automatically reads options from your `vite.config.ts`:

```typescript
// vite.config.ts
import sitemap from "@pyyupsk/vite-plugin-sitemap";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sitemap({
      hostname: "https://example.com",
      generateRobotsTxt: true,
    }),
  ],
});
```

CLI commands will use these options as defaults:

```bash
# Uses hostname from vite.config.ts
vite-sitemap validate

# Override with CLI option
vite-sitemap validate --hostname https://staging.example.com
```

## Exit Codes

| Code | Description                 |
| ---- | --------------------------- |
| `0`  | Success                     |
| `1`  | Validation error or failure |

Use exit codes in scripts:

```bash
vite-sitemap validate && echo "Valid!" || echo "Invalid!"
```

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Handle [Large Sitemaps](/guide/advanced/large-sitemaps)
- Set up [Dynamic Routes](/guide/advanced/dynamic-routes)
