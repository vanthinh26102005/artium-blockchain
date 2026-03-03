import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { DeleteMomentCommand } from '../DeleteMoment.command';
import { IMomentRepository } from '../../../../domain';

@CommandHandler(DeleteMomentCommand)
export class DeleteMomentHandler implements ICommandHandler<
  DeleteMomentCommand,
  boolean
> {
  private readonly logger = new Logger(DeleteMomentHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
  ) {}

  async execute(command: DeleteMomentCommand): Promise<boolean> {
    const reqId = `delete-moment:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing delete moment command`, {
      momentId: command.id,
      userId: command.userId,
    });

    try {
      // Verify ownership
      const existingMoment = await this.momentRepository.findById(command.id);

      if (!existingMoment) {
        this.logger.warn(`[${reqId}] Moment not found: ${command.id}`);
        throw RpcExceptionHelper.notFound('Moment not found');
      }

      if (existingMoment.userId !== command.userId) {
        this.logger.warn(
          `[${reqId}] User ${command.userId} attempted to delete moment owned by ${existingMoment.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to delete this moment',
        );
      }

      await this.momentRepository.delete(command.id);

      this.logger.log(`[${reqId}] Moment deleted successfully`, {
        momentId: command.id,
      });

      // TODO: Publish event via outbox for cleanup (activity feed, views, etc.)

      return true;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to delete moment`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to delete moment');
    }
  }
}
