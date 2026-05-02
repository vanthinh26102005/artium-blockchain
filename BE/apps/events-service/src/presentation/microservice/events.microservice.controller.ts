import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateEventCommand,
  UpdateEventCommand,
  DeleteEventCommand,
  SendEventInvitationsCommand,
  GetEventQuery,
  GetEventsByCreatorQuery,
  GetPublicEventsQuery,
} from '../../application';
import {
  CreateEventDto,
  UpdateEventDto,
  SendEventInvitationsDto,
} from '../../domain';

@Controller()
export class EventsMicroserviceController {
  private readonly logger = new Logger(EventsMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'create_event' })
  async createEvent(@Payload() data: CreateEventDto) {
    this.logger.debug(`Creating event for creator: ${data.creatorId}`);
    return this.commandBus.execute(new CreateEventCommand(data));
  }

  @MessagePattern({ cmd: 'update_event' })
  async updateEvent(
    @Payload()
    data: {
      eventId: string;
      userId: string;
      payload: UpdateEventDto;
    },
  ) {
    this.logger.debug(`Updating event: ${data.eventId}`);
    return this.commandBus.execute(
      new UpdateEventCommand(data.eventId, data.userId, data.payload),
    );
  }

  @MessagePattern({ cmd: 'delete_event' })
  async deleteEvent(@Payload() data: { eventId: string; userId: string }) {
    this.logger.debug(`Deleting event: ${data.eventId}`);
    return this.commandBus.execute(
      new DeleteEventCommand(data.eventId, data.userId),
    );
  }

  @MessagePattern({ cmd: 'get_event' })
  async getEvent(@Payload() data: { eventId: string }) {
    this.logger.debug(`Getting event: ${data.eventId}`);
    return this.queryBus.execute(new GetEventQuery(data.eventId));
  }

  @MessagePattern({ cmd: 'get_events_by_creator' })
  async getEventsByCreator(@Payload() data: { creatorId: string }) {
    this.logger.debug(`Getting events for creator: ${data.creatorId}`);
    return this.queryBus.execute(new GetEventsByCreatorQuery(data.creatorId));
  }

  @MessagePattern({ cmd: 'get_public_events' })
  async getPublicEvents(
    @Payload() data: { options?: { take?: number; skip?: number } },
  ) {
    this.logger.debug('Getting public events');
    return this.queryBus.execute(new GetPublicEventsQuery(data?.options));
  }

  @MessagePattern({ cmd: 'send_event_invitations' })
  async sendEventInvitations(@Payload() data: SendEventInvitationsDto) {
    this.logger.debug(`Sending event invitations: ${data.eventId}`);
    return this.commandBus.execute(new SendEventInvitationsCommand(data));
  }
}
