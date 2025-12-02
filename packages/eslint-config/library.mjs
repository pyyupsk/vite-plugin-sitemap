import jsdoc from "eslint-plugin-jsdoc";

import { config as baseConfig } from "./base.mjs";

const config = [
  ...baseConfig,
  {
    ...jsdoc.configs["flat/recommended-typescript"],
    files: ["src/**/*.ts"],
  },
  {
    files: ["src/**/*.ts"],
    rules: {
      "jsdoc/require-description": "warn",
      "jsdoc/require-example": "off",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/tag-lines": ["warn", "any", { startLines: 1 }],
    },
  },
];

export { config };
