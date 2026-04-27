#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SEALED_SECRETS_CERT:-}" ]]; then
  echo "SEALED_SECRETS_CERT is required and must point to the public sealing certificate." >&2
  exit 1
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: SEALED_SECRETS_CERT=sealed-secrets.pem $0 path/to/plain-secret.yaml" >&2
  echo "Do not commit plaintext Secret manifests" >&2
  exit 1
fi

SECRET_FILE="$1"

if [[ ! -f "$SECRET_FILE" ]]; then
  echo "Secret file not found: $SECRET_FILE" >&2
  exit 1
fi

echo "Do not commit plaintext Secret manifests" >&2
kubeseal --format yaml --cert "$SEALED_SECRETS_CERT" < "$SECRET_FILE"
