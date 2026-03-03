import { UpdateNotificationHistoryInput } from '../../domain';

export class UpdateNotificationHistoryCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateNotificationHistoryInput,
  ) {}
}
