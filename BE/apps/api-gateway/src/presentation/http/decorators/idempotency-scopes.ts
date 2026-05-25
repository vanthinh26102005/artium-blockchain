type NestedValueOf<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? NestedValueOf<T[keyof T]>
    : never;

export const IdempotencyScopes = {
  Orders: {
    Create: 'orders.create',
  },
  Payments: {
    StripePaymentIntentCreate: 'payments.stripe.payment_intent.create',
    StripeRefundCreate: 'payments.stripe.refund.create',
    InvoiceCreate: 'payments.invoice.create',
    PayoutCreate: 'payments.payout.create',
  },
  QuickSell: {
    InvoiceCreate: 'quick_sell.invoice.create',
    PaymentIntentCreate: 'quick_sell.payment_intent.create',
  },
} as const;

export type IdempotencyScope = NestedValueOf<typeof IdempotencyScopes>;

export interface IdempotencyPolicy {
  scope: IdempotencyScope;
  required: boolean;
  route: string;
  reason: string;
  ttlSeconds?: number;
  pendingTtlSeconds?: number;
}

const REQUIRED_MUTATION_TTL_SECONDS = 24 * 60 * 60;
const REQUIRED_MUTATION_PENDING_TTL_SECONDS = 60;

const requiredMutation = (
  scope: IdempotencyScope,
  route: string,
  reason: string,
): IdempotencyPolicy => ({
  scope,
  required: true,
  route,
  reason,
  ttlSeconds: REQUIRED_MUTATION_TTL_SECONDS,
  pendingTtlSeconds: REQUIRED_MUTATION_PENDING_TTL_SECONDS,
});

export const IdempotencyPolicies = {
  CreateOrder: requiredMutation(
    IdempotencyScopes.Orders.Create,
    'POST /orders',
    'Retries can create duplicate orders because order creation generates a new order number and persists order items.',
  ),
  CreateStripePaymentIntent: requiredMutation(
    IdempotencyScopes.Payments.StripePaymentIntentCreate,
    'POST /payments/stripe/payment-intent',
    'Retries can create duplicate Stripe payment intents and duplicate local payment transactions.',
  ),
  CreateStripeRefund: requiredMutation(
    IdempotencyScopes.Payments.StripeRefundCreate,
    'POST /payments/stripe/refunds',
    'Retries can create duplicate refunds against the same payment transaction.',
  ),
  CreateInvoice: requiredMutation(
    IdempotencyScopes.Payments.InvoiceCreate,
    'POST /payments/invoices',
    'Retries can create duplicate invoices.',
  ),
  CreatePayout: requiredMutation(
    IdempotencyScopes.Payments.PayoutCreate,
    'POST /payments/payouts',
    'Retries can create duplicate payout requests.',
  ),
  CreateQuickSellInvoice: requiredMutation(
    IdempotencyScopes.QuickSell.InvoiceCreate,
    'POST /store/sale/invoice',
    'Retries can create duplicate quick-sell invoices and send the seller through a confusing recovery path.',
  ),
  CreateQuickSellPaymentIntent: requiredMutation(
    IdempotencyScopes.QuickSell.PaymentIntentCreate,
    'POST /store/sale/invoice/code/:invoiceCode/payment-intent',
    'Retries can create duplicate invoice payment intents and duplicate local payment transactions.',
  ),
} as const satisfies Record<string, IdempotencyPolicy>;
