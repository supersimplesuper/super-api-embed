// eslint.config.js
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintCommentsPlugin from "eslint-plugin-eslint-comments";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    ignores: [
      "scripts/*",
      "jest.config.ts",
      "__mocks__/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
    ],
    plugins: {
      "@typescript-eslint": tseslint,
      "eslint-comments": eslintCommentsPlugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2021,
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json",
        },
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/no-extraneous-dependencies": "error",
      "import/no-mutable-exports": "error",
      "import/no-unused-modules": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      ...tseslint.configs["eslint-recommended"].rules,
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,
      ...tseslint.configs.strict.rules,
      ...eslintCommentsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],

    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2021,
      },
      globals: {
        ...jestPlugin.environments.globals.globals,
        ...globals.browser,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      ...jestPlugin.configs.style.rules,
    },
  },
];
