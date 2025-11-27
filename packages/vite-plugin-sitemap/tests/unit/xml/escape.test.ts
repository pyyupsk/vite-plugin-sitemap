/**
 * XML escape tests.
 * Tests for escape.ts module functions.
 */

import { describe, expect, it } from "vitest";

import { encodeUrl, escapeXml, escapeXmlAttr } from "../../../src/xml/escape";

describe("escapeXml", () => {
  describe("XML entity escaping", () => {
    it("should escape ampersand", () => {
      expect(escapeXml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should escape less than", () => {
      expect(escapeXml("1 < 2")).toBe("1 &lt; 2");
    });

    it("should escape greater than", () => {
      expect(escapeXml("2 > 1")).toBe("2 &gt; 1");
    });

    it("should escape double quote", () => {
      expect(escapeXml('Say "hello"')).toBe("Say &quot;hello&quot;");
    });

    it("should escape single quote", () => {
      expect(escapeXml("It's fine")).toBe("It&apos;s fine");
    });

    it("should escape all entities in one string", () => {
      const input = `<tag attr="value" other='test'> & content</tag>`;
      const expected =
        "&lt;tag attr=&quot;value&quot; other=&apos;test&apos;&gt; &amp; content&lt;/tag&gt;";
      expect(escapeXml(input)).toBe(expected);
    });
  });

  describe("safe content", () => {
    it("should not modify plain text", () => {
      expect(escapeXml("Hello World")).toBe("Hello World");
    });

    it("should not modify numbers", () => {
      expect(escapeXml("12345")).toBe("12345");
    });

    it("should handle empty string", () => {
      expect(escapeXml("")).toBe("");
    });

    it("should preserve whitespace", () => {
      expect(escapeXml("  hello  world  ")).toBe("  hello  world  ");
    });

    it("should preserve newlines", () => {
      expect(escapeXml("line1\nline2")).toBe("line1\nline2");
    });

    it("should handle unicode characters", () => {
      expect(escapeXml("日本語テスト")).toBe("日本語テスト");
      expect(escapeXml("émojis 🎉")).toBe("émojis 🎉");
    });
  });

  describe("edge cases", () => {
    it("should handle multiple consecutive ampersands", () => {
      expect(escapeXml("&&&")).toBe("&amp;&amp;&amp;");
    });

    it("should handle string with only special chars", () => {
      expect(escapeXml("<>\"'&")).toBe("&lt;&gt;&quot;&apos;&amp;");
    });

    it("should handle already escaped content (double escaping)", () => {
      expect(escapeXml("&amp;")).toBe("&amp;amp;");
    });
  });
});

describe("escapeXmlAttr", () => {
  it("should escape attribute values same as content", () => {
    expect(escapeXmlAttr('href="test"')).toBe("href=&quot;test&quot;");
  });

  it("should handle typical attribute content", () => {
    expect(escapeXmlAttr("en-US")).toBe("en-US");
  });

  it("should escape ampersand in attributes", () => {
    expect(escapeXmlAttr("a=1&b=2")).toBe("a=1&amp;b=2");
  });
});

describe("encodeUrl", () => {
  describe("valid URLs", () => {
    it("should return normalized URL for valid https", () => {
      expect(encodeUrl("https://example.com/page")).toBe("https://example.com/page");
    });

    it("should return normalized URL for valid http", () => {
      expect(encodeUrl("http://example.com/page")).toBe("http://example.com/page");
    });

    it("should preserve URL with path", () => {
      expect(encodeUrl("https://example.com/path/to/page")).toBe(
        "https://example.com/path/to/page",
      );
    });

    it("should preserve URL with query string", () => {
      expect(encodeUrl("https://example.com/page?q=test&lang=en")).toBe(
        "https://example.com/page?q=test&lang=en",
      );
    });

    it("should normalize URL without trailing slash to have one on domain", () => {
      const result = encodeUrl("https://example.com");
      expect(result).toBe("https://example.com/");
    });

    it("should handle URL with port", () => {
      expect(encodeUrl("https://example.com:8080/page")).toBe("https://example.com:8080/page");
    });

    it("should handle URL with username/password", () => {
      const result = encodeUrl("https://user:pass@example.com/page");
      expect(result).toBe("https://user:pass@example.com/page");
    });
  });

  describe("URL encoding", () => {
    it("should encode spaces in path", () => {
      const result = encodeUrl("https://example.com/path with spaces");
      expect(result).toContain("path%20with%20spaces");
    });

    it("should preserve already encoded characters", () => {
      expect(encodeUrl("https://example.com/path%20encoded")).toBe(
        "https://example.com/path%20encoded",
      );
    });

    it("should handle unicode in path", () => {
      const result = encodeUrl("https://example.com/日本語");
      // URL API will percent-encode unicode
      expect(result).toContain("example.com");
    });
  });

  describe("invalid URLs", () => {
    it("should escape XML entities for invalid URL", () => {
      expect(encodeUrl("not a url with <special> chars")).toBe(
        "not a url with &lt;special&gt; chars",
      );
    });

    it("should escape ampersand in invalid URL", () => {
      expect(encodeUrl("invalid & broken")).toBe("invalid &amp; broken");
    });

    it("should handle empty string", () => {
      expect(encodeUrl("")).toBe("");
    });

    it("should handle relative path (invalid URL)", () => {
      expect(encodeUrl("/relative/path")).toBe("/relative/path");
    });
  });
});
