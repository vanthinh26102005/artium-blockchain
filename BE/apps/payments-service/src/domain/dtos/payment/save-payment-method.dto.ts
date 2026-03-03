import { PaymentProvider, PaymentMethodType } from '@app/common';

export interface CreatePaymentMethodDTO {
  userId: string;
  provider: PaymentProvider;
  type: PaymentMethodType;
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  billingName: string;
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  billingEmail?: string;
  stripePaymentMethodId?: string;
  paypalPaymentMethodId?: string;
  isDefault?: boolean;
}
