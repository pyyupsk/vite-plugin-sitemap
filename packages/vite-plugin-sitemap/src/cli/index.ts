#!/usr/bin/env node

/**
 * CLI entry point for vite-sitemap.
 * Provides commands for validating, previewing, and generating sitemaps.
 *
 * @module
 */

import { Command } from "commander";

import pkg from "../../package.json";
import { registerGenerateCommand } from "./commands/generate";
import { registerPreviewCommand } from "./commands/preview";
import { registerValidateCommand } from "./commands/validate";
import { colors } from "./utils";

/**
 * Create and configure the CLI program.
 * Sets up the main Commander program with global options and all subcommands.
 *
 * @returns Configured Commander program instance
 *
 * @example
 * const program = createProgram();
 * await program.parseAsync(process.argv);
 *
 * @since 0.1.0
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
  registerGenerateCommand(program);

  return program;
}

/**
 * Main CLI entry point.
 * Initializes the CLI program and handles top-level errors.
 *
 * @returns Resolves when CLI execution completes
 * @throws {Error} Exits process with code 1 on error
 *
 * @example
 * // Called automatically when script is executed
 * main();
 *
 * @since 0.1.0
 */
async function main(): Promise<void> {
  const program = createProgram();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${colors.red("✗")} ${message}`);
    process.exit(1);
  }
}

// Run CLI
main();
