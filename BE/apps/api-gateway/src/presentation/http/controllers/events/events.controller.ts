import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth';
import { EventStatus, EventType } from '@app/common';
import { MICROSERVICES } from '../../../../config';
import { sendRpc } from '../../utils';

type EventFormRequest = {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  locationType: 'in-person' | 'online';
  address?: string;
  venueDetails?: string;
  onlineUrl?: string;
  visibility: 'public' | 'private';
  types: string[];
  coverImageUrl?: string | null;
};

type EventInvitationRequest = {
  recipients: Array<{
    id?: string;
    email: string;
    name?: string;
  }>;
  message?: string;
  eventUrl?: string;
  senderName?: string;
  senderEmail?: string;
};

type EventLocationDto = {
  type?: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  venueName?: string;
  address?: {
    line1?: string;
  };
  virtualUrl?: string;
  accessInstructions?: string;
};

const EVENT_TYPE_MAP: Record<string, EventType> = {
  exhibition: EventType.EXHIBITION,
  'art-fair': EventType.ART_FAIR,
  'gallery-opening': EventType.GALLERY_OPENING,
  workshop: EventType.WORKSHOP,
  'panel-talk': EventType.ARTIST_TALK,
  'artist-talk': EventType.ARTIST_TALK,
  'studio-visit': EventType.PRIVATE_VIEW,
  'museum-show': EventType.OTHER,
  other: EventType.OTHER,
};

const normalizeType = (value?: string): EventType => {
  if (!value) return EventType.OTHER;
  const normalized = value.trim().toLowerCase();
  return EVENT_TYPE_MAP[normalized] ?? EventType.OTHER;
};

const buildLocation = (payload: EventFormRequest): EventLocationDto | null => {
  if (payload.locationType === 'online') {
    return {
      type: 'VIRTUAL',
      virtualUrl: payload.onlineUrl?.trim() || undefined,
    };
  }

  const address = payload.address?.trim();
  const venue = payload.venueDetails?.trim();

  return {
    type: 'PHYSICAL',
    ...(venue ? { venueName: venue } : {}),
    ...(address ? { address: { line1: address } } : {}),
  };
};

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    @Inject(MICROSERVICES.EVENTS_SERVICE)
    private readonly eventsClient: ClientProxy,
  ) {}

  @Get('discover')
  @ApiOperation({ summary: 'Get public events for discovery' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getDiscoverEvents() {
    return sendRpc(this.eventsClient, { cmd: 'get_public_events' }, {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  async getEventById(@Param('id') eventId: string) {
    return sendRpc(this.eventsClient, { cmd: 'get_event' }, { eventId });
  }

  @Get('hosting')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get events hosted by current user' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getHostingEvents(@Req() req: any) {
    return sendRpc(this.eventsClient, { cmd: 'get_events_by_creator' }, {
      creatorId: req.user?.id,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async createEvent(@Req() req: any, @Body() payload: EventFormRequest) {
    const primaryType = normalizeType(payload.types?.[0]);
    return sendRpc(this.eventsClient, { cmd: 'create_event' }, {
      creatorId: req.user?.id,
      title: payload.title,
      description: payload.description,
      type: primaryType,
      status: EventStatus.PUBLISHED,
      startTime: payload.startDateTime,
      endTime: payload.endDateTime,
      timezone: payload.timeZone,
      location: buildLocation(payload),
      isPublic: payload.visibility === 'public',
      inviteOnly: payload.visibility === 'private',
      tags: payload.types ?? [],
      coverImageUrl: payload.coverImageUrl ?? undefined,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  async updateEvent(
    @Req() req: any,
    @Param('id') eventId: string,
    @Body() payload: EventFormRequest,
  ) {
    const primaryType = normalizeType(payload.types?.[0]);
    return sendRpc(this.eventsClient, { cmd: 'update_event' }, {
      eventId,
      userId: req.user?.id,
      payload: {
        title: payload.title,
        description: payload.description,
        type: primaryType,
        status: EventStatus.PUBLISHED,
        startTime: payload.startDateTime,
        endTime: payload.endDateTime,
        timezone: payload.timeZone,
        location: buildLocation(payload),
        isPublic: payload.visibility === 'public',
        inviteOnly: payload.visibility === 'private',
        tags: payload.types ?? [],
        coverImageUrl: payload.coverImageUrl ?? undefined,
      },
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  async deleteEvent(@Req() req: any, @Param('id') eventId: string) {
    return sendRpc(this.eventsClient, { cmd: 'delete_event' }, {
      eventId,
      userId: req.user?.id,
    });
  }

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send invitations for an event' })
  @ApiParam({ name: 'id', type: 'string', description: 'Event ID' })
  @ApiBody({ type: Object })
  @ApiResponse({
    status: 200,
    description: 'Invitations queued successfully',
  })
  async sendInvitations(
    @Req() req: any,
    @Param('id') eventId: string,
    @Body() payload: EventInvitationRequest,
  ) {
    return sendRpc(this.eventsClient, { cmd: 'send_event_invitations' }, {
      eventId,
      senderId: req.user?.id,
      senderName: payload.senderName,
      senderEmail: payload.senderEmail,
      recipients: payload.recipients,
      message: payload.message,
      eventUrl: payload.eventUrl,
    });
  }
}
