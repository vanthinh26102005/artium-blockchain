import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  INotificationHistoryRepository,
  NotificationHistory,
} from '../../../domain';
import { GetNotificationHistoryQuery } from '../GetNotificationHistory.query';

@QueryHandler(GetNotificationHistoryQuery)
export class GetNotificationHistoryHandler implements IQueryHandler<
  GetNotificationHistoryQuery,
  NotificationHistory | null
> {
  private readonly logger = new Logger(GetNotificationHistoryHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepository: INotificationHistoryRepository,
  ) {}

  async execute(
    query: GetNotificationHistoryQuery,
  ): Promise<NotificationHistory | null> {
    const { id } = query;
    this.logger.log(
      `Bắt đầu thực thi GetNotificationHistoryQuery cho ID: ${id}`,
    );

    try {
      const history = await this.notificationHistoryRepository.findById(id);

      if (!history) {
        this.logger.warn(`Không tìm thấy NotificationHistory với ID: ${id}`);
        return null;
      }

      this.logger.log(
        `Thực thi thành công, đã tìm thấy NotificationHistory ID: ${id}`,
      );
      return history;
    } catch (error) {
      this.logger.error(
        `Lỗi khi thực thi GetNotificationHistoryQuery cho ID: ${id}`,
        {
          stack: error.stack,
        },
      );

      throw error;
    }
  }
}
