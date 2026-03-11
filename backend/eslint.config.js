import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      ".DS_Store",
      ".dockerignore",
      ".env",
      ".gitignore",
      "README.md",
      "Dockerfile",
      "dockerfile",
      "Dockerfile.*",
      "yarn.lock",
      "package-lock.json",
      ".github/**/*",
      ".env.example",
      ".babelrc",
      ".prettierrc.json",
      "postman/LabBuddy.postman_collection.json",
      "vercel.json",
      "coverage/**",
      "temp/**",
      "node_modules/**",
      "dist/**",
      "package.json",
      "**/*.sh",
      "**/*.yml",
      "**/*.yaml",
    ],
  },
  {
    files: ["**/*.js", "!eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.commonjs,
        process: "readonly",
        __dirname: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          caughtErrors: "none",
        },
      ],
      "no-console": "off",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {},
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: globals.jest,
      sourceType: "module",
    },
    rules: {},
  },
  prettierConfig,
];
