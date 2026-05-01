# Project: Artium Blockchain Marketplace

## What This Is

Artium is an artwork marketplace with seller inventory management, buyer checkout, private order tracking, creator profile storytelling, and blockchain-backed auction flows on Sepolia. The profile surface supports public artwork, moment, and moodboard browsing, and the next milestone focuses on making profile media creation use device uploads instead of pasted media links.

## Core Value

Let artists and sellers present, sell, and manage artwork through trustworthy flows that preserve ownership, media, order, and lifecycle truth.

## Current Milestone: v1.4 Profile Moment and Moodboard Device Uploads

**Goal:** Let authenticated profile owners create moments and moodboards by uploading media from their device, with the UI aligned to the polished Orders workspace interaction patterns and backend media handling kept authoritative.

**Target features:**
- Backend media upload contract for profile community content that accepts device files and returns stored media metadata for moments and moodboards without relying on pasted external URLs.
- Moment creation flow where a profile owner uploads exactly one image or one video from their device, then creates the moment from the stored media URL, media type, optional thumbnail/poster, caption, and metadata.
- Moodboard creation flow where a profile owner uploads multiple media items from their device, allowing images, moodboard/media references, or both where the existing data model can support it, with a stable cover selection.
- Profile composer UI integrated into the existing profile pages and visually aligned with Orders workspace patterns: calm cards, clear states, accessible controls, loading/error/retry behavior, and responsive layouts.
- Verification evidence across backend upload validation, community DTO mapping, frontend upload/composer behavior, responsive UI, and TypeScript/lint/build checks.

## Current State

- The profile domain lives under `FE/artium-web/src/@domains/profile` and currently renders profile pages, moments, moment detail, moodboards, and owner edit/delete affordances.
- `FE/artium-web/src/@shared/apis/profileApis.ts` currently creates moments and moodboards from URL fields (`mediaUrl`, `thumbnailUrl`, `coverImageUrl`) rather than device files.
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts`, `FE/artium-web/src/@shared/hooks/useArtworkUpload.ts`, and `FE/artium-web/src/@shared/services/apiClient.ts` already provide multipart upload patterns for artwork images and avatars that can guide profile media upload work.
- The backend community gateway currently validates moment and moodboard creation with URL fields in `BE/apps/api-gateway/src/presentation/http/controllers/community/moments.controller.ts` and `moodboards.controller.ts`; no profile community media upload endpoint exists yet.
- The Orders workspace under `FE/artium-web/src/@domains/orders` provides the target UI quality reference: structured white cards, segmented controls, status chips, focus rings, empty/loading/error states, and responsive detail panels.

## Active Requirements

- PMED-01 through PMED-11 are active for the v1.4 profile moment and moodboard device upload milestone.

## Validated Requirements

- Validated in Phase 31: OINV-04, OINV-05, OINV-06, OINV-07, and OINV-08 for Orders invoice actions, responsive preview, loading/unavailable/retry states, browser print extraction, and backend DTO-derived financial truth.

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
- Profile moment and moodboard creation must upload media from the user's device; pasted media links are not part of the v1.4 creation UX.
- A moment accepts exactly one uploaded media asset: either one image or one video.
- A moodboard accepts multiple uploaded media assets and may combine image media with existing moodboard/media references only where the backend model can represent them cleanly.
- Profile media composer UI should borrow interaction quality from the Orders workspace: contained white surfaces, clear status feedback, accessible actions, and responsive layouts, without introducing a separate visual system.

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
*Last updated: 2026-05-01 after starting v1.4 Profile Moment and Moodboard Device Uploads*
