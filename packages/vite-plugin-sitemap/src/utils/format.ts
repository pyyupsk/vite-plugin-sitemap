/**
 * Formatting utility functions.
 * @module
 */

/**
 * Format bytes as human-readable string.
 * Converts a byte count to a human-readable string with appropriate unit suffix.
 *
 * @param {number} bytes - Number of bytes to format
 * @returns {string} Formatted string with unit (e.g., "1.5 KB", "2.3 MB")
 *
 * @example
 * formatBytes(512); // "512 B"
 * formatBytes(1536); // "1.5 KB"
 * formatBytes(2457600); // "2.3 MB"
 *
 * @since 0.2.1
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
