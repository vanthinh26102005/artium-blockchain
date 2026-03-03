import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IsLikedQuery, SetLikeStatusCommand } from '../../application';
import { LikeableType } from '../../domain';
import {
  LikeStatusResult,
  SetLikeStatusInput,
} from '../../application/commands/likes/SetLikeStatus.command';

@Controller()
export class LikesMicroserviceController {
  private readonly logger = new Logger(LikesMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'set_like_status' })
  async setLikeStatus(
    @Payload() input: SetLikeStatusInput,
  ): Promise<LikeStatusResult> {
    this.logger.log(
      `[Microservice] Setting like status for ${input.likeableType}:${input.likeableId}`,
    );
    return this.commandBus.execute(new SetLikeStatusCommand(input));
  }

  @MessagePattern({ cmd: 'is_liked' })
  async isLiked(
    @Payload()
    data: { userId: string; likeableType: LikeableType; likeableId: string },
  ): Promise<boolean> {
    this.logger.log(
      `[Microservice] Checking like status for ${data.likeableType}:${data.likeableId}`,
    );
    return this.queryBus.execute(
      new IsLikedQuery(data.userId, data.likeableType, data.likeableId),
    );
  }
}
