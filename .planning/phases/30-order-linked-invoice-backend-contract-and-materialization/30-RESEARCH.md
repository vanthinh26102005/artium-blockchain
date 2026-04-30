# Phase 30 Research: Order-linked invoice backend contract and materialization

## RESEARCH COMPLETE

## Phase Scope

Phase 30 must expose order invoice data from the backend, not from frontend reconstruction. The phase covers OINV-01 through OINV-03:

- Only authorized buyers or sellers can request invoice data for an order.
- Backend returns an order-linked invoice read model with order, invoice, item, payment, party, address, and total fields needed by the Phase 31 UI.
- Missing invoices are materialized idempotently from canonical order/payment data using the existing payments-service invoice persistence.

## Current Backend Reality

### Orders access control

- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` already has `getAuthorizedOrder(id, userId)`.
- It loads the order through `{ cmd: 'get_order_by_id' }`, then authorizes when `order.collectorId === userId` or `order.items.some(item.sellerId === userId)`.
- Unauthorized users receive `NotFoundException('Order not found')`, which is the correct non-disclosing behavior to reuse for invoice reads.
- Orders-service `GetOrderByIdHandler` uses `orderRepo.findWithItems(orderId)`, so the gateway receives `items`.

### Invoice persistence

- `BE/apps/payments-service/src/domain/entities/invoices.entity.ts` already has `orderId`, `paymentTransactionId`, `invoiceNumber`, `status`, `subtotal`, `taxAmount`, `discountAmount`, `totalAmount`, `currency`, dates, notes, and `items`.
- `BE/apps/payments-service/src/domain/entities/invoice_items.entity.ts` stores artwork ID/title/image, description, quantity, unit price, line total, tax, discount, and notes.
- `IInvoiceRepository` and `InvoiceRepository` already expose `findByOrderId(orderId)`.
- Existing `CreateInvoiceHandler` and `SaveInvoiceHandler` calculate totals and create items, but neither is built for order invoice materialization from a gateway-supplied order snapshot.

### Payment links

- `PaymentTransaction` has `orderId`, `invoiceId`, `sellerId`, `userId`, provider, status, amount, currency, Stripe/ETH identifiers, and tx hash.
- `PaymentTransactionRepository` has `findByOrderId(orderId)` and `findByInvoiceId(invoiceId)`.
- Orders-service updates orders from payment success events and stores `paymentTransactionId`, `paymentMethod`, `paymentStatus`, `paymentIntentId`, and `txHash`.

## Recommended Architecture

### Endpoint

Add `GET /orders/:id/invoice` to the API gateway.

Flow:

1. `OrdersController.getOrderInvoice(@Param('id') id, @Req() req)`.
2. Call existing `getAuthorizedOrder(id, req.user?.id)`.
3. Build a sanitized order invoice source DTO from the authorized order.
4. Send it to payments-service with `{ cmd: 'get_or_materialize_order_invoice' }`.
5. Return a shared `OrderInvoiceObject` DTO.

Authorization stays in the gateway because it already has the `/orders` policy and can hide unauthorized orders as 404.

### Payments-service materialization

Add `GetOrderInvoiceQuery` and `GetOrderInvoiceHandler` in payments-service:

1. Look up invoice by `orderId`.
2. If found, map the invoice plus matching payment transaction data into `OrderInvoiceObject`.
3. If missing, create one from the supplied order snapshot inside `ITransactionService.execute`.
4. Re-read by ID and return the mapped object.

Stable identity:

- Use `invoiceNumber = INV-${order.orderNumber}`.
- Use `issueDate = order.createdAt`.
- Use `paidAt = order.confirmedAt` only when `paymentStatus === 'paid'`.
- Use `status = PAID` when `paymentStatus === 'paid'`, otherwise `SENT`.
- Use `paymentTransactionId = order.paymentTransactionId`.
- Create invoice items directly from `order.items`.

Idempotency:

- First lookup by `orderId`.
- Use the existing unique `invoice_number` column with deterministic `INV-${order.orderNumber}`.
- If invoice creation races and hits a duplicate invoice number, re-read by `orderId`, then by deterministic `invoiceNumber`, and return the existing invoice when found.
- Do not add a schema change for this phase; repeated materialization can be stable through existing unique invoice numbers.

### DTO location

Use `BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts` and export it from `BE/libs/common/src/dtos/payments/invoices/index.ts`.

Required DTOs:

- `OrderInvoicePartyObject`
- `OrderInvoiceAddressObject`
- `OrderInvoicePaymentObject`
- `OrderInvoiceItemObject`
- `OrderInvoiceObject`
- `OrderInvoiceSourceOrderDto`
- `OrderInvoiceSourceItemDto`

The source DTO should include only fields needed by payments-service:

- order identity/status/totals/dates
- buyer/collector ID
- order item seller IDs and line values
- shipping/billing addresses
- payment identifiers

## Existing Patterns to Reuse

- Gateway RPC: `sendRpc(this.ordersClient, { cmd: '...' }, payload)` and `sendRpc(this.paymentsClient, { cmd: '...' }, payload)`.
- Gateway auth: `@UseGuards(JwtAuthGuard)` plus `@ApiBearerAuth()`.
- Payments CQRS: query class under `application/queries/invoices`, handler under `handlers`, export from `application/index.ts`, register in `QueryHandlers`, expose via `PaymentsMicroserviceController`.
- Repository patterns: keep `transactionManager?: EntityManager` optional on specialized repository methods.
- Tests: use existing Jest config with `cd BE && npx jest path/to/spec.ts --runInBand`.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cross-user invoice leak | Only the gateway endpoint should call materialization after `getAuthorizedOrder`. Payments-service should not expose public order invoice reads by arbitrary user ID. |
| Duplicate invoice rows | Look up by `orderId` first, add unique partial index, re-read on duplicate create conflict. |
| Client-only financial truth | Frontend will consume backend DTO in Phase 31; Phase 30 DTO must include all totals and line values. |
| Multi-seller orders | Existing order model has one `sellerId` on create but items contain seller IDs. Phase 30 should preserve item `sellerId` and derive seller display IDs; Phase 31 can improve presentation later. |
| Payment status mismatch | Map invoice status from persisted order `paymentStatus` and include payment transaction identifiers for UI transparency. |

## Validation Architecture

Framework: Jest through the existing BE Jest config.

Focused automated checks:

- `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts --runInBand`
- `cd BE && npx jest apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand`
- `cd BE && npx nest build payments-service`
- `cd BE && yarn build:orders`
- `cd BE && yarn build:gateway`

Structural checks:

- `rg -n "get_or_materialize_order_invoice|GetOrderInvoiceQuery|OrderInvoiceObject|INV-\\$\\{sourceOrder.orderNumber\\}" BE/apps BE/libs/common/src/dtos/payments/invoices`
- `rg -n "get_or_materialize_order_invoice|GetOrderInvoiceQuery|OrderInvoiceObject|INV-\\$\\{sourceOrder.orderNumber\\}" BE/apps BE/libs/common/src/dtos/payments/invoices`
- `rg -n "Get\\(':id/invoice'\\)|getAuthorizedOrder\\(id, req.user\\?\\.id\\)|paymentsClient" BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts`

Manual checks are not required for Phase 30 because the UI is deferred to Phase 31.
