import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { UpdateTagCommand } from '../UpdateTag.command.handler';
import { ITagRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(UpdateTagCommand)
export class UpdateTagHandler implements ICommandHandler<UpdateTagCommand> {
  private readonly logger = new Logger(UpdateTagHandler.name);
  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(command: UpdateTagCommand) {
    const { id, payload } = command;
    const updated = await this.repo.update(id, payload as any);
    if (!updated) {
      this.logger.warn(`Tag not found id=${id}`);
      throw RpcExceptionHelper.notFound(`Tag ${id} not found`);
    }
    return updated;
  }
}
