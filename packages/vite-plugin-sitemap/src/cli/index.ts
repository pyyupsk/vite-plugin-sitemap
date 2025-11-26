#!/usr/bin/env node

/**
 * CLI entry point for vite-sitemap.
 * Provides commands for validating and previewing sitemaps.
 */

import { Command } from "commander";
import { registerValidateCommand } from "./commands/validate";
import { registerPreviewCommand } from "./commands/preview";
import pkg from "../../package.json";

/**
 * Create and configure the CLI program.
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name("vite-sitemap")
    .description("CLI for @pyyupsk/vite-plugin-sitemap")
    .version(pkg.version);

  // Global options
  program
    .option("-c, --config <path>", "Path to vite.config file")
    .option("--verbose", "Enable verbose output");

  // Register commands
  registerValidateCommand(program);
  registerPreviewCommand(program);

  return program;
}

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
  const program = createProgram();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\x1b[31m✗\x1b[0m ${message}`);
    process.exit(1);
  }
}

// Run CLI
main();
