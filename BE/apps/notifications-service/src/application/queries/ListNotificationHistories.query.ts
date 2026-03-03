import { FindManyOptions } from '@app/common';
import { NotificationHistory } from '../../domain';

export class ListNotificationHistoriesQuery {
  constructor(public readonly options?: FindManyOptions<NotificationHistory>) {}
}
