# Project: Artium Blockchain Marketplace

## What This Is

Artium is an artwork marketplace with seller inventory management, buyer checkout, private order tracking, and blockchain-backed auction flows on Sepolia. The auction surface now supports public auction browsing, buyer bidding, and seller-side auction start orchestration from owned inventory with persisted lifecycle status.

## Core Value

Let artists and sellers run trustworthy auctions without bypassing ownership, eligibility, wallet, or lifecycle policy checks.

## Current Milestone: v1.3 Order Invoice Preview and Export

**Goal:** Let authenticated buyers and sellers open a trustworthy invoice preview from the Orders workspace and extract a polished invoice document from canonical order/payment data.

**Target features:**
- Backend order-invoice contract that exposes only authorized order-linked invoice data and reuses the existing payments-service invoice model instead of creating a duplicate invoice system.
- Idempotent invoice materialization for completed order records where no linked invoice exists yet, with totals, artwork lines, buyer/seller context, payment identifiers, and lifecycle dates derived from backend truth.
- Orders list and order detail invoice actions that clearly show when an invoice is available, loading, missing, or blocked by order/payment state.
- Professional responsive invoice preview UI aligned with Artium order workspace patterns and invoice best practices, including printable/exportable layout, stable totals, identifiers, address/payment sections, and accessible controls.
- Verification evidence across backend authorization, DTO mapping, frontend preview/export behavior, and TypeScript/lint/build checks.

## Current State

- The frontend orders domain lives under `FE/artium-web/src/@domains/orders` and currently provides private buyer/seller order lists, order detail, payment/shipping summaries, copyable payment identifiers, and role-valid lifecycle actions.
- The frontend invoice API and quick-sell invoice surfaces already exist separately under `FE/artium-web/src/@shared/apis/invoiceApis.ts` and `FE/artium-web/src/@domains/quick-sell`, but `/orders` does not yet expose invoice preview or extraction actions.
- Phase 30 completed the backend order invoice bridge: `GET /orders/:id/invoice` authorizes through the existing private order policy, calls payments-service materialization only after authorization, redacts seller invoice responses, and exposes `orderApis.getOrderInvoice` for Phase 31.
- Payments-service now reuses existing invoice persistence to read or idempotently materialize order-linked invoices with stable `INV-${orderNumber}` numbers, invoice items, totals, and payment transaction links.
- Phase 31 should build invoice preview/extraction UI on top of the Phase 30 backend/API contract rather than adding new invoice persistence or recomputing financial truth in the frontend.

## Active Requirements

- Order invoice preview/export requirements live in `.planning/REQUIREMENTS.md` under `v1.3 Requirements`.

## Key Decisions

- Seller auction creation must be server-authorized; frontend route guards are convenience only.
- Only the seller who owns the artwork can start an auction for it.
- Auction eligibility must exclude sold, deleted, already-auctioned, active-order, multi-quantity, or incomplete artwork records.
- Once an auction is active, seller-editable fields should be locked except explicitly safe lifecycle actions.
- MetaMask transaction submission is pending evidence only; backend/on-chain synchronized state remains the source of truth.
- Backend lifecycle DTOs should expose wallet calldata only while wallet action is still required and no tx hash has been attached.
- Deployment planning must model the existing backend first and avoid inventing target-state topology that contradicts the current service graph.
- Production deployment recommendations should optimize for operational clarity and reliability over preserving every local-development Docker Compose convenience.
- Order invoice preview must be generated from backend-authorized order/invoice data, not from client-only reconstruction of totals.
- Orders UI may present invoice preview and export actions, but it must not bypass `/orders` access control or expose invoices across buyer/seller boundaries.
- Reuse the existing payments-service invoice tables, invoice DTO concepts, and quick-sell presentation lessons where they fit; avoid creating a second invoice domain model inside the orders frontend.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason.
2. Requirements validated? Move to Validated with phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. "What This Is" still accurate? Update if drifted.

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections.
2. Core Value check: still the right priority?
3. Audit Out of Scope: reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-04-30 after completing Phase 30 order-linked invoice backend contract*
