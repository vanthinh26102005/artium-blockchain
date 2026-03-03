import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand, ListCommentsByEntityQuery } from '../../application';
import {
  CommentObject,
  CommentableType,
  CreateCommentInput,
} from '../../domain';

@Controller()
export class CommentsMicroserviceController {
  private readonly logger = new Logger(CommentsMicroserviceController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'create_comment' })
  async createComment(
    @Payload() input: CreateCommentInput,
  ): Promise<CommentObject> {
    this.logger.log(
      `[Microservice] Creating comment for ${input.commentableType}:${input.commentableId}`,
    );
    return this.commandBus.execute(new CreateCommentCommand(input));
  }

  @MessagePattern({ cmd: 'list_comments' })
  async listComments(
    @Payload()
    data: {
      commentableType: CommentableType;
      commentableId: string;
      options?: { skip?: number; take?: number; includeDeleted?: boolean };
    },
  ): Promise<CommentObject[]> {
    this.logger.log(
      `[Microservice] Listing comments for ${data.commentableType}:${data.commentableId}`,
    );
    return this.queryBus.execute(
      new ListCommentsByEntityQuery(
        data.commentableType,
        data.commentableId,
        data.options,
      ),
    );
  }
}
