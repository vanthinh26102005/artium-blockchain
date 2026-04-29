# Deploying Artium To A Single-VM Kubernetes Cluster

## Prerequisites

Full acceptance requires a Kubernetes kubeconfig, container registry credentials, DNS, TLS, Helm, kubectl, kubeseal, and a storage class that can provision persistent volumes for PostgreSQL, Redis, and RabbitMQ.

For a 10-12 GB VM, keep this as a single-node production-like deployment:

- one replica for every backend API workload
- one replica for every singleton worker
- one frontend replica
- in-cluster PostgreSQL, Redis, and RabbitMQ with conservative resource requests
- ingress-nginx as the only public ingress path

## Build and publish images

Build every backend service image and the frontend image, then push immutable tags or digests to the configured registry. Replace every `__SET_IMMUTABLE_TAG__` value before deployment.

Build the frontend image with public browser-facing values baked in:

```bash
docker build -t ghcr.io/<owner>/artium-web:<tag> FE/artium-web \
  --build-arg NEXT_PUBLIC_API_URL=https://dg.pthinh.io.vn/api \
  --build-arg NEXT_PUBLIC_WS_URL=https://dg.pthinh.io.vn \
  --build-arg NEXT_PUBLIC_WEB_BASE_URL=https://dg.pthinh.io.vn \
  --build-arg NEXTAUTH_URL=https://dg.pthinh.io.vn \
  --build-arg NEXT_PUBLIC_COOKIE_DOMAIN=dg.pthinh.io.vn
```

Next.js embeds `NEXT_PUBLIC_*` variables at build time, so rebuilding the frontend image is required when the public domain or API URL changes.

## Configure DNS and TLS

In Cloudflare, create an `A` record:

- `dg.pthinh.io.vn` -> your VM public IP

Use Cloudflare SSL/TLS mode `Full (strict)`. Either install cert-manager, or create a Cloudflare Origin Certificate and store it as the Kubernetes TLS secret expected by the chart:

```bash
kubectl create secret tls artium-gateway-tls \
  -n artium-prod \
  --cert=cloudflare-origin.pem \
  --key=cloudflare-origin-key.pem
```

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

The chart routes:

- `https://dg.pthinh.io.vn/` to the Next.js frontend
- `https://dg.pthinh.io.vn/api`, `/api-docs`, `/socket.io`, `/messaging`, and `/auction` to the API gateway

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
