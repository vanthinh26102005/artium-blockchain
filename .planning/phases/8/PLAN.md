# Phase 8: Wallet Payment Correctness

## Goal

Close the Phase 8 wallet gap from `.planning/v1.0-MILESTONE-AUDIT.md` so checkout wallet payments:

1. fetch a **live USD→ETH quote** before MetaMask send,
2. run on **Sepolia testnet only** (`chainId = 11155111`) during MetaMask checkout,
3. block wallet checkout with **explicit inline UX** if the quote is unavailable, stale, or the wallet is on the wrong chain,
4. clear stale wallet / tx state across disconnect, retry, account change, chain change, and re-quote flows,
5. record Ethereum payments with **consistent frontend/backend amount semantics** for `PAY-02` and `PAY-03`.

This phase is gap-closure only: plan directly from the roadmap, audit, and live code.

---

## Sepolia Testnet Contract

Phase 8 does not leave the checkout wallet chain configurable in product behavior. For checkout with MetaMask, the allowed network is:

- **Network:** Sepolia testnet
- **Chain ID:** `11155111` (`0xaa36a7`)
- **Explorer:** `https://sepolia.etherscan.io`
- **Currency symbol for wallet send UX:** `ETH` (testnet ETH on Sepolia)

Implementation contract for this phase:

1. The backend quote response must bind every wallet quote to **Sepolia**.
2. The frontend must block wallet checkout on any non-Sepolia chain.
3. The frontend should attempt `wallet_switchEthereumChain` first and fall back to `wallet_addEthereumChain` when MetaMask does not yet know Sepolia.
4. The wallet checkout UI must explicitly communicate that the transfer is occurring on **Sepolia testnet**, not mainnet.
5. No fallback path may silently proceed on another chain.

Recommended config surface:

- `NEXT_PUBLIC_ETH_CHAIN_ID=11155111`
- `NEXT_PUBLIC_ETH_CHAIN_NAME=Sepolia`
- `NEXT_PUBLIC_ETH_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io`
- `NEXT_PUBLIC_PLATFORM_ETH_WALLET=<sepolia test wallet>`
- backend quote/signing config should resolve to the same Sepolia chain contract

---

## Root Cause (confirmed by code audit)

### 1) The current wallet flow sends the USD total as if it were already ETH

In `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`, checkout passes:

```ts
<BuyerCheckoutPaymentForm ethAmount={pricing.total} />
```

and later records:

```ts
await paymentApis.recordEthereumPayment({
  txHash: paymentValues.txHash,
  walletAddress: paymentValues.walletAddress,
  orderId: createdOrder.id,
  amount: pricing.total,
  currency: 'ETH',
})
```

`FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` then converts that `ethAmount` directly to wei:

```ts
const amountInWei = BigInt(Math.floor(ethAmount * 1e18)).toString(16)
```

So the buyer-facing wallet send amount is wrong, and there is no verified quote in the flow at all.

### 2) There is no quote freshness model, so the UI cannot distinguish “ready” from “guessing”

- No quote API exists in `paymentApis.ts`.
- No backend payment quote endpoint exists in `payments.controller.ts`.
- Wallet Pay Now enablement currently depends only on `walletAddress` + `txHash`, not on a live quote.
- There is no inline “quote unavailable / expired” state; the code has no place to block wallet payment for missing quotes.

### 3) Wallet tx state is too local and can go stale

`WalletPaymentSection.tsx` owns `walletAddress`, `txHash`, and retry state locally, but:

- it does not listen for `accountsChanged` / `chainChanged`,
- it does not clear tx state when a quote is refreshed,
- it does not tie `txHash` validity to the quote that produced the send amount,
- it lets old local state be the thing that keeps Pay Now enabled.

That is why disconnect/retry/re-quote behavior is currently unsafe.

### 4) The backend contract cannot currently express the real meaning of a wallet payment cleanly

`POST /payments/ethereum` accepts only:

- `amount`
- `currency`
- `txHash`
- `walletAddress`

But `BE/apps/payments-service/src/domain/entities/payment-transaction.entity.ts` stores:

```ts
@Column({ type: 'decimal', precision: 12, scale: 2 })
amount!: number;

@Column({ type: 'varchar', length: 3, default: 'USD' })
currency!: string;
```

A real ETH amount should not be shoved into a `scale: 2` field. The fix is **not** to keep calling the field `ETH` and hope. For this phase, the canonical recorded `amount/currency` should match the checkout total in **USD**, while the quoted ETH amount/rate/provider/timestamps are stored explicitly in `metadata`.

---

## Plan 8.1 — Add a server-issued ETH quote contract and block wallet pay without it

**Goal:** Introduce one backend-owned quote source and make the frontend consume it before any MetaMask send.

### Files to Create

**1. `BE/apps/payments-service/src/application/queries/payments/GetEthereumQuote.query.ts`**

Plain CQRS query carrying:

```ts
type GetEthereumQuoteInput = {
  usdAmount: number
}
```

**2. `BE/apps/payments-service/src/application/queries/payments/handlers/GetEthereumQuote.query.handler.ts`**

Add a query handler that:

- validates `usdAmount > 0`,
- fetches a live ETH/USD spot price on the **server side**,
- computes a quote object for wallet checkout,
- returns a short-lived quote with explicit expiry,
- throws `RpcExceptionHelper.badRequest` for invalid input and `RpcExceptionHelper.internalError` / `badGateway`-style failure for provider failures.

Use one concrete provider, not an abstraction placeholder:

- **Provider:** Coinbase public spot price endpoint for ETH/USD
- Example upstream call: `https://api.coinbase.com/v2/prices/ETH-USD/spot`

Return a deterministic contract such as:

```ts
type EthereumQuoteResponse = {
  quoteId: string
  quoteToken: string     // opaque server-issued token binding the quote fields below
  usdAmount: number
  fiatCurrency: 'USD'
  cryptoCurrency: 'ETH'
  ethAmount: string        // decimal string, not JS float
  weiHex: string           // exact MetaMask-ready hex value
  usdPerEth: string
  provider: 'coinbase'
  chainId: '11155111'
  chainName: 'Sepolia'
  blockExplorerUrl: string
  quotedAt: string
  expiresAt: string
}
```

The quote response must be **server-verifiable**. Do not trust client-posted quote fields later. The payments-service must mint `quoteToken` (e.g. HMAC-signed payload) that binds:

- `usdAmount`
- `ethAmount`
- `weiHex`
- `usdPerEth`
- `provider`
- `chainId`
- `quotedAt`
- `expiresAt`
- `quoteId`

**3. `BE/apps/payments-service/src/infrastructure/services/ethereum-quote.service.ts`**

Single-purpose service that performs the upstream fetch, exact amount conversion, and quote-token minting. Do **not** convert with `number * 1e18` math. Generate:

- `ethAmount` as a decimal string,
- `weiHex` from exact scaled math,
- `expiresAt` with a short TTL (recommendation: **60 seconds**),
- `quoteToken` using a dedicated signing secret plus the configured target chain ID.

Add an explicit configured wallet chain (for example via env/config) and include it in the quote response so FE send logic and BE recording logic validate the same network.

For this phase, that configured wallet chain must resolve to **Sepolia testnet**. The quote service is allowed to read the values from config/env, but the effective runtime contract must remain `11155111 / Sepolia`.

**4. `BE/apps/payments-service/src/application/queries/payments/handlers/GetEthereumQuote.query.handler.spec.ts`**

Unit test coverage for:

- valid quote generation,
- bad `usdAmount`,
- provider failure path,
- correct expiry window presence,
- exact `weiHex`/`ethAmount` formatting without raw USD passthrough.

**5. `BE/apps/api-gateway/src/presentation/http/controllers/payment/dtos/get-ethereum-quote.dto.ts`**

Swagger/query DTO for `usdAmount`.

### Files to Modify

**6. `BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts`**

Add:

```ts
@MessagePattern({ cmd: 'get_ethereum_quote' })
```

dispatching the new query.

**7. `BE/apps/payments-service/src/app.module.ts`**

Register the new query handler and quote service.

**8. `BE/apps/payments-service/src/application/queries/payments/handlers/index.ts`**

Export the handler through the existing query barrel.

**9. `BE/apps/payments-service/src/application/queries/payments/index.ts`**

Export the new query and re-export its handler so the `./application` barrel can surface it.

**10. `BE/apps/payments-service/src/application/queries/index.ts`**

Re-export the payments query additions from the phase-8 quote path.

**11. `BE/apps/payments-service/src/application/index.ts`**

Re-export the phase-8 query symbols/handlers so `app.module.ts` and the microservice controller can keep importing from `./application` without drift.

**12. `BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts`**

Add authenticated:

```ts
@Get('ethereum/quote')
```

which forwards to `{ cmd: 'get_ethereum_quote' }`.

**13. `FE/artium-web/src/@shared/apis/paymentApis.ts`**

Add:

```ts
export type EthereumQuoteResponse = { ... }
getEthereumQuote(usdAmount: number): Promise<EthereumQuoteResponse>
```

### Required behavior

- Wallet checkout must **never** derive ETH from `pricing.total` in the browser.
- If quote fetch fails, returns malformed data, or is expired, wallet send must stay blocked.
- No fallback is allowed that interprets the USD total as ETH.
- Quote data used later in `POST /payments/ethereum` must be tied to the server-issued `quoteToken`, not to client-supplied decimals alone.

---

## Plan 8.2 — Rewire wallet UI state around quote freshness, disconnect safety, and retry correctness

**Goal:** Make the checkout page own a real wallet quote/tx state machine instead of a loosely-coupled local widget.

### Files to Create

**1. `FE/artium-web/src/@domains/checkout/utils/walletQuote.ts`**

Add pure helpers for:

- quote expiry checks,
- wallet readiness checks,
- state reset rules when quote changes or becomes stale.

Keep this utility pure so `BuyerCheckoutPageView.tsx` and `WalletPaymentSection.tsx` share one source of truth.

**2. `FE/artium-web/src/@domains/checkout/utils/walletQuote.spec.ts`**

Add automated coverage for the pure state-transition helpers (run with the existing monorepo `tsx` dependency from `BE/`):

- quote becomes stale after expiry,
- re-quote clears tx state,
- disconnect/account-change clears wallet readiness,
- wrong-network state blocks wallet readiness,
- retry send clears old tx state before a new attempt.

### Files to Modify

**3. `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`**

Replace the raw `ethAmount={pricing.total}` wiring with page-owned quote state, for example:

```ts
type WalletQuoteState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; quote: EthereumQuoteResponse }
  | { status: 'error'; message: string }
  | { status: 'expired'; quote: EthereumQuoteResponse; message: string }
```

Implementation requirements:

1. Fetch a quote when:
   - the user enters step 2 with `paymentMethod === 'wallet'`,
   - the wallet method is selected,
   - the checkout USD total changes,
   - the user explicitly clicks re-quote.
2. Clear `txHash` immediately when:
   - a new quote replaces the old one,
   - the quote expires,
   - the wallet disconnects,
   - the wallet account changes,
   - the user retries send.
3. Update `isWalletReady` so Pay Now requires **all** of:
   - connected wallet,
   - non-empty `txHash`,
   - quote state is `ready`,
   - quote is still fresh.
4. Guard submit: before `recordEthereumPayment()`, re-check that the quote is still fresh. If not, show inline error and force re-quote instead of recording stale state.
5. Validate network before send/submit. If MetaMask is on the wrong chain for `quote.chainId`, show inline blocking UX, offer a **Switch to Sepolia** action, and do not allow send or Pay Now.
6. Use the quote object for display copy and send `quoteToken` with wallet record payload; do not re-compute ETH client-side from USD.

**4. `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx`**

Change the wallet props from raw `ethAmount?: number` to an explicit quote contract:

```ts
type WalletPaymentProps = {
  walletQuoteState: WalletQuoteState
  onRequestQuoteRefresh: () => void
}
```

Keep RHF ownership of `walletAddress` / `txHash`, but let the page own quote freshness.

**5. `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`**

Rework the section so it is quote-driven:

- show “Fetching live ETH quote…” while loading,
- show explicit inline error + `Retry Quote` CTA if the quote request fails,
- show quoted conversion summary, e.g. `$275.00 → 0.0864 ETH`,
- show that the quote is for **Sepolia testnet**,
- show quote freshness/expiry text,
- show wrong-network inline error / **Switch to Sepolia** guidance when current chain does not match `quote.chainId`,
- disable MetaMask send button unless quote state is `ready`,
- use `quote.weiHex` when calling `eth_sendTransaction`,
- attempt `wallet_switchEthereumChain` with `0xaa36a7` before send when needed,
- fall back to `wallet_addEthereumChain` for Sepolia if MetaMask does not recognize the chain,
- clear tx state before any new send attempt,
- add `accountsChanged` and `chainChanged` listeners to invalidate local + parent wallet state,
- if the quote expires after connection, keep the wallet connected but clear `txHash` and require re-quote before another send.

Inline UX rules:

- Quote unavailable ⇒ wallet section stays visible, but both **Send ETH** and outer **Pay Now** stay disabled.
- Wrong network ⇒ keep the quote visible, but block **Send ETH** and **Pay Now** until the configured chain is active again.
- Wrong network copy must name **Sepolia** explicitly so the user knows the required testnet.
- Re-quote should be explicit and visible.
- Disconnect should clear wallet address, txHash, quote-derived readiness, and section error state.

**6. `FE/artium-web/src/@domains/checkout/validations/buyerCheckout.schema.ts`** (only if needed)

Do **not** add placeholder wallet fields just for future use. Only extend schema if you actually need a machine-managed field that must participate in RHF validation. If not necessary, keep schema focused on `walletAddress` + `txHash` and enforce quote freshness in page state instead.

### Required behavior

- Reject MetaMask without losing the quote.
- Re-quote invalidates the old txHash so stale sends cannot keep Pay Now enabled.
- Disconnect/reconnect and account change flows cannot leave a stale address/hash behind.

---

## Plan 8.3 — Make recorded Ethereum payments semantically correct on the backend

**Goal:** Align what the frontend sends with what the backend stores, without pretending a two-decimal field can faithfully represent ETH fractions.

### Files to Create

**1. `BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.spec.ts`**

Add focused handler tests covering:

- new wallet payload shape is accepted,
- duplicate `txHash` still returns conflict,
- transaction row stores canonical `amount/currency` as checkout USD,
- metadata stores quoted ETH details,
- outbox event still publishes successfully.

### Files to Modify

**2. `FE/artium-web/src/@shared/apis/paymentApis.ts`**

Expand `RecordEthereumPaymentRequest` so the request is explicit instead of ambiguous:

```ts
type RecordEthereumPaymentRequest = {
  txHash: string
  walletAddress: string
  orderId?: string
  amount: number          // canonical checkout total in USD
  currency: 'USD'
  quoteToken: string
  description?: string
}
```

**3. `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`**

Change wallet payment recording to send:

- `amount: pricing.total`
- `currency: 'USD'`
- `quoteToken: walletQuoteState.quote.quoteToken`

Do **not** send `currency: 'ETH'` anymore, and do **not** trust browser-posted quote decimals as authoritative.

**4. `BE/apps/api-gateway/src/presentation/http/controllers/payment/dtos/record-ethereum-payment.dto.ts`**

Update gateway DTO to match the new request shape and Swagger docs.

**5. `BE/apps/payments-service/src/domain/dtos/payment/RecordEthereumPayment.dto.ts`**

Update the service DTO to match the request contract and validate:

- `currency === 'USD'`
- `quoteToken` is present and well-formed

Quote values must come from verified token contents, not client-posted decimal fields.

**6. `BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts`**

Change the handler so it:

1. keeps duplicate `txHash` protection exactly as-is,
2. validates and decodes `quoteToken` server-side (freshness, signature, chain ID, and amount binding),
3. rejects tampered / expired / wrong-chain quote tokens before transaction creation,
4. stores canonical checkout money in:
   - `amount = USD total`
   - `currency = 'USD'`
5. compares `data.amount` to the decoded quote USD amount and rejects mismatches,
6. writes ETH-specific details into existing `metadata` JSONB from the verified quote token, e.g.:

```ts
metadata: {
  quoteId: quote.quoteId,
  cryptoAmount: quote.ethAmount,
  cryptoCurrency: 'ETH',
  usdPerEth: quote.usdPerEth,
  quoteProvider: quote.provider,
  quotedAt: quote.quotedAt,
  expiresAt: quote.expiresAt,
  chainId: quote.chainId,
}
```

7. leaves `provider = ETHEREUM`, `paymentMethodType = CRYPTO_WALLET`, `walletAddress`, and `txHash` unchanged,
8. preserves outbox publication.

The wrong-chain validation here must be strict: only Sepolia quote tokens are valid for checkout wallet recording in this phase.

**Do not change `payment_transactions.amount` precision in this phase.** Use the existing `metadata` column for ETH quote fidelity.

**7. `BE/apps/payments-service/src/domain/events/ethereum-payment-recorded.event.ts`** (only if needed)

Only extend the event payload if downstream consumers actually need the quote metadata. If there are no consumers today, keep the event shape stable and rely on transaction-row metadata for this phase.

### Required behavior

- Frontend and backend must agree that the canonical transaction amount is the checkout USD total.
- ETH quote data must still be preserved for audit/debugging and user-visible display.
- Duplicate `txHash` behavior must remain a `409 Conflict`.
- Backend must not trust quote fields unless they came from a validated server-issued `quoteToken`.
- Wallet payment must be chain-bound; wrong-network sends are blocked.

---

<threat_model>

## Trust boundaries

| Boundary | Risk |
|---|---|
| Browser → API gateway → payments-service | Untrusted client can tamper with wallet payload fields |
| payments-service → external quote provider | Upstream quote can fail, lag, or return malformed price data |
| Wallet UI state → MetaMask send | Stale quote / stale txHash can cause wrong send amount or wrong UI readiness |
| Recorded transaction → user-visible checkout state | USD and ETH values can diverge if semantics are not fixed |

## Threat register

| ID | Threat | Disposition | Mitigation required in this phase |
|---|---|---|---|
| P8-T1 | **Quote freshness**: user sends ETH from an expired quote | mitigate | Quote response includes `quotedAt` + `expiresAt`; FE disables send/pay when stale; re-quote clears txHash |
| P8-T2 | **Quote tampering**: client swaps ETH amount before send or before record | mitigate | Backend owns quote generation; FE uses server quote fields directly; backend validates opaque `quoteToken` instead of trusting client-posted quote decimals |
| P8-T3 | **Replay / stale txHash**: old hash keeps Pay Now enabled after disconnect, account change, or re-quote | mitigate | Clear txHash on disconnect, account change, quote refresh, quote expiry, and retry; keep backend duplicate guard on `txHash` |
| P8-T4 | **User-visible amount mismatch**: MetaMask shows ETH while backend records ambiguous currency | mitigate | Canonical transaction `amount/currency` becomes USD; ETH quote details are stored explicitly in metadata and displayed from the same quote object |
| P8-T5 | **Provider outage** leads to guessed amount | mitigate | If quote fetch fails, show inline wallet error and keep wallet send / Pay Now disabled; never treat raw USD as ETH |
| P8-T6 | **Wrong network send**: user signs the transaction on the wrong chain | mitigate | Quote binds an allowed `chainId`; FE blocks send/pay on chain mismatch and clears tx state when `chainChanged` invalidates the quote |

</threat_model>

---

## Verification Steps

### Automated

1. **Backend quote tests**

```bash
cd BE && yarn test --runInBand \
  apps/payments-service/src/application/queries/payments/handlers/GetEthereumQuote.query.handler.spec.ts \
  apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.spec.ts
```

2. **Backend compile checks**

```bash
cd BE && npx nest build payments-service && yarn build:gateway
```

3. **Frontend wallet state regression tests**

```bash
cd BE && npx tsx --test ../FE/artium-web/src/@domains/checkout/utils/walletQuote.spec.ts
```

4. **Frontend typecheck**

```bash
cd FE/artium-web && npx tsc --noemit
```

5. **Frontend build**

```bash
cd FE/artium-web && npm run build
```

### Manual / executable flow checks

1. Open checkout, select **Crypto Wallet**, and confirm the wallet CTA displays a **live quoted ETH amount** instead of reusing the raw USD total.
2. Force the quote request to fail (disable the backend quote route or upstream network temporarily) and confirm:
   - inline wallet quote error is shown,
   - **Send ETH** is disabled,
   - outer **Pay Now** is disabled,
   - no fallback ETH guess appears.
3. Connect wallet, send a transaction, then click **Refresh Quote** (or wait until expiry) and confirm:
   - the old `txHash` is cleared,
   - Pay Now becomes disabled again,
   - a new transaction must be sent for the new quote.
4. While connected, change MetaMask account or disconnect and confirm wallet address + txHash are cleared in the form and UI.
5. Switch MetaMask to a non-Sepolia chain and confirm:
   - the wallet section shows a chain-mismatch message,
   - the message explicitly names **Sepolia** as the required testnet,
   - a **Switch to Sepolia** action is available,
   - **Send ETH** is disabled,
   - outer **Pay Now** is disabled,
   - switching to Sepolia forces a fresh quote / send cycle before Pay Now can re-enable.
6. Complete a successful wallet payment and verify the request to `POST /payments/ethereum` carries:
   - `amount` as USD total,
   - `currency: 'USD'`,
   - `quoteToken`.
7. Replay the same `txHash` through the API and confirm the backend still returns **409 Conflict**.

---

## Notes

- This phase should stay focused on **wallet amount correctness** and **wallet state correctness** only.
- Do **not** add a fallback that interprets USD as ETH.
- Do **not** move wallet quote logic to the browser only; the authoritative quote must come from the backend.
- Do **not** store real ETH fractions in `payment_transactions.amount`; preserve ETH precision in `metadata` instead.
- Keep the FE UX inline and explicit: missing quote is a blocking state, not a silent downgrade.
- Sepolia is the only allowed MetaMask checkout chain in this phase; mainnet and other testnets are intentionally blocked.
