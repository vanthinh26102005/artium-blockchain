# Project: Artium Blockchain Marketplace

## What This Is

Artium is an artwork marketplace with seller inventory management, buyer checkout, private order tracking, and blockchain-backed auction flows on Sepolia. The auction surface now supports public auction browsing, buyer bidding, and seller-side auction start orchestration from owned inventory with persisted lifecycle status.

## Core Value

Let artists and sellers run trustworthy auctions without bypassing ownership, eligibility, wallet, or lifecycle policy checks.

## Current Milestone: v1.2 Backend Deployment Strategy

**Goal:** Build a production-grade deployment strategy for the backend by first understanding the existing backend system precisely, then mapping that reality into an opinionated Kubernetes and Docker operating model.

**Target features:**
- Deep backend infrastructure analysis covering service structure, Dockerfiles, compose files, environment patterns, networking, stateful dependencies, and runtime/build requirements.
- Architecture analysis that classifies backend services, maps dependencies, and highlights scalability, reliability, and unnecessary complexity risks.
- Production deployment design spanning Kubernetes workload topology, networking, config and secret handling, Docker image strategy, CI/CD, observability, health checks, scaling, and recovery.
- Practical delivery artifacts including a text architecture diagram, step-by-step deployment plan, sample Kubernetes manifests, and explicit risk mitigations.

## Current State

- The backend already runs as a brownfield multi-service system with local Docker Compose orchestration, but the repository does not yet have a production-grade Kubernetes deployment strategy captured in planning artifacts.
- This milestone starts by modeling the backend exactly as implemented before making infrastructure recommendations, so deployment decisions are grounded in real service boundaries, dependencies, and operational constraints.
- Phase 20 is complete: seller auction starts are idempotent, lifecycle status is seller-visible, unsafe economics lock after activation, and public auction reads wait for authoritative active convergence.

## Active Requirements

- Backend deployment strategy requirements live in `.planning/REQUIREMENTS.md` under `v1.2 Requirements`.

## Key Decisions

- Seller auction creation must be server-authorized; frontend route guards are convenience only.
- Only the seller who owns the artwork can start an auction for it.
- Auction eligibility must exclude sold, deleted, already-auctioned, active-order, multi-quantity, or incomplete artwork records.
- Once an auction is active, seller-editable fields should be locked except explicitly safe lifecycle actions.
- MetaMask transaction submission is pending evidence only; backend/on-chain synchronized state remains the source of truth.
- Backend lifecycle DTOs should expose wallet calldata only while wallet action is still required and no tx hash has been attached.
- Deployment planning must model the existing backend first and avoid inventing target-state topology that contradicts the current service graph.
- Production deployment recommendations should optimize for operational clarity and reliability over preserving every local-development Docker Compose convenience.

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
*Last updated: 2026-04-29 after completing Phase 20 seller auction start lifecycle*
