import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateTagCommand } from '../CreateTag.command';
import { ITagRepository, Tag } from 'apps/artwork-service/src/domain';

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  private readonly logger = new Logger(CreateTagHandler.name);
  constructor(@Inject(ITagRepository) private readonly repo: ITagRepository) {}

  async execute(command: CreateTagCommand): Promise<Tag> {
    const { name, sellerId, status } = command.payload;
    const created = await this.repo.create({
      name,
      sellerId,
      status,
    } as any);
    this.logger.log(`Created tag id=${(created as any).id} name=${name}`);
    return created;
  }
}
