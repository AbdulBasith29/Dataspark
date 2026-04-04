import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: [
      "dist",
      ".claude/**",
      // Large prototype files (not part of the Vite landing app)
      "src/app/dataspark-*.jsx",
      "src/app/landing-iterations/**",
    ],
  },
  {
    files: ["vite.config.js", "vite-dev-ai-api.mjs", "api/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: "module",
    },
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // React 17+ JSX transform (Vite) — no need to import React for JSX.
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // This repo is JS (no PropTypes).
      "react/prop-types": "off",

      // Marketing copy contains lots of intentional quotes/apostrophes in JSX text.
      "react/no-unescaped-entities": "off",
    },
  },
];
