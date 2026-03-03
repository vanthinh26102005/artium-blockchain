# Lint & Format Automation

Based on the Inventory domain code analysis, here is the implied configuration.

## 1. Formatting (Prettier)
-   **Semi:** `false` (No semicolons at end of lines).
-   **Single Quote:** `true`.
-   **Trailing Comma:** `all` (multi-line objects/arrays have trailing commas).
-   **Print Width:** Likely `100` or `120` based on the wrapping.
-   **Tab Width:** `2`.

## 2. Linting (ESLint)
-   **Unused Variables:** Warn/Error.
-   **React Hooks:** Strict dependency checking (`react-hooks/exhaustive-deps`).
-   **Imports:** No strict sorting enforcement seen in file (React imports were first, but others mixed), but logical grouping is encouraged.

## 3. Recommended Config (.prettierrc)
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```
