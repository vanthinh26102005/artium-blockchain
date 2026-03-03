import { CreateNotificationHistoryInput } from '../../domain';

export class CreateNotificationHistoryCommand {
  constructor(public readonly payload: CreateNotificationHistoryInput) {}
}
