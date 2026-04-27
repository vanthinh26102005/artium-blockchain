# 22-04 Legacy Artifact Disposition

## Scope

This ARCH-04 artifact tells later deployment-design phases which current repository artifacts are authoritative, which are legacy/dev evidence, and which remain unresolved current-state drift. It does not choose platform topology, workload kinds, service exposure, or provider hosting.

## Disposition rules

| Disposition | Meaning | Allowed downstream use |
|---|---|---|
| exclude | Do not mirror the artifact or drift cluster directly into production design. | Use only as evidence of what not to copy or as cleanup input. |
| revalidate | Confirm current intent from source/code/runtime owners before using the artifact as design input. | Use as a question or validation task, not as a default. |
| analyze as unresolved current-state drift | Keep the evidence visible because it affects architecture, but defer the design choice to the correct later phase. | Carry into Phase 23/24/25 as a risk or decision input. |

## Artifact disposition matrix

| Artifact or drift cluster | What current evidence says | Why it is non-authoritative or unresolved | Disposition | Allowed downstream use | Evidence |
|---|---|---|---|---|---|
| Legacy Kubernetes service deployments using `yarn run dev:*` | Service deployment YAML runs commands such as `yarn run dev:identity`, `yarn run dev:payments`, `yarn run dev:artworks`, and `yarn run dev:messaging` | Dev commands conflict with Dockerfile production-style `node dist/apps/.../main.js` runtime contracts | exclude | Keep as legacy/dev evidence; do not copy commands into deployment strategy | `21-03-runtime-drift-audit.md`, `BE/infrastructure/k8s/services/*/deployment.yaml` |
| `emptyDir` application and node module mounts | Legacy service YAML mounts `/app` and `/app/node_modules` from `emptyDir` volumes | This models mutable dev filesystem behavior rather than immutable image execution | exclude | Use as a warning that existing YAML is not production-ready | `21-03-runtime-drift-audit.md`, service deployment YAML |
| `NodePort` service exposure | Identity, artwork, payments, messaging, RabbitMQ, and Mailhog manifests use `NodePort` | Exposure policy has not been chosen in Phase 22, and these manifests predate the architecture/risk analysis | exclude | Treat as dev exposure evidence only; later phases must define boundaries from architecture needs | `21-03-runtime-drift-audit.md`, K8s service YAML |
| Stale artwork naming `artworks-service` | Legacy K8s uses `artworks-service`, `dgpthinh/artworks-service:v1`, and `dev:artworks` | Current repo workload is `artwork-service`, Compose command is `dev:artwork`, and Docker path is `apps/artwork-service` | exclude | Do not use pluralized service name or command without deliberate cleanup/rewrite | `21-03-runtime-drift-audit.md`, `BE/infrastructure/k8s/services/artwork/*` |
| Invalid K8s node-module volume names | Deployments mount `node-modules`, but volumes are named `identity-node-modules`, `payments-node-modules`, `artwork-node-modules`, or `messaging-node-modules` | The manifests are internally inconsistent and should not be treated as runnable truth | exclude | Use as proof that legacy YAML needs rewrite rather than incremental copy-forward | `21-03-runtime-drift-audit.md` |
| Messaging K8s service selector drift | Messaging service YAML names/selects `identity-service` while exposing messaging-like port `3004` | The Service does not select the messaging deployment labels | exclude | Treat as stale YAML residue | `21-03-runtime-drift-audit.md`, `BE/infrastructure/k8s/services/messaging/service.yaml` |
| Stale Dockerfile `EXPOSE` ports | Several Dockerfiles advertise ports that conflict with code and Compose: api-gateway `EXPOSE 3002`, orders `EXPOSE 3006`, payments `EXPOSE 3005`, messaging `EXPOSE 3004`, notifications `EXPOSE 3003` | Image metadata conflicts with runtime source; each service contract needs revalidation before image strategy | analyze as unresolved current-state drift | Carry to Phase 24 Docker/image strategy and Phase 23 port contract work | `21-03-runtime-drift-audit.md`, service Dockerfiles |
| Missing `.env.compose` files | Compose references `BE/apps/**/.env.compose`, and Phase 21 artifacts cite env values, but current checkout has no readable files | Runtime defaults may depend on untracked developer-local files | analyze as unresolved current-state drift | Treat as config-source risk and require explicit env contract later | `21-03-runtime-drift-audit.md`, `BE/docker-compose.yml` |
| partial isolated-db overlay / isolated-db mode | Base Compose includes isolated database containers, while Phase 21 found service env defaults still oriented around shared DB evidence | Isolated DB availability does not equal a uniformly selected runtime contract | revalidate | Decide later whether isolated-db is intended current direction or leftover option | `21-02-dependency-environment-inventory.md`, `21-03-runtime-drift-audit.md` |
| `DB_STRATEGY` and schema creation | `database.helper.ts` supports shared schemas and isolated DB mode; `ensureSchemaExists(...)` creates schemas for shared mode | Persistence topology and migration lifecycle are architecture/release questions, not deployment defaults | analyze as unresolved current-state drift | Carry to persistence and release strategy phases | `BE/libs/common/src/database/database.helper.ts`, `22-03-risk-register.md` |
| `crm-service` | Code, package, Dockerfile, and scripts exist, but active Compose omits it | It is an orphan candidate, not current runtime truth | revalidate | Decide whether to revive, retire, or ignore before any workload inclusion list is finalized | `21-01-runtime-workload-inventory.md`, `22-01-service-role-catalog.md` |
| Gateway `CRM_SERVICE` config | `MICROSERVICES.CRM_SERVICE` has config support, but `ApiGatewayModule` does not register it | Config capability exists without active gateway dependency edge | revalidate | Keep as dormant config evidence only | `BE/apps/api-gateway/src/config/microservices.config.ts`, `22-01-service-role-catalog.md` |
| Mailhog deployment artifacts | Mailhog appears as local dev SMTP sink and K8s dev artifact | It is useful for local delivery inspection but not business runtime authority | exclude | Keep as dev-support evidence; production mail provider handling belongs to later secret/config design | `21-02-external-integration-matrix.md`, `21-03-runtime-drift-audit.md` |
| RabbitMQ and Redis legacy infra YAML | K8s infra YAML exists for RabbitMQ and Redis; RabbitMQ also uses `NodePort` in legacy manifests | Phase 22 only confirms dependencies, not provider hosting or platform placement | revalidate | Use dependency need as input, not the legacy YAML shape | `21-02-external-integration-matrix.md`, `21-03-runtime-drift-audit.md` |

## Revalidate-before-reuse items

- `crm-service` and gateway `CRM_SERVICE` config: confirm whether this is future scope or dead code.
- partial isolated-db overlay / isolated-db mode: confirm whether it is a real operating mode or a stale option beside `db-shared`.
- Dockerfile `EXPOSE` values: revalidate each image contract against code and Compose before Phase 24 image guidance.
- RabbitMQ and Redis deployment artifacts: revalidate provider placement and operational ownership later; do not infer it from legacy YAML.
- Missing `.env.compose` values: reconstruct an explicit config contract before using env-driven port defaults.

## Explicit exclusions from direct production mirroring

- Do not directly mirror Kubernetes manifests containing `yarn run dev:*`.
- Do not directly mirror `emptyDir` application/source or node-module mount patterns.
- Do not directly mirror `NodePort` exposure from legacy service files.
- Do not directly mirror `artworks-service` naming, image names, labels, selectors, or `dev:artworks` commands.
- Do not directly mirror invalid volume mount names or messaging service selectors that point at identity labels.
- Do not treat Mailhog as business runtime infrastructure.

## Downstream guardrails

Phase 23 may use this file to decide what needs analysis, exclusion, or revalidation before platform design starts. Phase 24 may use it for image-contract cleanup. Phase 25 may use it for operations and recovery assumptions. None of those phases should treat the legacy/dev artifacts above as current production truth without the indicated revalidation.
