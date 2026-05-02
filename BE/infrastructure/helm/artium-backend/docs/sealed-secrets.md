# Sealed Secrets Operations

## Controller bootstrap

Install the Sealed Secrets controller in the target cluster before deploying Artium runtime secrets. Keep controller installation managed outside this chart so key lifecycle is explicit.

## Fetch public certificate

Fetch the public certificate from the target controller and store it locally for sealing:

```bash
kubeseal --fetch-cert > sealed-secrets.pem
```

## Seal secrets

Use the helper script with a temporary plaintext Secret manifest:

```bash
SEALED_SECRETS_CERT=sealed-secrets.pem BE/infrastructure/helm/artium-backend/scripts/seal-secrets.sh secret.yaml > sealed-secret.yaml
```

## Key backup

The controller key backup contains private keys. Store it only in the approved secure backup location.

```bash
kubectl get secret -n kube-system -l sealedsecrets.bitnami.com/sealed-secrets-key -o yaml > sealed-secrets-controller-keys.yaml
```

## Key restore

Restore controller keys before installing or restarting the controller in disaster recovery:

```bash
kubectl apply -f sealed-secrets-controller-keys.yaml
```

## Key renewal and rotation

Plan key renewal during a maintenance window. After rotation, reseal runtime secrets with the new public certificate and verify the controller can decrypt every required Secret.

## Plaintext handling rules

Never commit plaintext Secret manifests or unencrypted secret values. Delete temporary plaintext inputs after sealing and keep shell history free of secret literals.
