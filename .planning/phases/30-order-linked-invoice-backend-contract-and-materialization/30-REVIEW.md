---
phase: 30-order-linked-invoice-backend-contract-and-materialization
reviewed: 2026-04-30T08:30:04Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts
  - BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts
  - BE/apps/payments-service/src/app.module.ts
  - BE/apps/payments-service/src/application/index.ts
  - BE/apps/payments-service/src/application/queries/invoices/GetOrderInvoice.query.ts
  - BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts
  - BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts
  - BE/apps/payments-service/src/application/queries/invoices/handlers/index.ts
  - BE/apps/payments-service/src/application/queries/invoices/index.ts
  - BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts
  - BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts
  - BE/libs/common/src/dtos/payments/invoices/index.ts
  - BE/libs/common/src/index.ts
  - FE/artium-web/src/@shared/apis/orderApis.ts
findings:
  critical: 2
  warning: 0
  info: 0
  total: 2
status: issues_found
---

# Phase 30: Code Review Report

**Reviewed:** 2026-04-30T08:30:04Z
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

Reviewed the order-linked invoice API gateway route, payments-service materialization query, shared DTO contract, frontend API contract, and new unit coverage. The targeted specs pass, but the implementation exposes buyer-sensitive invoice fields to seller callers and can materialize an invalid buyerless invoice source for seller-accessible orders.

Verification run:

```bash
yarn test apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts --runInBand
```

Result: 2 suites passed, 8 tests passed.

## Critical Issues

### CR-01: BLOCKER - Seller invoice access returns buyer-sensitive fields

**File:** `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts:77`
**Issue:** `getAuthorizedOrder` treats a seller who owns any order item as authorized for `GET /orders/:id/invoice`, but the invoice response is not role-scoped. The payments handler returns the full `shippingAddress`, full `billingAddress`, and raw payment identifiers (`paymentTransactionId`, `paymentIntentId`, `txHash`) at `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts:248` and `:250`. The new controller spec only verifies that a seller receives the invoice (`orders.controller.spec.ts:117`) and does not assert redaction. This exposes buyer billing PII and payment metadata to seller callers.
**Fix:** Make invoice projection viewer-aware. Either restrict this endpoint to the buyer/admin only, or pass viewer context to payments and redact seller responses before returning:

```ts
const viewerRole = order.collectorId === userId ? 'buyer' : 'seller';
const invoice = await sendRpc<OrderInvoiceObject>(this.paymentsClient, pattern, {
  order: this.buildOrderInvoiceSource(order),
  viewer: { userId, role: viewerRole },
});

if (viewerRole === 'seller') {
  return {
    ...invoice,
    billingAddress: null,
    payment: {
      paymentStatus: invoice.payment.paymentStatus,
      paymentMethod: invoice.payment.paymentMethod,
      paymentTransactionId: null,
      paymentIntentId: null,
      txHash: null,
      onChainOrderId: invoice.payment.onChainOrderId,
    },
    items: invoice.items.filter((item) => item.sellerId === userId),
  };
}
```

Add tests for seller redaction and for a seller who owns only one item in a multi-item order.

### CR-02: BLOCKER - Buyerless seller orders produce invalid invoice materialization data

**File:** `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts:93`
**Issue:** `buildOrderInvoiceSource` converts a missing `collectorId` to an empty string. Sellers are authorized when any item belongs to them (`orders.controller.ts:78`), and the order model allows `collectorId` to be null. When such an order reaches payments, the handler persists `collectorId: sourceOrder.collectorId` into the invoice at `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts:110`; the invoice column is a nullable UUID, so `''` is invalid and the endpoint returns a persistence error instead of a controlled API response. This can happen for seller-visible orders before a buyer exists or before the buyer is attached.
**Fix:** Preserve nullability and reject non-invoiceable orders before calling payments, or allow `collectorId` to be nullable end-to-end and skip materialization until a buyer exists:

```ts
if (!order.collectorId) {
  throw new NotFoundException('Order invoice not found');
}

return {
  id: order.id,
  orderNumber: order.orderNumber,
  collectorId: order.collectorId,
  // ...
};
```

Also update `OrderInvoiceSourceOrderDto.collectorId` only if invoices are valid without a buyer; otherwise keep it required and add gateway/payments tests for `collectorId: null`.

---

_Reviewed: 2026-04-30T08:30:04Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
