import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateMomentCommand,
  UpdateMomentCommand,
  DeleteMomentCommand,
  GetMomentQuery,
  ListUserMomentsQuery,
} from '../../application';
import {
  CreateMomentInput,
  UpdateMomentInput,
  MomentObject,
} from '../../domain';

@Controller()
export class MomentsMicroserviceController {
  private readonly logger = new Logger(MomentsMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'create_moment' })
  async createMoment(
    @Payload() input: CreateMomentInput,
  ): Promise<MomentObject> {
    this.logger.log(`[Microservice] Creating moment for user: ${input.userId}`);
    return this.commandBus.execute(new CreateMomentCommand(input));
  }

  @MessagePattern({ cmd: 'update_moment' })
  async updateMoment(
    @Payload() data: { id: string; userId: string; input: UpdateMomentInput },
  ): Promise<MomentObject | null> {
    this.logger.log(`[Microservice] Updating moment: ${data.id}`);
    return this.commandBus.execute(
      new UpdateMomentCommand(data.id, data.userId, data.input),
    );
  }

  @MessagePattern({ cmd: 'delete_moment' })
  async deleteMoment(
    @Payload() data: { id: string; userId: string },
  ): Promise<boolean> {
    this.logger.log(`[Microservice] Deleting moment: ${data.id}`);
    return this.commandBus.execute(
      new DeleteMomentCommand(data.id, data.userId),
    );
  }

  @MessagePattern({ cmd: 'get_moment' })
  async getMoment(
    @Payload() data: { id: string },
  ): Promise<MomentObject | null> {
    this.logger.log(`[Microservice] Getting moment: ${data.id}`);
    return this.queryBus.execute(new GetMomentQuery(data.id));
  }

  @MessagePattern({ cmd: 'list_user_moments' })
  async listUserMoments(
    @Payload()
    data: {
      userId: string;
      options?: { skip?: number; take?: number; includeArchived?: boolean };
    },
  ): Promise<MomentObject[]> {
    this.logger.log(`[Microservice] Listing moments for user: ${data.userId}`);
    return this.queryBus.execute(
      new ListUserMomentsQuery(data.userId, data.options),
    );
  }
}
