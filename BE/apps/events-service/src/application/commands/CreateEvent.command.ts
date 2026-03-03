import { CreateEventDto } from '../../domain';

export class CreateEventCommand {
  constructor(public readonly data: CreateEventDto) {}
}
