import {
  TransactionType,
  PaymentProvider,
  PaymentMethodType,
} from '@app/common';

export interface CreatePaymentDTO {
  type: TransactionType;
  provider: PaymentProvider;
  userId: string;
  sellerId?: string;
  orderId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  platformFee?: number;
  paymentMethodId?: string;
  paymentMethodType?: PaymentMethodType;
  description?: string;
  metadata?: Record<string, any>;
}
