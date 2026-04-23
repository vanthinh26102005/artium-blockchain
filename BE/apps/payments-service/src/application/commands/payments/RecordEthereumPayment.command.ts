import { RecordEthereumPaymentDTO } from '../../../domain/dtos/payment';

export class RecordEthereumPaymentCommand {
  constructor(public readonly data: RecordEthereumPaymentDTO) {}
}
