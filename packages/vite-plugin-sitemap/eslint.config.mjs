import { config } from "@repo/eslint-config/base";

export default [
  ...config,
  {
    files: ["src/types/config.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },
];
