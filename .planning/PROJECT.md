# Project: Artium Blockchain Marketplace

## What This Is

Artium is an artwork marketplace with seller inventory management, buyer checkout, private order tracking, and blockchain-backed auction flows on Sepolia. The current auction surface supports public auction browsing and buyer bidding; the next milestone closes the missing seller-side workflow for starting auctions from owned inventory.

## Core Value

Let artists and sellers run trustworthy auctions without bypassing ownership, eligibility, wallet, or lifecycle policy checks.

## Current Milestone: v1.1 Seller Auction Creation

**Goal:** Sellers can pick an eligible artwork they own, configure compliant auction terms, and start a Sepolia-backed auction through an authenticated seller-only workflow.

**Target features:**
- Seller-only auction creation route guarded in frontend and backend.
- Own-inventory artwork picker with eligibility rules before auction setup.
- Auction terms form for starting bid, reserve policy, bid increment, duration, and shipping/payment disclosures.
- Backend auction start command that validates ownership, seller profile, artwork state, wallet/network policy, and idempotent on-chain/off-chain creation.
- Seller auction status surface for pending, active, failed, and conflict/retry states.

## Current State

- Phase 18 complete: seller-only auction access and own-inventory eligibility are implemented through backend guards, server-owned reason codes, active order lock merging, and `/artist/auctions/create`.
- Next: Phase 19 should build auction terms configuration and preview on top of the eligible artwork picker without duplicating eligibility policy in React.

## Active Requirements

- Seller auction creation and governance requirements live in `.planning/REQUIREMENTS.md` under `v1.1 Requirements`.

## Key Decisions

- Seller auction creation must be server-authorized; frontend route guards are convenience only.
- Only the seller who owns the artwork can start an auction for it.
- Auction eligibility must exclude sold, deleted, already-auctioned, active-order, multi-quantity, or incomplete artwork records.
- Once an auction is active, seller-editable fields should be locked except explicitly safe lifecycle actions.
- MetaMask transaction submission is pending evidence only; backend/on-chain synchronized state remains the source of truth.

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
*Last updated: 2026-04-25 for Phase 18 completion*
