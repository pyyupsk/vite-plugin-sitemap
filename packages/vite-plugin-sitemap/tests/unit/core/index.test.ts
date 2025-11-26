import { describe, expect, it } from "vitest";

describe("vite-plugin-sitemap", () => {
  it("should be importable", async () => {
    const mod = await import("../../../src/index");
    expect(mod.default).toBeDefined();
  });
});
