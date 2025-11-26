/**
 * XML entity escaping utilities.
 * Handles the 5 predefined XML entities that must be escaped in content.
 */

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const XML_ENTITY_REGEX = /[&<>"']/g;

/**
 * Escape special XML characters in text content.
 * Handles: & < > " '
 */
export function escapeXml(text: string): string {
  return text.replace(XML_ENTITY_REGEX, (char) => XML_ENTITIES[char] ?? char);
}

/**
 * Escape special characters in XML attribute values.
 * Same as escapeXml but ensures proper attribute encoding.
 */
export function escapeXmlAttr(text: string): string {
  return escapeXml(text);
}

/**
 * Encode a URL for use in XML sitemap.
 * Ensures proper URL encoding while preserving already-encoded characters.
 */
export function encodeUrl(url: string): string {
  try {
    // Parse and reconstruct to normalize encoding
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    // If URL is invalid, escape XML entities at minimum
    return escapeXml(url);
  }
}
