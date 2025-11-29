/**
 * XML entity escaping utilities.
 * Handles the 5 predefined XML entities that must be escaped in content.
 * @module
 */

/**
 * Map of characters to their XML entity replacements.
 *
 * @constant {Record<string, string>}
 * @since 0.1.0
 * @private
 */
const XML_ENTITIES: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

/**
 * Regex pattern matching characters that need XML escaping.
 *
 * @constant {RegExp}
 * @since 0.1.0
 * @private
 */
const XML_ENTITY_REGEX = /[&<>"']/g;

/**
 * Encode a URL for use in XML sitemap.
 * Ensures proper URL encoding while preserving already-encoded characters.
 * Also XML-escapes characters like & that must be escaped in sitemap XML.
 *
 * Per sitemap spec: URLs must have &, <, >, ", and ' escaped.
 *
 * @param {string} url - URL to encode
 * @returns {string} XML-safe URL with entities escaped
 *
 * @example
 * encodeUrl('https://example.com/search?q=foo&bar=baz');
 * // Returns: 'https://example.com/search?q=foo&amp;bar=baz'
 *
 * @see {@link https://www.sitemaps.org/protocol.html}
 * @since 0.1.0
 */
export function encodeUrl(url: string): string {
  try {
    // Parse and reconstruct to normalize encoding
    const parsed = new URL(url);
    // XML-escape the URL (ampersands must be &amp; in XML)
    return escapeXml(parsed.href);
  } catch {
    // If URL is invalid, escape XML entities at minimum
    return escapeXml(url);
  }
}

/**
 * Escape special XML characters in text content.
 * Handles the 5 predefined XML entities: & < > " '
 *
 * @param {string} text - Text to escape
 * @returns {string} XML-safe text with entities escaped
 *
 * @example
 * escapeXml('AT&T'); // 'AT&amp;T'
 * escapeXml('<div>'); // '&lt;div&gt;'
 * escapeXml('Ben & Jerry\'s'); // 'Ben &amp; Jerry&apos;s'
 *
 * @see {@link https://www.w3.org/TR/xml/#syntax}
 * @since 0.1.0
 */
export function escapeXml(text: string): string {
  return text.replaceAll(XML_ENTITY_REGEX, (char) => XML_ENTITIES[char] ?? char);
}

/**
 * Escape special characters in XML attribute values.
 * Same as escapeXml but ensures proper attribute encoding.
 *
 * @param {string} text - Attribute value to escape
 * @returns {string} XML-safe attribute value
 *
 * @example
 * const attr = escapeXmlAttr('value with "quotes"');
 * const xml = `<element attr="${attr}" />`;
 *
 * @see {@link https://www.w3.org/TR/xml/#AVNormalize}
 * @since 0.1.0
 */
export function escapeXmlAttr(text: string): string {
  return escapeXml(text);
}
