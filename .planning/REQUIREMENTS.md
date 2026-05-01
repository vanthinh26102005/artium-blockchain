# Requirements: Artium Blockchain Marketplace

**Defined:** 2026-04-21
**Core Value:** Let artists and sellers present, sell, and manage artwork through trustworthy flows that preserve ownership, media, order, and lifecycle truth.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: Developers can view a complete audit/inventory map of duplicated domain components and migration targets.
- [ ] **FND-02**: Developers can use a locked canonical component prop contract (naming + typing) across shared form/input components.
- [ ] **FND-03**: Developers can import standardized components through stable barrel exports in shared and domain layers.

### Shared Component Layer

- [ ] **SHR-01**: Developers can use shared form primitives (`FormInput`, `FormTextarea`, `FormLabel`, `FormError`) built on existing shared UI primitives.
- [ ] **SHR-02**: Developers can integrate shared form primitives with React Hook Form safely via `forwardRef` and compatible field/error wiring.
- [ ] **SHR-03**: Developers can keep existing domain-level imports working through backward-compatible wrapper components.

### Migration Rollout

- [ ] **MIG-01**: Developers can migrate `auth` domain components to shared components without UI or behavior change.
- [ ] **MIG-02**: Developers can migrate `checkout` and `quick-sell` domain components to shared components without UI or behavior change.
- [ ] **MIG-03**: Developers can migrate `profile` and `events` domain components to shared components without UI or behavior change.
- [ ] **MIG-04**: Developers can migrate remaining domain component implementations to shared components using phased domain-by-domain rollout in the same milestone.

### Safety & Verification

- [ ] **SAFE-01**: Developers can verify no visual regressions during migration using deterministic before/after checks for migrated component surfaces.
- [ ] **SAFE-02**: Developers can verify no logic regressions in migrated domains by preserving existing domain API contracts and behavior.
- [ ] **SAFE-03**: Developers can clear known frontend TypeScript blockers in supporting order/auth/artwork flows before closing follow-up polish phases that depend on them.

### Checkout Payments

- [ ] **PAY-01**: Developers can complete checkout card payments end-to-end using a Stripe PaymentIntent confirmed in the same Stripe account context that collected the card details.
- [ ] **PAY-02**: Developers can connect MetaMask and submit wallet payments only on Sepolia testnet with a verified ETH amount, never by treating the raw USD checkout total as ETH or allowing checkout on the wrong chain.
- [ ] **PAY-03**: Developers can record Ethereum payments through `POST /payments/ethereum` with consistent amount/currency metadata and duplicate `txHash` protection.
- [ ] **PAY-04**: Developers can process Stripe webhook terminal events through one canonical entry point that updates transactions and outbox events correctly.

### Checkout Payment Feedback

- [ ] **UX-01**: Developers can keep checkout users on an inline success or processing screen after Pay Now instead of redirecting away immediately.
- [ ] **UX-02**: Developers can show retry-friendly inline error and recovery states for card, network, and wallet failures without losing checkout step-1 data.
- [ ] **UX-03**: Developers can validate checkout payment changes with build/typecheck evidence and phase verification artifacts before the milestone is marked complete.

### Order Tracking & Management

- [ ] **ORD-01**: Developers can provide authenticated users with a private orders workspace that shows only the purchases or sales they are authorized to access.
- [ ] **ORD-02**: Developers can present professional order list and detail views with lifecycle status, artwork/payment/shipping summaries, and responsive empty/loading/error states.
- [ ] **ORD-03**: Developers can expose only status-valid order actions to the correct role, including buyer delivery/dispute flows and seller shipment flows, with server-side access enforcement.
- [ ] **ORD-04**: Developers can present payment and shipping records on order detail with copyable identifiers and lifecycle-accurate messaging instead of generic placeholders.

## v1.1 Requirements

Milestone focus: seller-only auction creation from owned inventory with practical business policy enforcement.

### Seller Auction Access & Eligibility

- [x] **SAUC-01**: Sellers can access a protected auction creation workspace only when authenticated and recognized as seller-capable; non-sellers are blocked by both frontend route guards and backend authorization.
- [x] **SAUC-02**: Sellers can choose only artworks they own from inventory, with the picker excluding sold, deleted, already-auctioned, active-order, multi-quantity, or incomplete artwork records.
- [x] **SAUC-03**: Sellers can see clear eligibility reasons and recovery actions when an artwork cannot be auctioned, such as completing required metadata, uploading a primary image, or resolving an active listing/order state.
- [x] **SAUC-10**: Authenticated non-sellers can register a seller profile from profile settings, with backend seller role activation performed server-side in the same transaction as seller profile creation and without auto-granting verification or payment onboarding.

### Auction Terms & Policy

- [x] **SAUC-04**: Sellers can configure auction terms with validated starting bid, optional reserve policy, minimum bid increment, duration/start/end timing, and shipping/payment disclosures before starting the auction.
- [x] **SAUC-05**: Sellers can preview the final auction card and policy summary before submission, including fees, irreversibility after activation, Sepolia/network expectations, and buyer-facing disclosures.
- [x] **SAUC-06**: Sellers cannot edit unsafe auction economics after activation; only explicitly safe lifecycle actions remain available according to auction state.

### Auction Start & Lifecycle Truth

- [x] **SAUC-07**: Backend can start an auction idempotently only after validating seller identity, artwork ownership, artwork eligibility, seller wallet/profile readiness, and contract/network configuration.
- [x] **SAUC-08**: Backend can persist the auction start across on-chain and off-chain state so public `GET /auctions` and seller inventory/order views reflect the new auction without mock data.
- [x] **SAUC-09**: Sellers can monitor auction start status across pending, active, failed, and retryable states with tx hash, reason codes, and recovery paths that do not duplicate auctions.

## Omitted v1.2 Requirements (Historical)

Milestone focus was production-grade backend deployment strategy grounded in the real backend runtime, not in stale or purely theoretical infrastructure diagrams.

**Status:** Omitted/redundant by user decision on 2026-04-29. Keep these requirements as historical context only. They are not active milestone closure requirements and are intentionally excluded from active traceability.

### Discovery & Runtime Truth

- [x] **DISC-01**: Developers can inventory every backend workload, its real ports, startup command, and environment source from code, Dockerfiles, and Compose.
- [x] **DISC-02**: Developers can map every internal and external dependency, including PostgreSQL, Redis, RabbitMQ, Mailhog, GCS, Stripe, SMTP, and blockchain RPC.
- [x] **DISC-03**: Developers can identify drift between Dockerfiles, compose files, env defaults, `main.ts`, and legacy Kubernetes manifests before proposing production topology.
- [x] **DISC-04**: Developers can distinguish stateless APIs, TCP-only services, websocket workloads, stateful systems, and singleton/background processes in the current backend.

### Architecture Analysis

- [x] **ARCH-01**: Developers can classify each backend service by role and map the full dependency graph.
- [x] **ARCH-02**: Developers can explain the current communication paths across gateway TCP calls, RabbitMQ events/outbox, websocket traffic, and external callbacks/webhooks.
- [x] **ARCH-03**: Developers can identify scalability and reliability concerns tied to the current design, including schema-sync assumptions, in-process schedulers/listeners, shallow probes, and config drift.
- [x] **ARCH-04**: Developers can identify legacy or over-engineered deployment artifacts that should not be mirrored into production unchanged.

### Kubernetes Design

- [x] **K8S-01**: DevOps engineers can decide what belongs in Kubernetes versus managed external services for this backend, with explicit rationale.
- [x] **K8S-02**: DevOps engineers can define namespace, workload, service exposure, and ingress strategy that fits the actual backend topology.
- [x] **K8S-03**: DevOps engineers can define replica, health/readiness/startup, resource, and autoscaling policies by workload class.
- [x] **K8S-04**: DevOps engineers can define config, secret, and network-boundary strategy with least-privilege defaults.

### Docker & Release Strategy

- [x] **DOCK-01**: DevOps engineers can build immutable production images using optimized multi-stage builds and runtime-safe defaults.
- [x] **DOCK-02**: DevOps engineers can version and promote images with reproducible tags or digests and rollback-friendly release metadata.
- [x] **DOCK-03**: DevOps engineers can eliminate development-only container behavior from the production deployment design.

### Operations & Delivery

- [x] **OPS-01**: Teams can run a CI/CD pipeline that builds, tests, scans, publishes, migrates, and deploys the backend safely.
- [x] **OPS-02**: Operators can observe backend health through practical logging, metrics, and tracing recommendations tied to HTTP, RabbitMQ, and blockchain/payment flows.
- [x] **OPS-03**: Operators can recover from pod, node, dependency, or rollout failures using defined backup, restore, and rollback procedures.
- [x] **OPS-04**: Operators can scale stateless services without duplicating singleton/background responsibilities such as outbox publishing or blockchain listeners.
- [x] **OPS-05**: Operators can protect sensitive credentials and raw-body webhook paths in production without breaking Stripe or blockchain integrations.

### Delivery Artifacts

- [x] **DELV-01**: Stakeholders can review a text-based architecture diagram of the current and recommended production topology.
- [x] **DELV-02**: Stakeholders can follow a step-by-step deployment plan from cluster bootstrap through backend rollout.
- [x] **DELV-03**: Stakeholders can inspect sample Kubernetes manifests aligned to the recommended architecture.
- [x] **DELV-04**: Stakeholders can review a risk register with practical mitigations for brownfield adoption.

### v1.2 Out of Scope

- **Full infrastructure implementation in this milestone**: This milestone defines the production strategy and artifacts, not the final cluster rollout.
- **Service-mesh adoption**: Adds complexity before the backend runtime contract is fully stabilized.
- **Multi-region or multi-cluster disaster-tolerant architecture**: Too large for the first production deployment strategy milestone.
- **Database re-architecture beyond what is necessary to choose a production operating model**: The goal is deployment strategy, not a full persistence redesign.

## v1.3 Requirements

Milestone focus: order-linked invoice preview and extraction from the authenticated Orders workspace.

### Order-Invoice Backend Contract

- [x] **OINV-01**: Buyers and sellers can request invoice data for an order only when the existing `/orders` access policy already authorizes them to view that order.
- [x] **OINV-02**: Backend can return an order-linked invoice read model that includes invoice number, status, issue/paid dates, order number, artwork line items, totals, currency, payment identifiers, buyer/seller context, and shipping/billing context without exposing cross-user data.
- [x] **OINV-03**: Backend can idempotently materialize an invoice from canonical order, order item, and payment records when an authorized order has no linked invoice yet, reusing payments-service invoice persistence and `order_id` rather than adding a duplicate orders-service invoice store.

### Orders Invoice UI

- [x] **OINV-04**: Buyers and sellers can see an invoice action from the orders list and order detail pages when invoice preview or extraction is available for the order state.
- [x] **OINV-05**: Buyers and sellers can open a responsive invoice preview from `/orders` that presents artwork, buyer/seller, order, payment, shipping, subtotal, tax, discount, shipping, total, and key identifiers in a polished document-style layout.
- [x] **OINV-06**: Invoice preview UI handles loading, empty, unavailable, unauthorized, and retry states without breaking the existing orders workspace filters, pagination, role scope, or order actions.

### Invoice Extraction

- [x] **OINV-07**: Buyers and sellers can extract the invoice through a print/download-ready flow that preserves layout, identifiers, totals, dates, and Artium branding across desktop and mobile.
- [x] **OINV-08**: Extracted invoices avoid client-only recomputation of financial truth; frontend formatting must be derived from the backend invoice/order DTO and must clearly label unavailable backend fields rather than inventing placeholders.

### Verification

- [ ] **OINV-09**: Developers can verify invoice authorization, idempotent materialization, DTO mapping, frontend preview/extraction behavior, responsive UI, and TypeScript/lint/build checks with documented evidence before the milestone is closed.

## v1.4 Requirements

Milestone focus: profile moment and moodboard creation must use device uploads instead of pasted media links, with profile UI quality aligned to the existing Orders workspace.

### Profile Media Upload Backend

- [ ] **PMED-01**: Authenticated users can upload one profile moment media file from their device, accepting exactly one image or one video with server-side file type, size, ownership, and storage validation.
- [ ] **PMED-02**: Authenticated users can upload multiple moodboard media files from their device, accepting a bounded set of image/media files with server-side file type, size, count, ownership, and storage validation.
- [ ] **PMED-03**: Backend upload responses expose stable stored media metadata for community creation flows, including URL, secure URL when available, media type, original filename, size, and any thumbnail or poster metadata the backend can derive.
- [ ] **PMED-04**: Community moment and moodboard creation continues to derive the creator identity from the authenticated user, not request body user IDs, and never trusts client-provided external media links as uploaded media proof.

### Moment Device Upload Creation

- [ ] **PMED-05**: Profile owners can create a moment from their profile using exactly one uploaded image or one uploaded video from their device, then submit caption, location, hashtags, pinning, duration, and tagged artwork metadata where supported.
- [ ] **PMED-06**: Moment creation UI blocks submission until upload and validation are complete, shows progress/loading/error/retry states, and cleans up or clearly handles failed/replaced uploads without creating partial moments.

### Moodboard Device Upload Creation

- [ ] **PMED-07**: Profile owners can create a moodboard from their profile by uploading multiple media items from their device, allowing images, supported moodboard/media references, or both where the backend model supports them.
- [ ] **PMED-08**: Moodboard creation UI supports cover selection, media reordering/removal before submit, title, description, privacy, collaboration, and tags without relying on pasted cover image links.
- [ ] **PMED-09**: Moodboard creation persists enough media/cover metadata for profile overview, moodboard list, and moodboard detail pages to render uploaded content accurately.

### Orders-Aligned Profile UI and Verification

- [ ] **PMED-10**: Profile creation surfaces for moments and moodboards visually align with the Orders workspace UI patterns, including calm card structure, clear status chips or messages, accessible controls, responsive behavior, and polished empty/error states.
- [ ] **PMED-11**: Developers can verify backend upload validation, community DTO mapping, frontend upload/composer behavior, responsive profile UI, and TypeScript/lint/build checks with documented evidence before closing the milestone.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Tooling & Design System Enhancements

- **V2-01**: Developers can use a visual component documentation layer (e.g., Storybook-like catalog) for shared component discoverability.
- **V2-02**: Developers can standardize variant-heavy component styling with broader CVA-based variant architecture.
- **V2-03**: Developers can standardize complex multi-step form shells after leaf-level field migration is complete.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Visual redesign (layout/spacing/colors/typography) | Explicitly prohibited by project scope |
| New end-user features | This milestone is refactor-only |
| Backend/API/business logic changes | Not required for component standardization |
| Single giant all-domain migration change | Higher regression risk; phased rollout required |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| SAFE-01 | Phase 1 | Pending |
| SAFE-02 | Phase 1 | Pending |
| SAFE-03 | Phase 14 | Pending |
| SHR-01 | Phase 2 | Pending |
| SHR-02 | Phase 2 | Pending |
| SHR-03 | Phase 2 | Pending |
| MIG-01 | Phase 3 | Pending |
| MIG-02 | Phase 3 | Pending |
| MIG-03 | Phase 4 | Pending |
| MIG-04 | Phase 5 | Pending |
| PAY-01 | Phase 10 | Pending |
| PAY-02 | Phase 8 | Pending |
| PAY-03 | Phase 8 | Pending |
| PAY-04 | Phase 9 | Pending |
| UX-01 | Phase 9 | Pending |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 10 | Pending |
| ORD-01 | Phase 12 | Pending |
| ORD-02 | Phase 12 | Pending |
| ORD-03 | Phase 12 | Pending |
| ORD-04 | Phase 14 | Pending |
| SAUC-01 | Phase 18 | Completed |
| SAUC-02 | Phase 18 | Completed |
| SAUC-03 | Phase 18 | Completed |
| SAUC-10 | Phase 19.1 | Completed |
| SAUC-04 | Phase 19.1 | Completed |
| SAUC-05 | Phase 19.1 | Completed |
| SAUC-06 | Phase 20 | Complete |
| SAUC-07 | Phase 20 | Complete |
| SAUC-08 | Phase 20 | Complete |
| SAUC-09 | Phase 20 | Complete |
| v1.2 backend deployment strategy | Phases 21-26 | Omitted/redundant 2026-04-29 |
| OINV-01 | Phase 30 | Complete |
| OINV-02 | Phase 30 | Complete |
| OINV-03 | Phase 30 | Complete |
| OINV-04 | Phase 31 | Complete |
| OINV-05 | Phase 31 | Complete |
| OINV-06 | Phase 31 | Complete |
| OINV-07 | Phase 31 | Complete |
| OINV-08 | Phase 31 | Complete |
| OINV-09 | Phase 32 | Pending |
| PMED-01 | Phase 33 | Pending |
| PMED-02 | Phase 33 | Pending |
| PMED-03 | Phase 33 | Pending |
| PMED-04 | Phase 33 | Pending |
| PMED-05 | Phase 34 | Pending |
| PMED-06 | Phase 34 | Pending |
| PMED-07 | Phase 35 | Pending |
| PMED-08 | Phase 35 | Pending |
| PMED-09 | Phase 35 | Pending |
| PMED-10 | Phase 35 | Pending |
| PMED-11 | Phase 35 | Pending |

**Coverage:**
- Active v1 + v1.1 requirements: 34 total
- Mapped to phases: 34 ✓
- Unmapped: 0 ✓
- Omitted historical v1.2 requirements: 24 total
- Active v1.3 requirements: 9 total
- Mapped to phases: 9 ✓
- Active v1.4 requirements: 11 total
- Mapped to phases: 11 ✓

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-05-01 after defining v1.4 profile moment and moodboard device upload requirements*
