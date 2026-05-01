# P1 Security Fixes - Implementation Summary

**Date**: 2026-04-27
**Branch**: feat/offchain-gaps-resolved
**Status**: implemented and build-verified

This document summarizes the critical fixes applied to the off-chain checkout and wallet payment flow.

## Fixes Implemented

### 1. Require ETHEREUM_QUOTE_SIGNING_SECRET

**Location**: `apps/payments-service/src/infrastructure/services/ethereum-quote.service.ts`

The Ethereum quote service no longer signs quote tokens with a public fallback secret. It resolves `ETHEREUM_QUOTE_SIGNING_SECRET` during service construction and fails startup when the secret is missing.

### 2. Validate Payment Events Before Marking Orders Paid

**Location**: `apps/orders-service/src/application/event-handlers/payment-event.handler.ts`

The order payment event handler now validates the successful payment event against the order before updating it:

- provider is present
- event `userId` matches the order collector
- event currency matches the order currency
- event amount matches the order total
- an existing `paymentTransactionId`, if present, must match the event transaction

The handler still allows the first successful payment event to populate `paymentTransactionId` when the order does not have one yet.

### 3. Keep Paid Orders Shippable Without Regressing Terminal States

**Location**: `apps/orders-service/src/application/event-handlers/payment-event.handler.ts`

Successful off-chain payments now move only `PENDING` or `CONFIRMED` orders to `PROCESSING`, which matches the seller shipping flow. Duplicate payment events no longer move already shipped, delivered, cancelled, or otherwise advanced orders back to `PROCESSING`.

### 4. Preserve Wallet Orders After On-chain Transfer

**Location**: `../FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`

Wallet checkout now tracks the submitted transaction hash in a local variable inside the same submit call. If payment recording fails after MetaMask returns a hash, the UI keeps the order open and shows the hash for manual recovery instead of cancelling an order after funds have already been sent.

### 5. Normalize Ethereum Transaction Hashes

**Location**: `apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts`

Ethereum transaction hashes are normalized to lowercase before duplicate lookup, persistence, and emitted confirmation events. This prevents duplicate records for the same on-chain transfer with different casing.

### 6. Remove Committed Secret Defaults

**Location**: `docker-compose.yml`

Docker Compose no longer contains hardcoded default secrets for JWT, Stripe, or Ethereum wallet configuration. Required secrets now use Compose required-variable syntax, and optional Google OAuth variables default to empty values.

### 7. Carry Shipping Cost Into Order Totals

**Locations**:

- `libs/common/src/dtos/orders/create-order.dto.ts`
- `apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts`
- `../FE/artium-web/src/@shared/apis/orderApis.ts`
- `../FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`

Checkout now sends `shippingCost` when creating an order, and the orders service persists `totalAmount = subtotal + shippingCost`. This keeps Stripe card amounts, Ethereum quote amounts, and order payment validation aligned.

### 8. Fix Wallet Frontend TypeScript Integration

**Locations**:

- `../FE/artium-web/src/@domains/auth/views/LoginPage.tsx`
- `../FE/artium-web/src/@domains/checkout/hooks/useWalletCheckout.ts`
- `../FE/artium-web/src/@types/ethereum.d.ts`

The login page imports and initializes the wallet login dialog state, the wallet checkout hook handles optional provider event methods safely, and the global Ethereum provider type accepts object-shaped request params.

## Verification

- `yarn nest build orders-service`
- `yarn nest build payments-service`
- `yarn jest apps/payments-service/src/infrastructure/services/ethereum-quote.service.spec.ts --runInBand`
- `npm run build` in `FE/artium-web`
- `npx eslint` on changed frontend files
- `yarn eslint --fix` on changed backend files

Known repository-wide issue: `npm run lint` in `FE/artium-web` still fails on pre-existing lint errors across unrelated files.
