# Phase 28 Pattern Map

## Existing Patterns to Reuse

### Gateway authenticated controller pattern

Use `JwtAuthGuard` and pass `req.user` into RPC payloads.

Reference:
- `BE/apps/api-gateway/src/presentation/http/controllers/artwork/artwork.controller.ts`

Relevant pattern:
```ts
@Post()
@UseGuards(JwtAuthGuard)
async createArtwork(
  @Request() req: { user: UserPayload },
  @Body() data: CreateArtworkInput,
) {
  return sendRpc<ArtworkObject>(
    this.artworkClient,
    { cmd: 'create_artwork' },
    { ...data, user: req.user },
  );
}
```

### Artwork CQRS command handler pattern

Use `CommandHandler`, injected repository interfaces, and `RpcExceptionHelper` for domain errors.

Reference:
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.ts`
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.ts`

### Add-images mapping pattern

Reference:
- `BE/apps/artwork-service/src/application/commands/artworks/handlers/AddImagesToArtwork.command.handler.ts`

Existing logic maps `ArtworkImageInput` into stored `ArtworkImage` JSON records. Phase 28 should reuse this mapping but add owner/draft checks before mutation.

### Shared frontend API helper pattern from Phase 27

Reference:
- `FE/artium-web/src/@shared/services/apiClient.ts`
- `FE/artium-web/src/@shared/apis/artworkApis.ts`
- `FE/artium-web/src/@shared/apis/artworkUploadApi.ts`

Use:
- `apiFetch`
- `apiUpload`
- `encodePathSegment`
- `withQuery`

Do not add raw `fetch`, duplicated query builders, or local auth header construction in API modules.

### Upload store hydration pattern

Reference:
- `FE/artium-web/src/@domains/inventory-upload/stores/useUploadArtworkStore.ts`

Existing store has `hydrateFromQuery(draftId)` but no backend state loader. Phase 28 should add explicit draft-loading actions rather than overloading query hydration.

## Implementation Notes

- The route parameter `draftArtworkId` should be treated as a backend artwork draft ID, not only a local key.
- Backend owner enforcement should derive seller identity from `req.user.id`.
- Frontend should not pass authenticated seller identity as mutable form data.
- Uploads should not use `temp-${Date.now()}` IDs after the backend draft is loaded.
- Existing `Artwork` entity can represent draft rows via `status: DRAFT`; avoid a new table in this phase.
