#!/usr/bin/env bash
set -euo pipefail

RELEASE_NAME="${RELEASE_NAME:-artium-backend}"
NAMESPACE="${NAMESPACE:-artium-prod}"
REVISION="${REVISION:-${1:-}}"

helm history "$RELEASE_NAME" -n "$NAMESPACE"

if [[ -z "$REVISION" ]]; then
  echo "Usage: REVISION=<revision> $0" >&2
  echo "Example: REVISION=3 $0" >&2
  exit 1
fi

helm rollback "$RELEASE_NAME" "$REVISION" -n "$NAMESPACE"
