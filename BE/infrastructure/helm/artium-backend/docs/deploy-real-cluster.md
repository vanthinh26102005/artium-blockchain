# Deploying Artium Backend To A Real Cluster

## Prerequisites

Full acceptance requires a real managed Kubernetes kubeconfig, container registry credentials, DNS, TLS, Helm, kubectl, kubeseal, and a storage class that can provision persistent volumes for PostgreSQL, Redis, and RabbitMQ.

## Build and publish images

Build every backend service image and push immutable tags or digests to the configured registry. Replace every `__SET_IMMUTABLE_TAG__` value before deployment.

## Install Sealed Secrets controller

Install the Sealed Secrets controller into the target cluster before applying this chart. Confirm the controller is running and fetch its public certificate before sealing runtime secrets.

## Seal runtime secrets

Create a local plaintext Kubernetes Secret only as a temporary input, run `BE/infrastructure/helm/artium-backend/scripts/seal-secrets.sh`, commit only the resulting SealedSecret, then delete the plaintext input.

## Validate manifests

Run:

```bash
BE/infrastructure/helm/artium-backend/scripts/validate-k8s.sh
```

Set `RUN_SERVER_DRY_RUN=true` after the kubeconfig points at the real managed cluster.

## Deploy with Helm

```bash
helm upgrade --install --atomic --timeout 10m artium-backend BE/infrastructure/helm/artium-backend -f BE/infrastructure/helm/artium-backend/values-production.yaml -n artium-prod --create-namespace
```

## Run smoke checks

Set `ARTIUM_GATEWAY_URL` to the public gateway URL and run:

```bash
BE/infrastructure/helm/artium-backend/scripts/smoke-check.sh
```

## Roll back

Inspect Helm history, choose a known-good revision, then run:

```bash
REVISION=<revision> BE/infrastructure/helm/artium-backend/scripts/rollback.sh
```
