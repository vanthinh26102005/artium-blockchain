---
phase: 26
slug: kubernetes-deployment-implementation-and-production-platform
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-27
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Helm CLI, Kubernetes API server dry-run, kubeconform when available |
| **Config file** | `BE/infrastructure/helm/artium-backend/Chart.yaml` |
| **Quick run command** | `helm lint BE/infrastructure/helm/artium-backend` |
| **Full suite command** | `BE/infrastructure/helm/artium-backend/scripts/validate-k8s.sh` |
| **Estimated runtime** | ~60-300 seconds depending on dependency build and cluster access |

---

## Sampling Rate

- **After every task commit:** Run `helm lint BE/infrastructure/helm/artium-backend` once the chart exists.
- **After every plan wave:** Run `BE/infrastructure/helm/artium-backend/scripts/validate-k8s.sh`.
- **Before `$gsd-verify-work`:** Full suite plus real-cluster smoke checks must be green when cluster credentials are available.
- **Max feedback latency:** 300 seconds for static validation; real-cluster deployment may exceed that and should be reported separately.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | K8S-01 | T-26-01 | In-cluster dependencies declared intentionally with non-secret placeholders | static | `git --no-pager grep -n "postgresql\\|redis\\|rabbitmq" BE/infrastructure/helm/artium-backend/Chart.yaml` | pending | pending |
| 26-02-01 | 02 | 1 | OPS-04 | T-26-04 | Worker schedulers can be disabled in API pods and enabled in worker pods | static | `git --no-pager grep -n "OUTBOX_PROCESSOR_ENABLED\\|BLOCKCHAIN_LISTENER_ENABLED\\|ETHEREUM_CONFIRMATION_RETRY_ENABLED\\|NOTIFICATION_PROCESSOR_ENABLED" BE/libs/outbox/src/outbox.processor.ts BE/libs/blockchain/src/services/blockchain-event-listener.service.ts BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts BE/apps/notifications-service/src/domain/processor/notification.processor.ts` | pending | pending |
| 26-03-01 | 03 | 2 | K8S-02 | T-26-02 | Only gateway has public Ingress; services are ClusterIP | static | `git --no-pager grep -n "kind: Ingress\\|type: ClusterIP\\|api-gateway" BE/infrastructure/helm/artium-backend/templates/*.yaml` | pending | pending |
| 26-03-02 | 03 | 2 | K8S-04 | T-26-03 | Sealed Secrets are used instead of plaintext production secrets | static | `git --no-pager grep -n "kind: SealedSecret\\|bitnami.com/v1alpha1" BE/infrastructure/helm/artium-backend/templates/sealedsecret.yaml BE/infrastructure/helm/artium-backend/examples/sealed-secrets.example.yaml` | pending | pending |
| 26-04-01 | 04 | 3 | OPS-01 | T-26-05 | Validation path covers render, schema, real-cluster deploy, smoke, and rollback | script | `BE/infrastructure/helm/artium-backend/scripts/validate-k8s.sh` | pending | pending |

*Status: pending until execution writes the target files.*

---

## Wave 0 Requirements

Existing project tooling is sufficient for planning. Execution must create chart validation scripts in Plan 04.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real managed-cluster deployment | DELV-02, OPS-01 | Requires kubeconfig, registry images, DNS/TLS, and cluster credentials not available in every local run | Run `helm upgrade --install --atomic artium-backend BE/infrastructure/helm/artium-backend -f BE/infrastructure/helm/artium-backend/values-production.yaml -n artium-prod --create-namespace`, then run `scripts/smoke-check.sh` with `ARTIUM_GATEWAY_URL` set. |
| Sealed Secrets controller key backup | OPS-03, OPS-05 | Requires live controller namespace and cluster permissions | Follow `docs/sealed-secrets.md` and verify a sealed-secrets key backup exists in the approved secure backup location. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or explicit manual real-cluster checks.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-04-27
