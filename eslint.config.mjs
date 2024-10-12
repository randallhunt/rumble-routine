import js from "@eslint/js"
import globals from "globals"

export default [
  js.configs.recommended,
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: {
    ...globals.browser,
    ...globals.webextensions,
    "importScripts": true,

  } }},
  {
    rules: {
      semi: ["error", "never"],
      eqeqeq: "off",
      "no-undef": "off",
      "no-unused-vars": ["warn", {
            "vars": "all",
            "args": "after-used",
            "caughtErrors": "all",
            "ignoreRestSiblings": false,
            "reportUsedIgnorePattern": false
        }]
    }
  }
]