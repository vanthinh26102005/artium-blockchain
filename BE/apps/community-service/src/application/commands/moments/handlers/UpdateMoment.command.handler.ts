import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { UpdateMomentCommand } from '../UpdateMoment.command';
import { IMomentRepository, Moment } from '../../../../domain';

@CommandHandler(UpdateMomentCommand)
export class UpdateMomentHandler implements ICommandHandler<
  UpdateMomentCommand,
  Moment | null
> {
  private readonly logger = new Logger(UpdateMomentHandler.name);

  constructor(
    @Inject(IMomentRepository)
    private readonly momentRepository: IMomentRepository,
  ) {}

  async execute(command: UpdateMomentCommand): Promise<Moment | null> {
    const reqId = `update-moment:${Date.now()}`;
    this.logger.log(`[${reqId}] Executing update moment command`, {
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
          `[${reqId}] User ${command.userId} attempted to update moment owned by ${existingMoment.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to update this moment',
        );
      }

      const updatedMoment = await this.momentRepository.update(
        command.id,
        command.input,
      );

      this.logger.log(`[${reqId}] Moment updated successfully`, {
        momentId: command.id,
      });

      return updatedMoment;
    } catch (error) {
      this.logger.error(`[${reqId}] Failed to update moment`, error.stack);

      if (error.status && error.status !== 500) {
        throw error;
      }

      throw RpcExceptionHelper.internalError('Failed to update moment');
    }
  }
}
