# Artium Backend Kubernetes Runbook

## Release checklist

1. Confirm immutable image tags or digests are set.
2. Confirm Sealed Secrets controller is installed and runtime secrets are sealed.
3. Run `BE/infrastructure/helm/artium-backend/scripts/validate-k8s.sh`.
4. Deploy with Helm atomic upgrade.
5. Run `BE/infrastructure/helm/artium-backend/scripts/smoke-check.sh`.

## Health checks

```bash
helm status artium-backend -n artium-prod
kubectl get pods -n artium-prod
kubectl logs -n artium-prod deploy/api-gateway
scripts/smoke-check.sh
```

## Observability hooks

Collect pod restart counts, readiness failures, gateway latency, RabbitMQ queue depth, Redis memory, PostgreSQL connections, and worker logs. Add service-specific metrics before increasing traffic.

## Worker operations

Keep `OutboxProcessor` and `blockchain-event-listener` at one active replica unless locking, leader election, or idempotency evidence exists. Confirm worker env flags before scaling API deployments.

## Rollback

```bash
scripts/rollback.sh
```

Use `helm history` to choose the revision, then run the rollback helper with `REVISION=<revision>`.

## Dependency failure response

Check PostgreSQL, Redis, and RabbitMQ pods and PVCs first. If a stateful dependency loses data, stop write traffic, restore from the approved backup set, and run smoke checks before reopening public traffic.

## Known brownfield risks

| Risk | Operational check |
|---|---|
| notifications-service transport mismatch | Verify gateway notification routes reach the intended service port before production traffic. |
| Dockerfile EXPOSE drift | Do not infer runtime ports from Dockerfile `EXPOSE`; use chart values. |
| missing .env.compose files | Treat compose env references as development evidence only. |
| DB_SYNCHRONIZE | Confirm production schema lifecycle and migrations before deployment. |
| OutboxProcessor | Keep worker singleton semantics visible during scale changes. |
| blockchain-event-listener | Watch cursor progress and avoid duplicate active listeners. |
