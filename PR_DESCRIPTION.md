# PR: Resolve Off-chain Checkout Payment Gaps

## Objective

Make the card and wallet checkout flow safe to merge by closing the P1 issues found in the off-chain payment integration.

## Summary

- Requires a private `ETHEREUM_QUOTE_SIGNING_SECRET` instead of signing Ethereum quotes with a public fallback.
- Removes committed Stripe, JWT, and Ethereum secret defaults from `docker-compose.yml`.
- Validates `payment.succeeded` events against order owner, currency, and amount before marking orders paid.
- Moves newly paid off-chain orders into `PROCESSING` so sellers can ship them.
- Avoids regressing already advanced orders when duplicate payment success events are retried.
- Normalizes Ethereum `txHash` values before dedupe, persistence, and confirmation events.
- Preserves wallet orders after MetaMask returns a transaction hash, even if backend recording fails.
- Sends `shippingCost` into order creation so order totals match Stripe charges and Ethereum quotes.
- Fixes wallet login/checkout frontend TypeScript issues caught by production build.

## Verification

```bash
cd BE
yarn nest build orders-service
yarn nest build payments-service
yarn jest apps/payments-service/src/infrastructure/services/ethereum-quote.service.spec.ts --runInBand
yarn eslint --fix apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts apps/orders-service/src/application/event-handlers/payment-event.handler.ts apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts apps/payments-service/src/infrastructure/services/ethereum-quote.service.ts apps/payments-service/src/infrastructure/services/ethereum-quote.service.spec.ts libs/common/src/dtos/orders/create-order.dto.ts

cd ../FE/artium-web
npm install
npm run build
npx eslint src/@domains/auth/views/LoginPage.tsx src/@domains/checkout/hooks/useWalletCheckout.ts src/@domains/checkout/views/BuyerCheckoutPageView.tsx src/@shared/apis/orderApis.ts src/@types/ethereum.d.ts
```

## Notes

`npm run lint` in `FE/artium-web` still fails due to pre-existing repository-wide lint errors in unrelated files. The changed frontend files pass ESLint directly.
