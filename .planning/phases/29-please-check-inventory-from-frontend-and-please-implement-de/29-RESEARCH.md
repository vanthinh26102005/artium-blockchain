# Phase 29 Research: Inventory Artwork Actions, Profile Visibility, and Auction Handoff

## RESEARCH COMPLETE

## Phase Summary

Phase 29 targets `/inventory` and folder inventory actions for seller-owned artwork:

- Delete artwork.
- Edit artwork.
- Show or hide artwork on profile.
- Check whether inventory can trigger auction start.

The UI contract is already captured in `29-UI-SPEC.md`. The main implementation risk is that the frontend currently exposes some action UI but not a complete backend-backed workflow, while artwork-service update/delete currently drops authenticated user context before command execution.

## Current Flow Observed

Inventory root:

- `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx` loads artworks with `includeSellerAuctionLifecycle: true`.
- Delete exists and calls `artworkApis.deleteArtwork(id)`, then removes the item and refreshes folder counters.
- Edit currently routes to `/artworks/{id}`, which is a public artwork detail route, not an edit workflow.
- Details, move, folders, selection, and toasts already exist.

Inventory folder:

- `InventoryFolderPage.tsx` has a separate delete flow and move flow.
- Edit currently uses `window.alert()`.
- Folder inventory and root inventory have drifted in action behavior.

Inventory cards/lists:

- `InventoryArtworkGridViewItem.tsx`, `InventoryArtworkList.tsx`, and `InventoryArtworkListViewItem.tsx` each define action menus independently.
- Some menu entries are real (`Delete`, `Move`), some are disabled/stubbed (`Duplicate artwork`, `Copy link`, `Change to Draft`, `Show Artwork on Profile`).
- Lifecycle badges already render from `artwork.auctionLifecycle`.

Upload/edit route:

- `/artworks/upload` renders `UploadPage`.
- `UploadPage` supports `draftArtworkId` query hydration.
- Existing Phase 28 backend work treats `draftArtworkId` as an authenticated backend draft ID.
- Editing submitted artwork through this route is only acceptable if the backend draft endpoint can load that artwork. Otherwise, a dedicated edit route must be introduced.

Profile pages:

- `useProfileOverview` loads profile artworks by calling `artworkApis.listArtworksPaginated({ sellerId, take: 24, skip: 0 })`.
- It does not request `isPublished: true` or `status: ACTIVE`.
- `profileApiMapper.ts` maps all returned artworks into `ProfileArtworkCard`.

Auction start:

- Inventory currently does not call `auctionApis.startSellerAuction`, `attachSellerAuctionStartTx`, `retrySellerAuctionStart`, or wallet services.
- Auction start lives in `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`.
- Auction candidate eligibility is loaded through `auctionApis.getSellerArtworkCandidates()`.
- The seller auction page currently owns terms validation, lifecycle status shell, retry, and MetaMask handoff.

Backend mutation risk:

- API gateway `PUT /artwork/:id` and `DELETE /artwork/:id` use `JwtAuthGuard` and pass `req.user`.
- `ArtworkMicroserviceController.updateArtwork` destructures `user` but drops it before creating `UpdateArtworkCommand`.
- `ArtworkMicroserviceController.deleteArtwork` receives `user` but creates `DeleteArtworkCommand(data.id)` only.
- `UpdateArtworkHandler` and `DeleteArtworkHandler` do not verify `existingArtwork.sellerId === user.id`.
- Artwork-service has a local auction lifecycle projection repository that can be used for edit/delete locks.

## Key Gaps

1. Edit action is not an edit action.
   - Root inventory routes to public detail.
   - Folder inventory shows a stub alert.

2. Profile visibility has no implemented inventory action.
   - UI labels exist, but toggling is stubbed/disabled.
   - Profile pages do not filter to public artwork.

3. Action menus are inconsistent.
   - Grid, list, compact list, and folder contexts expose different labels and stub actions.

4. Delete needs better UX state.
   - Delete calls exist but the confirmation modal does not expose an in-flight disabled state.
   - Details panel closure after deleting the visible artwork should be guaranteed.

5. Backend update/delete ownership is insufficient.
   - Auth exists at gateway but command handlers do not enforce owner.
   - Best practice requires service-layer enforcement because RPC messages can be produced by other services.

6. Auction start should remain a handoff.
   - Inventory can offer `Start Auction` or `Resume Auction Setup`, but should not call start-attempt or wallet APIs directly.

## Recommended Target Contract

Backend:

- Add `isPublished?: boolean` to `GetArtworksQueryDto`, common `FindManyArtworkInput`, and artwork-service `FindManyArtworkInput`.
- Ensure `ListArtworksHandler` passes `isPublished` into repository `where`.
- Pass authenticated `UserPayload` into `UpdateArtworkCommand` and `DeleteArtworkCommand`.
- Reject update/delete when `user.id` is missing or does not match `existingArtwork.sellerId`.
- Reject update/delete when local lifecycle projection says the artwork is locked:
  - `pending_start`
  - `auction_active`
  - `retry_available`
  - `start_failed` unless the command is a safe visibility/edit operation and lifecycle `editAllowed === true`.

Frontend:

- Add an inventory action utility/hook shared by root and folder inventory.
- Use one action menu contract across grid/list/folder views.
- Remove browser alerts and disabled stubs for unsupported actions.
- Profile visibility toggle should call `artworkApis.updateArtwork(id, patch)` and update local inventory state from the returned artwork.
- Public profile queries should request `status: 'ACTIVE'` and `isPublished: true`.
- Inventory auction action must navigate to `/artist/auctions/create?artworkId={id}` or resume the seller auction page; it must not call wallet/start RPCs.

## Validation Architecture

Use existing backend Jest infrastructure and frontend static checks.

Backend target tests:

- `BE/apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts`
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts`
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts`

Frontend target checks:

- `cd FE/artium-web && npx eslint src/@domains/inventory src/@domains/profile src/@domains/auction src/@shared/apis/artworkApis.ts src/@shared/apis/auctionApis.ts`
- `cd FE/artium-web && npx tsc --noEmit --pretty false`

Backend target checks:

- `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand`
- `cd BE && yarn build:gateway`
- `cd BE && yarn build:artwork`

## Planning Recommendation

Plan in three waves:

1. Backend owner/lifecycle policy and public visibility filter.
2. Inventory action model and root/folder UI implementation.
3. Profile public filtering, auction handoff wiring, and final verification.
