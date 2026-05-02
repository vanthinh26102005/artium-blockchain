# Artium Backend Helm Chart

## Purpose

This chart is the production Kubernetes foundation for the Artium backend platform. It packages the API gateway, backend services, dedicated worker workloads, and selected in-cluster dependencies behind one provider-portable Helm release.

## Production target

Phase 26 targets real generic managed Kubernetes. The production target is not the legacy Skaffold/dev YAML and not a local-only kind or Minikube rendering exercise. Provider-specific settings belong in values overlays, annotations, or deployment docs instead of core templates.

## Chart dependencies

PostgreSQL, Redis, and RabbitMQ run in-cluster for this phase. The chart uses maintained Bitnami Helm dependencies and pins each dependency version in `Chart.yaml` so `helm dependency build` produces reproducible input.

## Required image inputs

Every backend workload requires an immutable image tag or digest in `values.yaml` or an environment-specific overlay. The placeholder `__SET_IMMUTABLE_TAG__` must be replaced before installation. Do not deploy mutable tags such as development branch names or unpinned image references.

## Dependency model

The default dependency model is in-cluster PostgreSQL, Redis, and RabbitMQ with persistence, explicit resources, and restricted network access in production values. External managed dependencies are future alternatives and are intentionally not the Phase 26 default.

## Legacy manifests are reference-only

Do not copy `NodePort`, `emptyDir`, `yarn run dev:*`, `artworks-service`, or Mailhog into production. Existing files under `BE/infrastructure/k8s/` are development-era evidence and drift records only.

## First validation commands

```bash
helm dependency build BE/infrastructure/helm/artium-backend
helm lint BE/infrastructure/helm/artium-backend
helm template artium-backend BE/infrastructure/helm/artium-backend -f BE/infrastructure/helm/artium-backend/values-production.yaml
```
