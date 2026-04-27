# Phase 26 Pattern Map

## Scope

This map identifies the closest existing codebase analogs for the Kubernetes production foundation. The existing `BE/infrastructure/k8s/` files are treated as legacy/dev evidence, not production templates.

## Files To Create Or Modify

| Target | Role | Closest analog | Pattern to keep | Pattern to avoid |
|---|---|---|---|---|
| `BE/infrastructure/helm/artium-backend/Chart.yaml` | Helm release root and dependency declaration | `BE/skaffold.yaml` for current deployment inventory | Keep one backend platform packaging entrypoint | Do not use Skaffold `dev` sync or static `v1` tags |
| `BE/infrastructure/helm/artium-backend/values.yaml` | Default chart values | `BE/docker-compose.yml` service/env inventory | Preserve service names and env keys | Do not copy Compose `depends_on`, published internal ports, or missing `.env.compose` assumptions |
| `BE/infrastructure/helm/artium-backend/values-production.yaml` | Real-cluster production defaults | `.planning/phases/26-.../26-CONTEXT.md` decisions | Provider-portable managed-cluster values | Do not hardcode GKE/EKS/AKS-only settings |
| `BE/infrastructure/helm/artium-backend/templates/deployment.yaml` | API workload template | `BE/infrastructure/k8s/services/*/deployment.yaml` | Use service-specific command/image/env concepts | Do not copy `yarn run dev:*`, `emptyDir /app`, `node_modules` mounts, or stale labels |
| `BE/infrastructure/helm/artium-backend/templates/worker-deployment.yaml` | Dedicated background worker template | `BE/libs/outbox/src/outbox.processor.ts`, `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`, payment and notification processors | Keep worker replicas explicit and default to 1 | Do not scale side-effecting processors with API replicas |
| `BE/infrastructure/helm/artium-backend/templates/service.yaml` | Internal service exposure | Legacy `service.yaml` files | Use `ClusterIP` for internal services | Do not copy `NodePort` public exposure |
| `BE/infrastructure/helm/artium-backend/templates/ingress.yaml` | Gateway-only public ingress | `BE/apps/api-gateway/src/main.ts`, Phase 22 communication matrix | Route public HTTP/websocket paths only to `api-gateway` | Do not expose identity/artwork/payments/messaging services directly |
| `BE/infrastructure/helm/artium-backend/templates/sealedsecret.yaml` | Encrypted secret resource support | Phase 26 context and Sealed Secrets docs | Commit only encrypted or placeholder-safe examples | Do not commit plain real `Secret` data |
| `BE/libs/outbox/src/outbox.processor.ts` | Outbox scheduler runtime gate | Existing `@Cron` method | Keep local behavior enabled by default | Do not require app-code refactor before chart can separate workers |
| `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts` | Blockchain listener runtime gate | Existing env-driven listener options | Add one explicit `BLOCKCHAIN_LISTENER_ENABLED` gate | Do not start listener in every orders-service API replica |
| `BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts` | Payment retry worker gate | Existing retry cron | Add one explicit `ETHEREUM_CONFIRMATION_RETRY_ENABLED` gate | Do not duplicate confirmation enqueueing across API replicas |
| `BE/apps/notifications-service/src/domain/processor/notification.processor.ts` | Notification retry worker gate | Existing notification cron | Add one explicit `NOTIFICATION_PROCESSOR_ENABLED` gate | Do not duplicate stuck-notification requeue work |
| `BE/infrastructure/helm/artium-backend/scripts/*.sh` | Validation and operations helpers | Existing package scripts and Compose commands | Keep commands explicit and non-watch mode | Do not rely on local developer `.env.compose` files |

## Service Contract Baseline

The production chart should start with these explicit values, then allow later Phase 23-25 artifacts to override if they provide a newer approved contract:

| Workload | HTTP port | TCP port | Exposure |
|---|---:|---:|---|
| `api-gateway` | `8081` | none | public only through Ingress |
| `identity-service` | `3001` | `3101` | internal ClusterIP |
| `artwork-service` | `3002` | `3102` | internal ClusterIP |
| `payments-service` | `3003` | `3103` | internal ClusterIP; Stripe webhook enters via gateway unless Phase 23-25 approve otherwise |
| `orders-service` | `3004` | `3104` | internal ClusterIP |
| `messaging-service` | `3005` | `3105` | internal ClusterIP; public websocket path enters through gateway |
| `notifications-service` | `3006` | none until transport drift is resolved | internal ClusterIP |
| `events-service` | none | `3107` | internal ClusterIP |
| `community-service` | none | `3109` | internal ClusterIP |

## Verification Patterns

- Use file-existence and grep checks for chart structure.
- Use `helm lint` and `helm template` as baseline automated validation.
- Use `kubeconform` or `kubectl apply --dry-run=server` for Kubernetes schema validation.
- Use a gateway-only smoke script against `https://$ARTIUM_GATEWAY_HOST/health` or a configured equivalent.
- Use `kubectl get svc -n <namespace> -o jsonpath=...` checks to confirm only ingress controller exposure is public and application services are `ClusterIP`.
