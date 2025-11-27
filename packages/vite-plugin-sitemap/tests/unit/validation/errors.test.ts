/**
 * Error formatting tests.
 * Tests for errors.ts module functions.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createFailedResult,
  createSuccessResult,
  createValidationError,
  formatErrorsForConsole,
  formatResultForConsole,
  formatZodErrors,
  type ValidationError,
  type ValidationResult,
} from "../../../src/validation/errors";

describe("createValidationError", () => {
  it("should create error with all fields", () => {
    const error = createValidationError(
      "invalid_url",
      "URL is invalid",
      "routes[0].url",
      "bad-url",
      "Use https://",
    );

    expect(error.code).toBe("invalid_url");
    expect(error.message).toBe("URL is invalid");
    expect(error.path).toBe("routes[0].url");
    expect(error.value).toBe("bad-url");
    expect(error.suggestion).toBe("Use https://");
  });

  it("should create error without suggestion", () => {
    const error = createValidationError("invalid_type", "Type error", "routes[0]", 123);

    expect(error.code).toBe("invalid_type");
    expect(error.message).toBe("Type error");
    expect(error.path).toBe("routes[0]");
    expect(error.value).toBe(123);
    expect(error.suggestion).toBeUndefined();
  });
});

describe("createSuccessResult", () => {
  it("should create success result without warnings", () => {
    const result = createSuccessResult(10);

    expect(result.valid).toBe(true);
    expect(result.routeCount).toBe(10);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("should create success result with warnings", () => {
    const result = createSuccessResult(10, ["Warning 1", "Warning 2"]);

    expect(result.valid).toBe(true);
    expect(result.routeCount).toBe(10);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual(["Warning 1", "Warning 2"]);
  });
});

describe("createFailedResult", () => {
  it("should create failed result with errors", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_url",
        message: "URL is invalid",
        path: "routes[0].url",
        value: "bad-url",
      },
    ];

    const result = createFailedResult(5, errors);

    expect(result.valid).toBe(false);
    expect(result.routeCount).toBe(5);
    expect(result.errors).toEqual(errors);
    expect(result.warnings).toEqual([]);
  });

  it("should create failed result with warnings", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_url",
        message: "URL is invalid",
        path: "routes[0].url",
        value: "bad-url",
      },
    ];

    const result = createFailedResult(5, errors, ["Warning 1"]);

    expect(result.valid).toBe(false);
    expect(result.warnings).toEqual(["Warning 1"]);
  });
});

describe("formatErrorsForConsole", () => {
  it("should format single error", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_url",
        message: "URL is invalid",
        path: "routes[0].url",
        suggestion: "Use https://",
        value: "bad-url",
      },
    ];

    const output = formatErrorsForConsole(errors);

    expect(output).toContain("1. routes[0].url: URL is invalid");
    expect(output).toContain('Value: "bad-url"');
    expect(output).toContain("Suggestion: Use https://");
  });

  it("should format multiple errors", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_url",
        message: "URL is invalid",
        path: "routes[0].url",
        value: "bad-url",
      },
      {
        code: "invalid_date",
        message: "Date is invalid",
        path: "routes[1].lastmod",
        value: "bad-date",
      },
    ];

    const output = formatErrorsForConsole(errors);

    expect(output).toContain("1. routes[0].url: URL is invalid");
    expect(output).toContain("2. routes[1].lastmod: Date is invalid");
  });

  it("should handle error without suggestion", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_url",
        message: "URL is invalid",
        path: "routes[0].url",
        value: "bad-url",
      },
    ];

    const output = formatErrorsForConsole(errors);

    expect(output).toContain("URL is invalid");
    expect(output).not.toContain("Suggestion:");
  });

  it("should handle non-string values", () => {
    const errors: ValidationError[] = [
      {
        code: "invalid_type",
        message: "Expected number",
        path: "routes[0].priority",
        value: 123,
      },
    ];

    const output = formatErrorsForConsole(errors);

    expect(output).toContain("Value: 123");
  });
});

describe("formatResultForConsole", () => {
  it("should format success result", () => {
    const result: ValidationResult = {
      errors: [],
      routeCount: 10,
      valid: true,
      warnings: [],
    };

    const output = formatResultForConsole(result);

    expect(output).toContain("✓ Validation passed");
    expect(output).toContain("10 routes");
  });

  it("should format success result with warnings", () => {
    const result: ValidationResult = {
      errors: [],
      routeCount: 10,
      valid: true,
      warnings: ["Warning 1", "Warning 2"],
    };

    const output = formatResultForConsole(result);

    expect(output).toContain("✓ Validation passed");
    expect(output).toContain("Warnings:");
    expect(output).toContain("⚠ Warning 1");
    expect(output).toContain("⚠ Warning 2");
  });

  it("should format failed result", () => {
    const result: ValidationResult = {
      errors: [
        {
          code: "invalid_url",
          message: "URL is invalid",
          path: "routes[0].url",
          value: "bad-url",
        },
      ],
      routeCount: 5,
      valid: false,
      warnings: [],
    };

    const output = formatResultForConsole(result);

    expect(output).toContain("✗ Validation failed");
    expect(output).toContain("1 errors");
    expect(output).toContain("routes[0].url: URL is invalid");
  });

  it("should format failed result with warnings", () => {
    const result: ValidationResult = {
      errors: [
        {
          code: "invalid_url",
          message: "URL is invalid",
          path: "routes[0].url",
          value: "bad-url",
        },
      ],
      routeCount: 5,
      valid: false,
      warnings: ["Some warning"],
    };

    const output = formatResultForConsole(result);

    expect(output).toContain("✗ Validation failed");
    expect(output).toContain("Warnings:");
    expect(output).toContain("⚠ Some warning");
  });
});

describe("formatZodErrors", () => {
  it("should convert Zod errors to ValidationError format", () => {
    const schema = z.object({
      url: z.string().url(),
    });

    const result = schema.safeParse({ url: "invalid" });

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      expect(errors.length).toBe(1);
      expect(errors[0]!.path).toBe("url");
      expect(errors[0]!.code).toBeDefined();
    }
  });

  it("should handle nested paths with basePath", () => {
    const schema = z.object({
      url: z.string().url(),
    });

    const result = schema.safeParse({ url: "invalid" });

    if (!result.success) {
      const errors = formatZodErrors(result.error, "routes[0]");

      expect(errors.length).toBe(1);
      expect(errors[0]!.path).toBe("routes[0].url");
    }
  });

  it("should generate suggestions for common error types", () => {
    const schema = z.object({
      priority: z.number().min(0).max(1),
    });

    const result = schema.safeParse({ priority: 2 });

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      expect(errors.length).toBe(1);
      expect(errors[0]!.suggestion).toBeDefined();
    }
  });

  it("should handle invalid_type errors", () => {
    const schema = z.object({
      count: z.number(),
    });

    const result = schema.safeParse({ count: "not-a-number" });

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      expect(errors.length).toBe(1);
      expect(errors[0]!.code).toBe("invalid_type");
    }
  });

  it("should handle too_big errors", () => {
    const schema = z.object({
      title: z.string().max(10),
    });

    const result = schema.safeParse({ title: "this is a very long title" });

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      expect(errors.length).toBe(1);
      expect(errors[0]!.suggestion).toContain("at most");
    }
  });

  it("should handle too_small errors", () => {
    const schema = z.object({
      items: z.array(z.string()).min(2),
    });

    const result = schema.safeParse({ items: ["one"] });

    if (!result.success) {
      const errors = formatZodErrors(result.error);

      expect(errors.length).toBe(1);
      expect(errors[0]!.suggestion).toContain("at least");
    }
  });
});
