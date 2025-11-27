/**
 * CLI test helper for spawning and testing CLI commands.
 */

import { spawn } from "node:child_process";
import { join } from "node:path";

/**
 * Options for running CLI commands.
 */
export interface CliOptions {
  /** Working directory for the command */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Result of running a CLI command.
 */
export interface CliResult {
  /** Exit code from the process */
  exitCode: number;
  /** Combined stderr output */
  stderr: string;
  /** Combined stdout output */
  stdout: string;
  /** Whether the command succeeded (exit code 0) */
  success: boolean;
}

/**
 * Get the path to the CLI binary.
 * Uses the dist/cli/index.mjs from the built package.
 */
export function getCliBinaryPath(): string {
  return join(__dirname, "..", "..", "dist", "cli", "index.mjs");
}

/**
 * Run the vite-sitemap CLI with the given arguments.
 *
 * @param args CLI arguments
 * @param options Additional options
 * @returns Promise resolving to CLI result
 */
export async function runCli(args: string[], options: CliOptions = {}): Promise<CliResult> {
  const { cwd = process.cwd(), env = {}, timeout = 30000 } = options;

  const cliBinary = getCliBinaryPath();

  return new Promise((resolve, reject) => {
    const proc = spawn("node", [cliBinary, ...args], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    const timeoutId = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error(`CLI command timed out after ${timeout}ms`));
    }, timeout);

    proc.on("close", (code) => {
      clearTimeout(timeoutId);
      resolve({
        exitCode: code ?? 1,
        stderr,
        stdout,
        success: code === 0,
      });
    });

    proc.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Run the generate command.
 *
 * @param cwd Working directory with sitemap.ts
 * @param args Additional arguments
 * @returns CLI result
 */
export async function runGenerate(cwd: string, args: string[] = []): Promise<CliResult> {
  return runCli(["generate", ...args], { cwd });
}

/**
 * Run the preview command.
 *
 * @param cwd Working directory with sitemap.ts
 * @param args Additional arguments
 * @returns CLI result
 */
export async function runPreview(cwd: string, args: string[] = []): Promise<CliResult> {
  return runCli(["preview", ...args], { cwd });
}

/**
 * Run the validate command.
 *
 * @param cwd Working directory with sitemap.ts
 * @param args Additional arguments
 * @returns CLI result
 */
export async function runValidate(cwd: string, args: string[] = []): Promise<CliResult> {
  return runCli(["validate", ...args], { cwd });
}
