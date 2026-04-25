---
phase: 19
slug: seller-auction-creation-workspace-and-terms-ux
status: complete
created: 2026-04-25
---

# Phase 19 Pattern Map

## Frontend Patterns

| New Area | Closest Existing Analog | Pattern To Follow |
|----------|-------------------------|-------------------|
| Seller auction creation route | `FE/artium-web/src/pages/artist/auctions/create.tsx` | Keep dynamic import, `useRequireAuth`, `Metadata`, and `SidebarLayout`. |
| Seller artwork step | `SellerAuctionArtworkPickerPage.tsx` | Extend existing selected artwork state and eligible/blocked rendering instead of replacing the picker. |
| Auction data loading | `useSellerAuctionArtworkCandidates.ts` | Keep backend-owned eligibility, empty arrays for missing data, `refresh`, `isLoading`, and `error`. |
| Form labels/errors | `QuickSellInvoiceForm.tsx` | Use visible labels, helper text, inline error text, and local field state. Do not reuse invoice copy or item pricing behavior. |
| ETH field behavior | `BidEditingModal.tsx` | Filter clearly invalid number input, but do not copy the 2-decimal bid cap for auction terms. |
| UI primitives | `@shared/components/ui` | Prefer `Button`, `Input`, `Textarea`, `RadioGroup`, `Checkbox`, and `Select`/preset buttons already in the repo. |

## Recommended File Mapping

### Terms Model and Validation

- Create: `FE/artium-web/src/@domains/auction/validations/sellerAuctionTerms.schema.ts`
- Create: `FE/artium-web/src/@domains/auction/utils/sellerAuctionTermsDraft.ts`
- Optional update: `FE/artium-web/src/@domains/auction/utils/index.ts`

### Terms Components

- Create: `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx`
- Create: `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx`
- Update: `FE/artium-web/src/@domains/auction/components/index.ts`

### Workspace Integration

- Update: `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`
- Update: `FE/artium-web/src/pages/artist/auctions/create.tsx`

## Concrete Implementation Notes

### Local Draft Shape

Recommended fields:

```ts
type SellerAuctionTermsDraft = {
  artworkId: string
  reservePolicy: 'none' | 'set'
  reservePriceEth: string
  minBidIncrementEth: string
  durationPreset: '24h' | '3d' | '7d' | 'custom'
  customDurationHours: string
  shippingDisclosure: string
  paymentDisclosure: string
  economicsLockedAcknowledged: boolean
}
```

### Duration Presets

Use exact labels from UI-SPEC:

- `24 hours`
- `3 days`
- `7 days`

If custom duration is included, enforce at least 24 hours and at most 30 days.

### Required Copy Strings

- `Set terms before activation`
- `Minimum bid increment`
- `On the current contract, this also acts as the first-bid floor.`
- `No reserve`
- `Set reserve price`
- `Draft saved on this device.`
- `Auction start connects to wallet and backend orchestration in the next step.`
- `Starts when activated`
- `Sepolia test network`

## Pitfalls To Avoid

- Do not add `sellerId` or client-side eligibility decisions.
- Do not add a backend start API, wallet call, `createAuction`, or `submitAuction` in Phase 19.
- Do not add a future scheduled start field.
- Do not call local draft persistence "server saved" or "synced".
- Do not remove blocked artwork visibility from Phase 18.
- Do not make `Start Auction` look successful or live in Phase 19.

