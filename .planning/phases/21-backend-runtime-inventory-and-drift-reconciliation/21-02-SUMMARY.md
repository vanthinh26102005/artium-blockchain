---
phase: 21
plan: 02
subsystem: planning-docs
tags: [deployment-strategy, dependency-map, env-inventory, integrations]
requires:
  - phase: 21-01
    provides: workload inventory and classification baseline
provides:
  - internal dependency matrix across gateway, services, databases, broker, cache, and mounted files
  - external integration matrix covering database, cache, broker, mail, storage, payments, blockchain, and auth providers
affects: [DISC-02, phase-21-wave-1]
tech-stack:
  added: []
  patterns:
    - dependency inventory tied to env-source ownership
    - external integration inventory that records variable names without leaking secret values
key-files:
  created:
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-02-dependency-environment-inventory.md
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-02-external-integration-matrix.md
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-02-SUMMARY.md
key-decisions:
  - "Record dormant CRM wiring explicitly instead of silently dropping it from the dependency map."
  - "Treat GCS, Stripe, blockchain RPC, and Google OAuth as provider dependencies while keeping dev-local RabbitMQ, Redis, Mailhog, and PostgreSQL distinct."
patterns-established:
  - "Phase 21 dependency docs distinguish code-confirmed consumers from env-surfaced but not fully proven dependencies."
  - "Secret-bearing integrations are documented by variable names and mounted paths only."
requirements-completed: [DISC-02]
completed: 2026-04-27
---

# Phase 21 Plan 02: Dependency, environment, and external-integration inventory Summary

**Mapped the backend dependency graph from the gateway inward, then turned every external system and credential surface into a concrete inventory artifact for later architecture analysis.**

## Accomplishments

- Created `21-02-dependency-environment-inventory.md` with active gateway TCP edges, the `orders-service -> artwork-service` RPC dependency, database strategy wiring, broker/cache use, and mounted-file assumptions.
- Documented the `DB_STRATEGY` split and called out that the isolated compose overlay is only partially switched away from shared-mode defaults.
- Created `21-02-external-integration-matrix.md` covering PostgreSQL, Redis, RabbitMQ, Mailhog, SMTP, GCS, Stripe, blockchain RPC, and Google OAuth without copying any secrets.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 21 now has the full runtime input set needed for the drift audit: workload truth from Plan 21-01 plus dependency and provider truth from Plan 21-02.
- The remaining work is synthesis, not discovery: identify the highest-confidence mismatches and hand Phase 22 a constrained baseline.

## Verification

- `rg "## Internal dependency matrix|Source workload|Target workload|Transport / mechanism|Env source|Evidence files|api-gateway.+identity-service|api-gateway.+orders-service|api-gateway.+messaging-service|orders-service.+artwork-service|DB_STRATEGY|SHARED_DB_HOST|RABBITMQ_URI|REDIS_HOST|gcs-service-account.json|depends_on|CRM_SERVICE" .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-02-dependency-environment-inventory.md`
- `rg "PostgreSQL|Redis|RabbitMQ|Mailhog|GCS|Stripe|SMTP|BLOCKCHAIN_RPC_URL|STRIPE_WEBHOOK_SECRET|GCS_KEY_FILE" .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-02-external-integration-matrix.md`
- Confirmed the dependency inventory does not contain `StatefulSet`, and the external integration matrix does not contain `Use managed`.

## Self-Check: PASSED

---
*Phase: 21-backend-runtime-inventory-and-drift-reconciliation*
*Completed: 2026-04-27*
