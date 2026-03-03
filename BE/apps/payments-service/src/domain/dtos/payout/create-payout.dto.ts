import { PayoutProvider } from '@app/common';

export interface CreatePayoutDTO {
  sellerId: string;
  provider: PayoutProvider;
  amount: number;
  currency: string;
  transactionFee?: number;
  transactionIds: string[];
  description?: string;
  scheduledAt?: Date;
}
