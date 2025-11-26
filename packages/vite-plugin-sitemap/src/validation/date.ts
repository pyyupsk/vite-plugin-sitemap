/**
 * W3C Datetime validation (ISO 8601 subset) for sitemap protocol.
 *
 * Valid formats:
 * - YYYY (year only)
 * - YYYY-MM (year and month)
 * - YYYY-MM-DD (full date)
 * - YYYY-MM-DDThh:mm:ssTZD (full datetime with timezone)
 *
 * TZD formats:
 * - Z (UTC)
 * - +hh:mm or -hh:mm (offset from UTC)
 */

/**
 * Regex pattern for W3C Datetime format.
 */
const DATE_REGEX = /^\d{4}(?:-\d{2})?(?:-\d{2})?$/;
const TIME_REGEX = /^T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?$/;

export const W3C_DATETIME_REGEX = new RegExp(
  `${DATE_REGEX.source}(?:${TIME_REGEX.source})?$`,
);

/**
 * Date validation result.
 */
export interface DateValidationResult {
  error?: string;
  examples?: string[];
  suggestion?: string;
  valid: boolean;
}

/**
 * Get current date in W3C Datetime format (YYYY-MM-DD).
 */
export function getCurrentW3CDate(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/**
 * Check if a date is in the future (warning, not error).
 */
export function isFutureDate(date: string): boolean {
  try {
    const dateObj = new Date(date);
    return dateObj > new Date();
  } catch {
    return false;
  }
}

/**
 * Validate a date string for W3C Datetime compliance.
 * @returns true if valid, false otherwise
 */
export function isValidW3CDatetime(date: string): boolean {
  if (!date || typeof date !== "string") {
    return false;
  }

  if (!W3C_DATETIME_REGEX.test(date)) {
    return false;
  }

  // Additional validation: check that the date values are valid
  try {
    const parts = date.split("T")[0];
    if (!parts) return false;

    const dateParts = parts.split("-");
    const year = Number.parseInt(dateParts[0] ?? "0", 10);
    const month = dateParts[1] ? Number.parseInt(dateParts[1], 10) : 1;
    const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;

    // Basic range validation
    if (year < 1 || year > 9999) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Check day is valid for the month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date and return detailed result.
 */
export function validateW3CDatetime(date: string): DateValidationResult {
  if (!date || typeof date !== "string") {
    return {
      error: "Date is required and must be a string",
      suggestion: "Provide a date in W3C Datetime format like '2024-01-15'",
      valid: false,
    };
  }

  if (!W3C_DATETIME_REGEX.test(date)) {
    return {
      error: "Date does not match W3C Datetime format",
      examples: [
        "2024",
        "2024-01",
        "2024-01-15",
        "2024-01-15T10:30:00Z",
        "2024-01-15T10:30:00+00:00",
      ],
      suggestion:
        "Use format: YYYY, YYYY-MM, YYYY-MM-DD, or YYYY-MM-DDThh:mm:ss±hh:mm",
      valid: false,
    };
  }

  // Validate date values
  try {
    const parts = date.split("T")[0];
    if (!parts) {
      return {
        error: "Invalid date format",
        suggestion: "Ensure the date part is valid",
        valid: false,
      };
    }

    const dateParts = parts.split("-");
    const year = Number.parseInt(dateParts[0] ?? "0", 10);
    const month = dateParts[1] ? Number.parseInt(dateParts[1], 10) : 1;
    const day = dateParts[2] ? Number.parseInt(dateParts[2], 10) : 1;

    if (year < 1 || year > 9999) {
      return {
        error: `Invalid year: ${year}`,
        suggestion: "Year must be between 1 and 9999",
        valid: false,
      };
    }

    if (month < 1 || month > 12) {
      return {
        error: `Invalid month: ${month}`,
        suggestion: "Month must be between 01 and 12",
        valid: false,
      };
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return {
        error: `Invalid day: ${day} for month ${month}`,
        suggestion: `Day must be between 01 and ${daysInMonth} for the given month`,
        valid: false,
      };
    }

    return { valid: true };
  } catch {
    return {
      error: "Failed to parse date",
      suggestion: "Ensure the date is in a valid W3C Datetime format",
      valid: false,
    };
  }
}
