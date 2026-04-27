# Stateful Dependency Backup And Restore

## Scope

This guide covers in-cluster PostgreSQL, Redis, and RabbitMQ deployed by the Phase 26 Helm chart.

## PostgreSQL

Use persistent volume backup plus logical backups. A logical example:

```bash
kubectl exec -n artium-prod deploy/artium-backend-postgresql -- pg_dump -U artium artium > artium-postgres.sql
```

Restore drills should verify schema, user access, and application startup after restore.

## Redis

Use Redis persistence snapshots together with PVC backup. Confirm the Redis password Secret and PVC snapshot are from the same recovery point.

## RabbitMQ

Export RabbitMQ definition data before disruptive upgrades and keep it with the PVC backup set. RabbitMQ definition export should include exchanges, queues, bindings, users, and policies.

## Persistent volume backup

Use Velero or provider volume snapshots for PostgreSQL, Redis, and RabbitMQ PVC backup. Document the storage class snapshot support before production acceptance.

## Restore drill

Run restore drills in a non-production namespace. Validate application boot, gateway smoke checks, worker startup, and message processing before declaring a backup strategy production-ready.

## What is not backed up here

Mailhog is excluded from production backup because it is a development-only mail sink and is not part of the Phase 26 production runtime.
