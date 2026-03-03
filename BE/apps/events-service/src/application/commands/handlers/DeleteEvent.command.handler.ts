import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcExceptionHelper } from '@app/common';
import { Event } from '../../../domain/entities';
import { DeleteEventCommand } from '../DeleteEvent.command';

@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler
  implements ICommandHandler<DeleteEventCommand>
{
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async execute(command: DeleteEventCommand): Promise<boolean> {
    const { eventId, userId } = command;

    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw RpcExceptionHelper.notFound('Event not found');
    }

    if (userId && event.creatorId !== userId) {
      throw RpcExceptionHelper.forbidden(
        'You are not allowed to delete this event',
      );
    }

    const result = await this.eventRepository.delete(eventId);
    return (result.affected ?? 0) > 0;
  }
}
