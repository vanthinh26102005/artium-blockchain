import { UpdateEventDto } from '../../domain';

export class UpdateEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly userId: string,
    public readonly data: UpdateEventDto,
  ) {}
}
