/**
 * Validation error formatting with actionable suggestions.
 * Provides utilities for creating, formatting, and displaying validation errors.
 *
 * @module
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
 * Factory function for creating a validation result indicating failure.
 *
 * @param routeCount - Number of routes that were validated
 * @param errors - Array of validation errors found
 * @param [warnings] - Optional array of warning messages
 * @returns Failed validation result object
 *
 * @example
 * const errors = [{ code: 'invalid_url', message: 'Invalid URL format', path: 'routes[0].url', value: 'bad-url' }];
 * const result = createFailedResult(10, errors);
 * console.log(result.valid); // false
 *
 * @since 0.1.0
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
 * Factory function for creating a validation result indicating success.
 *
 * @param routeCount - Number of routes that were validated
 * @param [warnings] - Optional array of warning messages
 * @returns Successful validation result object
 *
 * @example
 * const result = createSuccessResult(50, ['2 duplicate URLs removed']);
 * console.log(result.valid); // true
 * console.log(result.warnings); // ['2 duplicate URLs removed']
 *
 * @since 0.1.0
 */
export function createSuccessResult(routeCount: number, warnings: string[] = []): ValidationResult {
  return {
    errors: [],
    routeCount,
    valid: true,
    warnings,
  };
}

/**
 * Create a validation error.
 * Factory function for creating a structured validation error object.
 *
 * @param code - Error code for programmatic handling (e.g., 'invalid_url')
 * @param message - Human-readable error message
 * @param path - Path to the invalid field (e.g., 'routes[0].url')
 * @param value - The invalid value that caused the error
 * @param [suggestion] - Optional suggestion for fixing the error
 * @returns Structured validation error object
 *
 * @example
 * const error = createValidationError(
 *   'invalid_url',
 *   'URL must be absolute',
 *   'routes[0].url',
 *   '/relative/path',
 *   'Use https://example.com/relative/path instead'
 * );
 *
 * @since 0.1.0
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
 * Creates a numbered, human-readable list of errors with values and suggestions.
 *
 * @param errors - Array of validation errors to format
 * @returns Formatted string suitable for console output
 *
 * @example
 * const errors = [{ code: 'invalid_url', message: 'Invalid URL', path: 'routes[0].url', value: 'bad', suggestion: 'Use absolute URL' }];
 * console.log(formatErrorsForConsole(errors));
 * // 1. routes[0].url: Invalid URL
 * //    Value: "bad"
 * //    Suggestion: Use absolute URL
 *
 * @since 0.1.0
 */
export function formatErrorsForConsole(errors: ValidationError[]): string {
  return errors
    .map((error, index) => {
      let output = `\n${index + 1}. ${error.path}: ${error.message}`;
      if (error.value !== undefined) {
        const valueStr =
          typeof error.value === "string" ? `"${error.value}"` : String(error.value as string);
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
 * Creates a summary with pass/fail status, error details, and warnings.
 *
 * @param result - Validation result to format
 * @returns Formatted string suitable for console output
 *
 * @example
 * const result = { valid: true, routeCount: 50, errors: [], warnings: [] };
 * console.log(formatResultForConsole(result));
 * // ✓ Validation passed (50 routes)
 *
 * @since 0.1.0
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
 * Transforms Zod validation issues into structured ValidationError objects.
 *
 * @param zodError - Zod error object from failed validation
 * @param [basePath] - Base path prefix for error locations
 * @returns Array of formatted validation errors
 *
 * @example
 * try {
 *   routeSchema.parse(data);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     const errors = formatZodErrors(error, 'routes[0]');
 *     console.log(errors);
 *   }
 * }
 *
 * @since 0.1.0
 */
export function formatZodErrors(zodError: ZodError, basePath = ""): ValidationError[] {
  return zodError.issues.map((issue) => formatZodIssue(issue, basePath));
}

/**
 * Format a single Zod issue.
 * Converts a Zod validation issue to a ValidationError with helpful suggestions.
 *
 * @param issue - Zod validation issue
 * @param basePath - Base path prefix for error location
 * @returns Formatted validation error
 *
 * @since 0.1.0
 */
function formatZodIssue(issue: core.$ZodIssue, basePath: string): ValidationError {
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
 * Provides context-specific suggestions for common validation errors.
 *
 * @param issue - Zod validation issue
 * @returns Helpful suggestion or undefined if none available
 *
 * @since 0.1.0
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
