import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DeleteTagCommand } from '../DeleteTag.command';
import { ITagRepository } from 'apps/artwork-service/src/domain';

@CommandHandler(DeleteTagCommand)
export class DeleteTagHandler implements ICommandHandler<DeleteTagCommand> {
  private readonly logger = new Logger(DeleteTagHandler.name);
  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(command: DeleteTagCommand) {
    const ok = await this.repo.delete(command.id);
    this.logger.log(`Delete tag id=${command.id} result=${ok}`);
    return ok;
  }
}
