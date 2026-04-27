# Phase 26 Research: Kubernetes Deployment Implementation & Production Platform Stack Foundation

## Research Complete

Phase 26 should produce deployable infrastructure artifacts, not another architecture memo. The implementation should use a Helm chart as the production packaging boundary, keep the core chart portable across managed Kubernetes providers, and isolate provider-specific details in values files or docs.

## Key Findings

### Helm chart structure

- Helm best-practice guidance favors a structured chart with reusable helpers, explicit values, dependency declarations in `Chart.yaml`, and environment-specific values files.
- Helm dependency management should be used for in-cluster PostgreSQL, Redis, and RabbitMQ because Phase 26 explicitly chose in-cluster stateful dependencies.
- The chart should avoid embedding provider-specific assumptions in templates. Provider differences belong in values overlays, documented install commands, and optional annotations.

Primary references:
- `https://helm.sh/docs/v3/chart_best_practices/`
- `https://helm.sh/docs/helm/helm_dependency/`

### Kubernetes workload design

- Application APIs should use `Deployment` and internal `ClusterIP` Services.
- The only public application entrypoint should be the API gateway `Ingress` with TLS.
- Kubernetes startup, readiness, and liveness probes have different purposes. Startup probes should protect slower NestJS bootstraps from premature liveness restarts; readiness should control traffic routing; liveness should detect deadlocked containers.
- Readiness failures remove pods from Service endpoints, which is useful for rollout safety.

Primary reference:
- `https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/`

### Sealed Secrets

- Sealed Secrets lets the project commit encrypted `SealedSecret` resources safely because only the controller in the target cluster can decrypt them.
- The controller private key is a recovery-critical asset. If the key is lost and no live decrypted Kubernetes Secret is available, sealed secret values must be regenerated.
- Key backup and restore docs must be part of Phase 26, not optional operational polish.

Primary reference:
- `https://github.com/bitnami-labs/sealed-secrets`

### In-cluster PostgreSQL, Redis, and RabbitMQ

- Bitnami charts are a practical baseline for this phase because they are maintained Helm charts for the selected stateful dependencies and support resource values, persistence, metrics options, and NetworkPolicy-related settings.
- Production values should set explicit `resources`, persistence, network policy, authentication via existing secrets, and backup/restore guidance. Preset resources are useful examples but should not be treated as production sizing.
- PostgreSQL backup/restore needs persistent volume backup guidance, such as Velero or provider volume snapshots.

Primary references:
- `https://github.com/bitnami/charts/blob/main/bitnami/postgresql/README.md`
- `https://github.com/bitnami/charts/blob/main/bitnami/redis/README.md`
- `https://github.com/bitnami/charts/blob/main/bitnami/rabbitmq/README.md`

## Implementation Implications

1. Create a new production chart under `BE/infrastructure/helm/artium-backend/` instead of modifying the legacy `BE/infrastructure/k8s/` manifests in place.
2. Keep legacy Kubernetes YAML as reference-only evidence. It contains `NodePort`, `emptyDir`, dev commands, invalid selectors/volumes, and stale names.
3. Add runtime feature flags around scheduled processors/listeners so API deployments can scale without duplicating side effects:
   - `OUTBOX_PROCESSOR_ENABLED`
   - `BLOCKCHAIN_LISTENER_ENABLED`
   - `ETHEREUM_CONFIRMATION_RETRY_ENABLED`
   - `NOTIFICATION_PROCESSOR_ENABLED`
4. Model workers as chart values separate from API workloads, defaulting worker replicas to `1`.
5. Use SealedSecret examples and `kubeseal` helper scripts. Do not commit plain secret manifests with real values.
6. Include `helm lint`, `helm template`, schema validation, real-cluster deployment commands, smoke checks, and rollback docs.

## Recommended Plan Breakdown

1. Helm foundation and dependency baseline.
2. Worker/runtime gating and singleton-safe deployment model.
3. Application chart templates for services, ingress, Sealed Secrets, probes, resources, and network boundaries.
4. Real-cluster validation, smoke checks, backup/restore, and runbook documentation.

## Validation Architecture

Validation should combine static rendering and real-cluster checks:

- `helm lint BE/infrastructure/helm/artium-backend`
- `helm dependency build BE/infrastructure/helm/artium-backend`
- `helm template artium-backend BE/infrastructure/helm/artium-backend -f BE/infrastructure/helm/artium-backend/values-production.yaml`
- `kubeconform -strict -summary` against rendered manifests when `kubeconform` is available.
- `kubectl apply --dry-run=server` against a real managed Kubernetes cluster when credentials are available.
- `helm upgrade --install --atomic --timeout 10m` against a real cluster for acceptance validation.
- Smoke checks should hit only the gateway public URL and verify private services are not exposed through public Service types.

## Research Risks

- The roadmap text still mentions managed external dependencies, but the Phase 26 CONTEXT locks in-cluster PostgreSQL, Redis, and RabbitMQ. Plans must treat that as an intentional documented exception.
- Existing backend health endpoints are inconsistent and shallow. Phase 26 should use available `/health` endpoints where present and use TCP probes only where HTTP health does not exist.
- Current Dockerfile port drift means chart values must choose an explicit service port contract and must not trust `EXPOSE` alone.
