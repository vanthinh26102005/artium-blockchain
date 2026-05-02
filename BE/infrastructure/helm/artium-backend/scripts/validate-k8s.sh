#!/usr/bin/env bash
set -euo pipefail

CHART_DIR="${CHART_DIR:-BE/infrastructure/helm/artium-backend}"
RELEASE_NAME="${RELEASE_NAME:-artium-backend}"
NAMESPACE="${NAMESPACE:-artium-prod}"
VALUES_FILE="${VALUES_FILE:-$CHART_DIR/values-production.yaml}"
RENDERED_FILE="${RENDERED_FILE:-/tmp/${RELEASE_NAME}-rendered.yaml}"

helm dependency build "$CHART_DIR"
helm lint "$CHART_DIR"
helm template "$RELEASE_NAME" "$CHART_DIR" -n "$NAMESPACE" -f "$VALUES_FILE" > "$RENDERED_FILE"

if command -v kubeconform >/dev/null 2>&1; then
  kubeconform -strict -summary "$RENDERED_FILE"
else
  echo "kubeconform not found; skipping schema validation"
fi

if [[ "${RUN_SERVER_DRY_RUN:-false}" == "true" ]]; then
  kubectl apply --dry-run=server -n "$NAMESPACE" -f "$RENDERED_FILE"
else
  echo "RUN_SERVER_DRY_RUN is not true; skipping server-side dry-run"
fi
