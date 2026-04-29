# Phase 29 Pattern Map

## Existing Patterns to Reuse

### Gateway authenticated artwork routes

Use `JwtAuthGuard`, `@Request() req: { user: UserPayload }`, and pass `user: req.user` into RPC payloads.

Reference:

- `BE/apps/api-gateway/src/presentation/http/controllers/artwork/artwork.controller.ts`

Relevant pattern:

```ts
@Put(':id')
@UseGuards(JwtAuthGuard)
async updateArtwork(
  @Param('id') id: string,
  @Request() req: { user: UserPayload },
  @Body() data: UpdateArtworkInput,
) {
  return sendRpc<ArtworkObject>(
    this.artworkClient,
    { cmd: 'update_artwork' },
    { id, ...data, user: req.user },
  );
}
```

### Artwork command handler ownership checks

Use `RpcExceptionHelper.forbidden` for cross-owner mutations and `RpcExceptionHelper.conflict` for policy conflicts.

Reference:

- `BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.ts`

Relevant pattern:

```ts
if (artwork.sellerId !== command.sellerId) {
  throw RpcExceptionHelper.conflict(
    'Artwork does not belong to the seller tied to this auction start',
  );
}
```

### Local auction lifecycle projection

Use artwork-service local projection for list enrichment and mutation locks.

Reference:

- `BE/apps/artwork-service/src/domain/interfaces/artwork-auction-lifecycle.repository.interface.ts`
- `BE/apps/artwork-service/src/infrastructure/repositories/artwork-auction-lifecycle.repository.ts`
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.ts`

Current method:

```ts
findBySellerAndArtworkIds(
  sellerId: string,
  artworkIds: string[],
): Promise<SellerAuctionStartStatusObject[]>;
```

Phase 29 can add a narrow `findBySellerAndArtworkId(sellerId, artworkId)` convenience method or call the existing batch method with one ID.

### Inventory root action state

Reference:

- `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx`

Existing delete pattern:

```ts
await artworkApis.deleteArtwork(deletedId)
removeArtwork(deletedId)
setMany(selectedIds.filter((id) => id !== deletedId))
setFolderRefreshToken((token) => token + 1)
setToastMessage('Artwork deleted successfully.')
```

Reuse this pattern but add in-flight state and details-panel cleanup.

### Inventory folder action state

Reference:

- `FE/artium-web/src/@domains/inventory/views/InventoryFolderPage.tsx`

Folder view owns local `folderArtworks`; successful delete filters that array. Phase 29 should share action helpers but preserve folder-local list mutation.

### Frontend API helper standard

Reference:

- `FE/artium-web/src/@shared/apis/artworkApis.ts`
- `FE/artium-web/src/@shared/services/apiClient.ts`

Use `apiFetch`, `withQuery`, and `encodePathSegment`. Do not add raw `fetch`.

### Upload draft route

Reference:

- `FE/artium-web/src/pages/artworks/upload.tsx`
- `FE/artium-web/src/@domains/inventory-upload/views/UploadPage.tsx`

Existing query:

```ts
router.query.draftArtworkId
```

Inventory edit should route to `/artworks/upload?draftArtworkId={id}` only if existing backend draft semantics support the selected artwork ID. If execution discovers this does not load submitted artwork, create a dedicated edit route instead of routing to public detail.

### Seller auction start workspace

Reference:

- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`
- `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts`
- `FE/artium-web/src/@shared/apis/auctionApis.ts`

Inventory must not call:

- `auctionApis.startSellerAuction`
- `auctionApis.attachSellerAuctionStartTx`
- `submitSellerAuctionStartTransaction`

Inventory may navigate to the seller auction workspace with an artwork ID.

## Implementation Notes

- Action menu labels and order should come from one shared component/helper, not repeated local menu definitions.
- `InventoryArtwork` should carry `isPublished?: boolean` so profile visibility is not inferred from `displayStatus` only.
- Profile public filtering should happen at API query level with `status: 'ACTIVE'` and `isPublished: true`.
- Backend owner checks must live in artwork-service command handlers even though the gateway is guarded.
