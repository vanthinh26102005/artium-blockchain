# Phase 18.1 Plan: Seller Registration and Role Activation Gap Closure

**Goal:** Close the access gap between profile settings and seller-only auction creation by implementing validated seller registration and server-side seller role activation.

**Requirements:** SAUC-10
**Depends on:** Phase 18
**Status:** completed

## Tasks

- [x] Inspect profile edit page and confirm the existing seller CTA target.
- [x] Add protected `/seller/register` frontend route.
- [x] Add seller registration form validation for profile URL, seller display name, seller type, bio, location, and website URL.
- [x] Reuse existing `profileApis.createSellerProfile`, `getSellerProfileByUserId`, and `usersApi.updateMe` contracts instead of introducing duplicate profile APIs.
- [x] Update backend create-seller-profile command to add `UserRole.SELLER` in the same transaction as seller profile creation.
- [x] Keep seller verification and payment onboarding disabled by default.
- [x] Handle duplicate seller registration by surfacing the existing seller profile path.

## Verification Checklist

- [x] Run targeted frontend lint on new seller route/view/schema and touched profile API/page files.
- [x] Run backend identity build or targeted TypeScript check for identity-service changes.
- [x] Confirm `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md` include SAUC-10 and Phase 18.1 traceability.
