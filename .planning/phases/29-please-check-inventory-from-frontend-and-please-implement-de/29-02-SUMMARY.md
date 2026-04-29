# Plan 29-02 Summary

## Completed

- Added inventory artwork action helpers for edit locks, profile visibility patching, edit routing, and auction handoff routing.
- Added `isPublished` to the inventory artwork model and API mapper.
- Replaced duplicated grid/list action menus with `InventoryArtworkActionMenu`.
- Removed unimplemented inventory menu stubs for duplicate, copy link, and change-to-draft actions.
- Wired root inventory and folder inventory handlers for edit, delete, move, profile visibility, and auction setup handoff.
- Added deleting state to the shared delete confirmation modal.

## Verification

- `npx eslint` on changed inventory files passed with warnings only.
- Broad `npx eslint src/@domains/inventory src/@shared/apis/artworkApis.ts` currently fails on pre-existing inventory hook lint errors outside the files changed by this plan.
- `rg` confirmed inventory no longer references direct auction-start APIs.
