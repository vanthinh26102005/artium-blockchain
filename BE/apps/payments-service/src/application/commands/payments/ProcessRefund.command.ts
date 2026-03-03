import { ProcessRefundDTO } from '../../../domain/dtos';

export class ProcessRefundCommand {
  constructor(public readonly data: ProcessRefundDTO) {}
}
