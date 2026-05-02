import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateMoodboardCommand,
  UpdateMoodboardCommand,
  DeleteMoodboardCommand,
  AddArtworkToMoodboardCommand,
  RemoveArtworkFromMoodboardCommand,
  GetMoodboardQuery,
  ListArtworkMoodboardIdsForUserQuery,
  ListUserMoodboardsQuery,
} from '../../application';
import {
  CreateMoodboardInput,
  UpdateMoodboardInput,
  AddArtworkToMoodboardInput,
  MoodboardObject,
} from '../../domain';

@Controller()
export class MoodboardsMicroserviceController {
  private readonly logger = new Logger(MoodboardsMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'create_moodboard' })
  async createMoodboard(
    @Payload() input: CreateMoodboardInput,
  ): Promise<MoodboardObject> {
    this.logger.log(
      `[Microservice] Creating moodboard for user: ${input.userId}`,
    );
    return this.commandBus.execute(new CreateMoodboardCommand(input));
  }

  @MessagePattern({ cmd: 'update_moodboard' })
  async updateMoodboard(
    @Payload()
    data: {
      id: string;
      userId: string;
      input: UpdateMoodboardInput;
    },
  ): Promise<MoodboardObject | null> {
    this.logger.log(`[Microservice] Updating moodboard: ${data.id}`);
    return this.commandBus.execute(
      new UpdateMoodboardCommand(data.id, data.userId, data.input),
    );
  }

  @MessagePattern({ cmd: 'delete_moodboard' })
  async deleteMoodboard(
    @Payload() data: { id: string; userId: string },
  ): Promise<boolean> {
    this.logger.log(`[Microservice] Deleting moodboard: ${data.id}`);
    return this.commandBus.execute(
      new DeleteMoodboardCommand(data.id, data.userId),
    );
  }

  @MessagePattern({ cmd: 'get_moodboard' })
  async getMoodboard(
    @Payload() data: { id: string },
  ): Promise<MoodboardObject | null> {
    this.logger.log(`[Microservice] Getting moodboard: ${data.id}`);
    return this.queryBus.execute(new GetMoodboardQuery(data.id));
  }

  @MessagePattern({ cmd: 'list_user_moodboards' })
  async listUserMoodboards(
    @Payload()
    data: {
      userId: string;
      options?: { skip?: number; take?: number; includePrivate?: boolean };
    },
  ): Promise<MoodboardObject[]> {
    this.logger.log(
      `[Microservice] Listing moodboards for user: ${data.userId}`,
    );
    return this.queryBus.execute(
      new ListUserMoodboardsQuery(data.userId, data.options),
    );
  }

  @MessagePattern({ cmd: 'list_artwork_moodboard_ids_for_user' })
  async listArtworkMoodboardIdsForUser(
    @Payload() data: { userId: string; artworkId: string },
  ): Promise<string[]> {
    this.logger.log(
      `[Microservice] Listing moodboards for user ${data.userId} containing artwork ${data.artworkId}`,
    );
    return this.queryBus.execute(
      new ListArtworkMoodboardIdsForUserQuery(data.userId, data.artworkId),
    );
  }

  @MessagePattern({ cmd: 'add_artwork_to_moodboard' })
  async addArtworkToMoodboard(
    @Payload() data: { userId: string; input: AddArtworkToMoodboardInput },
  ): Promise<any> {
    this.logger.log(
      `[Microservice] Adding artwork ${data.input.artworkId} to moodboard ${data.input.moodboardId}`,
    );
    return this.commandBus.execute(
      new AddArtworkToMoodboardCommand(data.userId, data.input),
    );
  }

  @MessagePattern({ cmd: 'remove_artwork_from_moodboard' })
  async removeArtworkFromMoodboard(
    @Payload() data: { userId: string; moodboardId: string; artworkId: string },
  ): Promise<boolean> {
    this.logger.log(
      `[Microservice] Removing artwork ${data.artworkId} from moodboard ${data.moodboardId}`,
    );
    return this.commandBus.execute(
      new RemoveArtworkFromMoodboardCommand(
        data.userId,
        data.moodboardId,
        data.artworkId,
      ),
    );
  }
}
