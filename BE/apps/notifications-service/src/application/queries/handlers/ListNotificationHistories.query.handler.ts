import { Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  INotificationHistoryRepository,
  NotificationHistory,
} from '../../../domain';
import { ListNotificationHistoriesQuery } from '../ListNotificationHistories.query';

@QueryHandler(ListNotificationHistoriesQuery)
export class ListNotificationHistoriesHandler implements IQueryHandler<
  ListNotificationHistoriesQuery,
  NotificationHistory[]
> {
  private readonly logger = new Logger(ListNotificationHistoriesHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepository: INotificationHistoryRepository,
  ) {}

  async execute(
    query: ListNotificationHistoriesQuery,
  ): Promise<NotificationHistory[]> {
    const { options } = query;
    this.logger.log(
      `Bắt đầu thực thi ListNotificationHistoriesQuery với các tùy chọn: ${JSON.stringify(options ?? {})}`,
    );

    try {
      const histories = await this.notificationHistoryRepository.find(options);

      this.logger.log(
        `Thực thi thành công, tìm thấy ${histories.length} bản ghi.`,
      );

      return histories;
    } catch (error) {
      this.logger.error(
        `Lỗi khi thực thi ListNotificationHistoriesQuery: ${error.message}`,
        {
          stack: error.stack,
          options: JSON.stringify(options ?? {}),
        },
      );

      throw error;
    }
  }
}
