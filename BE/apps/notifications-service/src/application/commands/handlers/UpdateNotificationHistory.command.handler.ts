import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RpcException } from '@nestjs/microservices';
import { ITransactionService, RpcExceptionHelper } from '@app/common';
import {
  INotificationHistoryRepository,
  NotificationHistory,
} from '../../../domain';
import { UpdateNotificationHistoryCommand } from '../UpdateNotificationHistory.command';

@CommandHandler(UpdateNotificationHistoryCommand)
export class UpdateNotificationHistoryHandler implements ICommandHandler<
  UpdateNotificationHistoryCommand,
  NotificationHistory
> {
  private readonly logger = new Logger(UpdateNotificationHistoryHandler.name);

  constructor(
    @Inject(INotificationHistoryRepository)
    private readonly notificationHistoryRepository: INotificationHistoryRepository,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(
    command: UpdateNotificationHistoryCommand,
  ): Promise<NotificationHistory> {
    const { id, payload } = command;
    this.logger.log(`Bắt đầu cập nhật NotificationHistory ID: ${id}`);

    return this.transactionService.execute(async (transactionManager) => {
      try {
        const updatedHistory = await this.notificationHistoryRepository.update(
          id,
          payload,
          transactionManager,
        );

        if (!updatedHistory) {
          throw RpcExceptionHelper.notFound(
            `Không tìm thấy NotificationHistory với ID: ${id} để cập nhật.`,
          );
        }

        this.logger.log(`Cập nhật thành công NotificationHistory ID: ${id}`);

        return updatedHistory;
      } catch (error) {
        if (!(error instanceof RpcException)) {
          this.logger.error(
            `Lỗi khi cập nhật NotificationHistory ID: ${id}. Lỗi: ${error.message}`,
            {
              stack: error.stack,
              command: JSON.stringify(command),
            },
          );
        }

        throw error;
      }
    });
  }
}
