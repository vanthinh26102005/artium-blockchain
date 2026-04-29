# Plan 29-01 Summary

## Completed

- Added `isPublished` support to artwork list query DTOs and service inputs.
- Passed active/published filters through the artwork list query handler.
- Added owner and lifecycle policy checks to update and delete artwork commands.
- Added lifecycle repository lookup by seller and artwork.
- Passed authenticated user context through artwork update/delete RPC handlers.
- Added targeted command/query specs for published filtering and mutation locks.

## Verification

- `cd BE && npx jest apps/artwork-service/src/application/commands/artworks/handlers/UpdateArtwork.command.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/DeleteArtwork.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand` passed.
- `cd BE && yarn build:gateway` passed.
- `cd BE && yarn build:artwork` passed.

## Notes

- Auction lifecycle enrichment remains best-effort for list queries when the lifecycle table is unavailable; mutation policy checks still fail closed for locked lifecycle states when the snapshot exists.
