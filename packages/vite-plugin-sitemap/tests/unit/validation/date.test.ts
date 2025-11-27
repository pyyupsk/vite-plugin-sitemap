/**
 * Date validation tests.
 * Tests for date.ts module functions.
 */

import { describe, expect, it } from "vitest";

import {
  getCurrentW3CDate,
  isFutureDate,
  isValidW3CDatetime,
  validateW3CDatetime,
  W3C_DATETIME_REGEX,
} from "../../../src/validation/date";

describe("isValidW3CDatetime", () => {
  describe("valid date formats", () => {
    it("should accept year only format (YYYY)", () => {
      expect(isValidW3CDatetime("2024")).toBe(true);
    });

    it("should accept year-month format (YYYY-MM)", () => {
      expect(isValidW3CDatetime("2024-01")).toBe(true);
      expect(isValidW3CDatetime("2024-12")).toBe(true);
    });

    it("should accept full date format (YYYY-MM-DD)", () => {
      expect(isValidW3CDatetime("2024-01-15")).toBe(true);
      expect(isValidW3CDatetime("2024-12-31")).toBe(true);
    });

    it("should accept datetime with UTC timezone (Z)", () => {
      expect(isValidW3CDatetime("2024-01-15T10:30:00Z")).toBe(true);
    });

    it("should accept datetime with positive timezone offset", () => {
      expect(isValidW3CDatetime("2024-01-15T10:30:00+05:30")).toBe(true);
    });

    it("should accept datetime with negative timezone offset", () => {
      expect(isValidW3CDatetime("2024-01-15T10:30:00-08:00")).toBe(true);
    });

    it("should accept datetime without seconds", () => {
      expect(isValidW3CDatetime("2024-01-15T10:30Z")).toBe(true);
      expect(isValidW3CDatetime("2024-01-15T10:30+00:00")).toBe(true);
    });

    it("should accept leap year date", () => {
      expect(isValidW3CDatetime("2024-02-29")).toBe(true);
    });
  });

  describe("invalid date formats", () => {
    it("should reject empty string", () => {
      expect(isValidW3CDatetime("")).toBe(false);
    });

    it("should reject null/undefined", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(null)).toBe(false);
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(undefined)).toBe(false);
    });

    it("should reject non-string input", () => {
      // @ts-expect-error - testing invalid input
      expect(isValidW3CDatetime(20240115)).toBe(false);
    });

    it("should reject invalid format with slashes", () => {
      expect(isValidW3CDatetime("2024/01/15")).toBe(false);
    });

    it("should reject invalid month (13)", () => {
      expect(isValidW3CDatetime("2024-13-15")).toBe(false);
    });

    it("should reject invalid day (32)", () => {
      expect(isValidW3CDatetime("2024-01-32")).toBe(false);
    });

    it("should reject February 30th", () => {
      expect(isValidW3CDatetime("2024-02-30")).toBe(false);
    });

    it("should reject non-leap year Feb 29", () => {
      expect(isValidW3CDatetime("2023-02-29")).toBe(false);
    });

    it("should reject plain text", () => {
      expect(isValidW3CDatetime("invalid")).toBe(false);
      expect(isValidW3CDatetime("tomorrow")).toBe(false);
    });

    it("should reject month 00", () => {
      expect(isValidW3CDatetime("2024-00-15")).toBe(false);
    });

    it("should reject day 00", () => {
      expect(isValidW3CDatetime("2024-01-00")).toBe(false);
    });
  });
});

describe("validateW3CDatetime", () => {
  describe("valid dates", () => {
    it("should return valid result for correct date", () => {
      const result = validateW3CDatetime("2024-01-15");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("invalid dates with suggestions", () => {
    it("should return error for empty date with suggestion", () => {
      const result = validateW3CDatetime("");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Date is required and must be a string");
      expect(result.suggestion).toContain("W3C Datetime format");
    });

    it("should return error for invalid format with examples", () => {
      const result = validateW3CDatetime("2024/01/15");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("W3C Datetime format");
      expect(result.examples).toBeDefined();
      expect(result.examples).toContain("2024");
      expect(result.examples).toContain("2024-01-15");
    });

    it("should return error for invalid month with suggestion", () => {
      const result = validateW3CDatetime("2024-13-15");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid month");
      expect(result.suggestion).toContain("between 01 and 12");
    });

    it("should return error for invalid day with suggestion", () => {
      const result = validateW3CDatetime("2024-02-30");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid day");
      expect(result.suggestion).toContain("between 01 and");
    });
  });
});

describe("getCurrentW3CDate", () => {
  it("should return date in YYYY-MM-DD format", () => {
    const date = getCurrentW3CDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should return a valid W3C date", () => {
    const date = getCurrentW3CDate();
    expect(isValidW3CDatetime(date)).toBe(true);
  });

  it("should return current date", () => {
    const date = getCurrentW3CDate();
    const today = new Date().toISOString().split("T")[0];
    expect(date).toBe(today);
  });
});

describe("isFutureDate", () => {
  it("should return true for future date", () => {
    // Create a date 1 year in the future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    expect(isFutureDate(futureDateStr!)).toBe(true);
  });

  it("should return false for past date", () => {
    expect(isFutureDate("2020-01-01")).toBe(false);
  });

  it("should return false for today's date", () => {
    const today = new Date().toISOString().split("T")[0];
    // Note: This might be flaky at midnight
    expect(isFutureDate(today!)).toBe(false);
  });

  it("should return false for invalid date", () => {
    expect(isFutureDate("invalid")).toBe(false);
  });
});

describe("W3C_DATETIME_REGEX", () => {
  it("should be a RegExp", () => {
    expect(W3C_DATETIME_REGEX).toBeInstanceOf(RegExp);
  });

  it("should match valid date strings", () => {
    expect(W3C_DATETIME_REGEX.test("2024")).toBe(true);
    expect(W3C_DATETIME_REGEX.test("2024-01")).toBe(true);
    expect(W3C_DATETIME_REGEX.test("2024-01-15")).toBe(true);
    expect(W3C_DATETIME_REGEX.test("2024-01-15T10:30:00Z")).toBe(true);
  });
});
