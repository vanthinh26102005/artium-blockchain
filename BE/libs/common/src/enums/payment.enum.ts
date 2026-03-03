import { registerEnumType } from '@nestjs/graphql';

/**
 * Transaction operation type
 * Used in: PaymentTransaction.type
 */
export enum TransactionType {
  /** Customer payment for order */
  PAYMENT = 'PAYMENT',
  /** Refund to customer */
  REFUND = 'REFUND',
  /** Payout to seller */
  PAYOUT = 'PAYOUT',
}

/**
 * Payment transaction lifecycle status
 * Used in: PaymentTransaction.status
 */
export enum TransactionStatus {
  /** Transaction created, awaiting processing */
  PENDING = 'PENDING',
  /** Transaction being processed */
  PROCESSING = 'PROCESSING',
  /** Transaction completed successfully */
  SUCCEEDED = 'SUCCEEDED',
  /** Transaction failed */
  FAILED = 'FAILED',
  /** Transaction cancelled */
  CANCELLED = 'CANCELLED',
  /** Transaction fully refunded */
  REFUNDED = 'REFUNDED',
  /** Transaction partially refunded */
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

/**
 * Payment service provider
 * Used in: PaymentTransaction.provider, PaymentMethod.provider
 */
export enum PaymentProvider {
  /** Stripe payment gateway */
  STRIPE = 'STRIPE',
  /** PayPal payment gateway */
  PAYPAL = 'PAYPAL',
}

/**
 * Payment method type
 * Used in: PaymentMethod.type
 */
export enum PaymentMethodType {
  /** Credit/debit card */
  CARD = 'CARD',
  /** Bank account (ACH, SEPA) */
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  /** PayPal account */
  PAYPAL_ACCOUNT = 'PAYPAL_ACCOUNT',
}

/**
 * Payout processing status
 * Used in: Payout.status
 */
export enum PayoutStatus {
  /** Payout scheduled, not yet processed */
  PENDING = 'PENDING',
  /** Payout being processed */
  PROCESSING = 'PROCESSING',
  /** Payout completed */
  PAID = 'PAID',
  /** Payout failed */
  FAILED = 'FAILED',
  /** Payout cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Payout service provider
 * Used in: Payout.provider
 */
export enum PayoutProvider {
  /** Stripe Connect payout */
  STRIPE = 'STRIPE',
  /** PayPal payout */
  PAYPAL = 'PAYPAL',
}

// GraphQL type registrations
registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Payment transaction type (PAYMENT, REFUND, PAYOUT)',
});

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
  description: 'Payment transaction lifecycle status',
});

registerEnumType(PaymentProvider, {
  name: 'PaymentProvider',
  description: 'Payment service provider (STRIPE, PAYPAL)',
});

registerEnumType(PaymentMethodType, {
  name: 'PaymentMethodType',
  description: 'Payment method type (CARD, BANK_ACCOUNT, PAYPAL_ACCOUNT)',
});

registerEnumType(PayoutStatus, {
  name: 'PayoutStatus',
  description: 'Payout processing status',
});

registerEnumType(PayoutProvider, {
  name: 'PayoutProvider',
  description: 'Payout service provider (STRIPE, PAYPAL)',
});
