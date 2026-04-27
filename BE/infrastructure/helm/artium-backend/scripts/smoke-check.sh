#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ARTIUM_GATEWAY_URL:-}" ]]; then
  echo "ARTIUM_GATEWAY_URL is required, for example https://api.example.com" >&2
  exit 1
fi

NAMESPACE="${NAMESPACE:-artium-prod}"

curl -fsS "$ARTIUM_GATEWAY_URL/health"
curl -fsS "${ARTIUM_GATEWAY_URL}${ARTIUM_SMOKE_PATH:-/api-docs}"

if [[ "${CHECK_CLUSTER_SERVICES:-false}" == "true" ]]; then
  service_report="$(kubectl get svc -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.type}{"\n"}{end}')"
  echo "$service_report"
  if echo "$service_report" | awk '/identity-service|artwork-service|payments-service|orders-service|messaging-service|notifications-service|events-service|community-service/ && $2 != "ClusterIP" { exit 1 }'; then
    true
  else
    echo "One or more application services are not ClusterIP" >&2
    exit 1
  fi
fi

echo "Gateway smoke checks passed"
