# Artium Backend Worker Runtime Contract

## Worker model

API deployments handle request/response traffic. Dedicated worker deployments own singleton or side-effecting background work so API replicas can scale without duplicating schedulers, listeners, confirmation retries, or notification requeues.

## Runtime flags

| Worker | Runs in image | Enable flag | API pod value | Worker pod value | Default replicas |
|---|---|---|---|---|---:|
| outbox | api-gateway | OUTBOX_PROCESSOR_ENABLED | false | true | 1 |
| blockchain-listener | orders-service | BLOCKCHAIN_LISTENER_ENABLED | false | true | 1 |
| ethereum-confirmation-retry | payments-service | ETHEREUM_CONFIRMATION_RETRY_ENABLED | false | true | 1 |
| notification-processor | notifications-service | NOTIFICATION_PROCESSOR_ENABLED | false | true | 1 |

## Default replica policy

Every worker defaults to one replica. Scaling a worker above 1 requires locking, leader election, or idempotency evidence.

## API pod settings

API pods set every worker enable flag to `false`. This prevents background ownership from being coupled to horizontal API scale-out.

## Worker pod settings

Worker pods set exactly one responsibility flag to `true` and all unrelated worker flags to `false`. The worker pod uses the same service image as its owning application where the processor already lives.

## Scale-out requirements

Before changing any worker `replicaCount` above `1`, document the coordination mechanism, failure mode, and verification evidence in the release runbook.
