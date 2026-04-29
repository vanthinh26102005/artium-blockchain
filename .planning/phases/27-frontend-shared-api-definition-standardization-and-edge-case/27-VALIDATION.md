---
phase: 27
slug: frontend-shared-api-definition-standardization-and-edge-case
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-29
---

# Phase 27 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Existing Next.js/TypeScript validation via ESLint and production build |
| **Config file** | `FE/artium-web/eslint.config.mjs`, `FE/artium-web/tsconfig.json`, `FE/artium-web/next.config.ts` |
| **Quick run command** | `cd FE/artium-web && npm run lint` |
| **Full suite command** | `cd FE/artium-web && npm run build` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd FE/artium-web && npm run lint` when the touched files are TypeScript files.
- **After every plan wave:** Run `cd FE/artium-web && npm run build`.
- **Before `$gsd-verify-work`:** Full suite must be green, or unrelated pre-existing failures must be named in the summary.
- **Max feedback latency:** 120 seconds for lint, 300 seconds for build.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 1 | D-02/D-04/D-05 | T-27-01 | Shared query/path helpers encode user-controlled URL parts | static + lint | `rg -n "buildQueryString|withQuery|encodePathSegment" FE/artium-web/src/@shared/services/apiClient.ts && cd FE/artium-web && npm run lint` | yes | pending |
| 27-01-02 | 01 | 1 | D-06 | T-27-02/T-27-03 | API errors retain status/data/headers and empty responses do not parse as JSON | static + build | `rg -n "response.status === 204|error.data|error.headers" FE/artium-web/src/@shared/services/apiClient.ts && cd FE/artium-web && npm run build` | yes | pending |
| 27-01-03 | 01 | 1 | D-01/D-10 | — | API definition standard documents helpers and edge cases | static | `rg -n "## Query Rules|## Path Parameter Rules|## Upload Rules|ApiError" FE/artium-web/src/@shared/apis/README.md` | no | pending |
| 27-02-01 | 02 | 2 | D-04 | T-27-05 | JSON modules use shared query helper and preserve false/zero behavior | static + lint | `! rg -n "const buildQuery|const buildQueryString|new URLSearchParams" FE/artium-web/src/@shared/apis && cd FE/artium-web && npm run lint` | yes | pending |
| 27-02-02 | 02 | 2 | D-05 | T-27-04 | Dynamic path params use encoded path segments | static + build | `rg -n "encodePathSegment" FE/artium-web/src/@shared/apis && cd FE/artium-web && npm run build` | yes | pending |
| 27-02-03 | 02 | 2 | D-03 | T-27-06 | Artwork base URL compatibility is centralized | static + build | `rg -n "getArtworkApiBaseUrl" FE/artium-web/src/@shared/services/apiClient.ts FE/artium-web/src/@shared/apis/artworkApis.ts FE/artium-web/src/@shared/apis/artworkFolderApis.ts && cd FE/artium-web && npm run build` | yes | pending |
| 27-03-01 | 03 | 3 | D-08 | T-27-07/T-27-08 | Upload helper centralizes auth/progress/abort/timeout behavior | static + lint | `rg -n "apiUpload|ApiUploadOptions|ApiUploadProgress" FE/artium-web/src/@shared/services/apiClient.ts && cd FE/artium-web && npm run lint` | yes | pending |
| 27-03-02 | 03 | 3 | D-08 | T-27-07/T-27-08 | Upload API modules do not bypass shared transport | static + build | `! rg -n "new XMLHttpRequest|fetch\\(|useAuthStore" FE/artium-web/src/@shared/apis/artworkUploadApi.ts FE/artium-web/src/@shared/apis/messagingApis.ts && cd FE/artium-web && npm run build` | yes | pending |
| 27-03-03 | 03 | 3 | D-09 | T-27-09 | Invoice mock behavior is isolated from production endpoint definitions | static | `rg -n "invoiceMocks|mockCreateQuickSellInvoice" FE/artium-web/src/@shared/apis/invoiceApis.ts FE/artium-web/src/@shared/apis/invoiceMocks.ts` | no | pending |
| 27-04-01 | 04 | 4 | D-01/D-10 | T-27-10/T-27-11 | Final API layer passes existing frontend verification and docs cover edge cases | lint + build | `cd FE/artium-web && npm run lint && npm run build` | yes | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test runner is required before execution.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Deployed artwork API base variants | D-03 | Requires environment-specific runtime URLs | Review the implementation for `NEXT_PUBLIC_ARTWORK_API_URL` ending in gateway root, `/artwork`, and `/artworks`; then smoke-test the deployed environment after build if credentials/endpoints are available. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 300s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
