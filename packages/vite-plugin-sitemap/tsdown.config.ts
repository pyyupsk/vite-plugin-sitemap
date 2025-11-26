import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/cli/index.ts"],
  external: ["vite"],
  format: ["esm"],
  hooks: {
    "build:done": async () => {
      await Promise.all([
        copyFile("../../LICENSE", "LICENSE"),
        copyFile("../../README.md", "README.md"),
        copyFile("../../CHANGELOG.md", "CHANGELOG.md"),
      ]);
    },
  },
  minify: false,
  outDir: "dist",
  sourcemap: true,
  target: "node20",
  treeshake: true,
});
