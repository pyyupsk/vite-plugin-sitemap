/**
 * Validation error formatting with actionable suggestions.
 */

import type { core, ZodError } from "zod";

/**
 * Validation error with detailed context.
 */
export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Path to the invalid field (e.g., 'routes[0].url') */
  path: string;
  /** Suggested fix for the error */
  suggestion?: string;
  /** The invalid value that caused the error */
  value: unknown;
}

/**
 * Result of sitemap validation.
 */
export interface ValidationResult {
  /** Validation errors, if any */
  errors: ValidationError[];
  /** Number of routes validated */
  routeCount: number;
  /** Whether validation passed */
  valid: boolean;
  /** Warnings (non-fatal issues) */
  warnings: string[];
}

/**
 * Create a failed validation result.
 */
export function createFailedResult(
  routeCount: number,
  errors: ValidationError[],
  warnings: string[] = [],
): ValidationResult {
  return {
    errors,
    routeCount,
    valid: false,
    warnings,
  };
}

/**
 * Create a successful validation result.
 */
export function createSuccessResult(
  routeCount: number,
  warnings: string[] = [],
): ValidationResult {
  return {
    errors: [],
    routeCount,
    valid: true,
    warnings,
  };
}

/**
 * Create a validation error.
 */
export function createValidationError(
  code: string,
  message: string,
  path: string,
  value: unknown,
  suggestion?: string,
): ValidationError {
  const error: ValidationError = { code, message, path, value };

  if (suggestion !== undefined) {
    error.suggestion = suggestion;
  }

  return error;
}

/**
 * Format validation errors for console output.
 */
export function formatErrorsForConsole(errors: ValidationError[]): string {
  return errors
    .map((error, index) => {
      let output = `\n${index + 1}. ${error.path}: ${error.message}`;
      if (error.value !== undefined) {
        const valueStr =
          typeof error.value === "string"
            ? `"${error.value}"`
            : String(error.value as string);
        output += `\n   Value: ${valueStr}`;
      }
      if (error.suggestion) {
        output += `\n   Suggestion: ${error.suggestion}`;
      }
      return output;
    })
    .join("\n");
}

/**
 * Format validation result for console output.
 */
export function formatResultForConsole(result: ValidationResult): string {
  if (result.valid) {
    let output = `✓ Validation passed (${result.routeCount} routes)`;
    if (result.warnings.length > 0) {
      output += `\n\nWarnings:\n${result.warnings.map((w) => `  ⚠ ${w}`).join("\n")}`;
    }
    return output;
  }

  let output = `✗ Validation failed (${result.errors.length} errors)`;
  output += formatErrorsForConsole(result.errors);

  if (result.warnings.length > 0) {
    output += `\n\nWarnings:\n${result.warnings.map((w) => `  ⚠ ${w}`).join("\n")}`;
  }

  return output;
}

/**
 * Convert Zod errors to ValidationError format with suggestions.
 */
export function formatZodErrors(
  zodError: ZodError,
  basePath = "",
): ValidationError[] {
  return zodError.issues.map((issue) => formatZodIssue(issue, basePath));
}

/**
 * Format a single Zod issue.
 */
function formatZodIssue(
  issue: core.$ZodIssue,
  basePath: string,
): ValidationError {
  const path = [...(basePath ? [basePath] : []), ...issue.path].join(".");
  const suggestion = getSuggestion(issue);

  const error: ValidationError = {
    code: issue.code,
    message: issue.message,
    path: path || "root",
    value: issue.input,
  };

  if (suggestion !== undefined) {
    error.suggestion = suggestion;
  }

  return error;
}

/**
 * Generate helpful suggestions based on error type.
 */
function getSuggestion(issue: core.$ZodIssue): string | undefined {
  switch (issue.code) {
    case "custom":
      return issue.message;

    case "invalid_format":
      if (issue.format === "url") {
        return "Ensure URL starts with http:// or https:// and is properly formatted";
      }
      return `String validation failed: ${String(issue.format)}`;

    case "invalid_type":
      return `Expected ${issue.expected}`;

    case "invalid_value":
      return `Valid values are: ${issue.values.join(", ")}`;

    case "too_big":
      if (issue.origin === "string") {
        return `String must be at most ${issue.maximum} characters`;
      }
      if (issue.origin === "number" || issue.origin === "int") {
        return `Number must be at most ${issue.maximum}`;
      }
      if (issue.origin === "array") {
        return `Array must have at most ${issue.maximum} items`;
      }
      return `Value is too large (maximum: ${issue.maximum})`;

    case "too_small":
      if (issue.origin === "string") {
        return `String must be at least ${issue.minimum} characters`;
      }
      if (issue.origin === "number" || issue.origin === "int") {
        return `Number must be at least ${issue.minimum}`;
      }
      if (issue.origin === "array") {
        return `Array must have at least ${issue.minimum} items`;
      }
      return `Value is too small (minimum: ${issue.minimum})`;

    default:
      return undefined;
  }
}
