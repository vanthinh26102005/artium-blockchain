import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ITransactionService } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationHistory,
} from '../../../domain';
import { CreateNotificationHistoryCommand } from '../CreateNotificationHistory.command';

@CommandHandler(CreateNotificationHistoryCommand)
export class CreateNotificationHistoryHandler implements ICommandHandler<
  CreateNotificationHistoryCommand,
  NotificationHistory
> {
  private readonly logger = new Logger(CreateNotificationHistoryHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepository: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(
    command: CreateNotificationHistoryCommand,
  ): Promise<NotificationHistory> {
    this.logger.log(
      `Bắt đầu thực thi CreateNotificationHistoryCommand cho trigger event: ${command.payload.triggerEvent}`,
    );

    return this.transactionService.execute(async (transactionManager) => {
      try {
        // Gọi phương thức create của repository, truyền vào transactionManager
        const newHistory = await this.notificationHistoryRepository.create(
          command.payload,
          transactionManager,
        );

        this.logger.log(
          `Tạo thành công NotificationHistory với ID: ${newHistory.id}`,
        );

        return newHistory;
      } catch (error) {
        this.logger.error(
          `Lỗi khi thực thi CreateNotificationHistoryCommand: ${error.message}`,
          {
            stack: error.stack,
            command: JSON.stringify(command.payload),
          },
        );
        throw error;
      }
    });
  }
}
