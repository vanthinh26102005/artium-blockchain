import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  CreateTagInput,
  FindTagsArgs,
  TagObject,
  UpdateTagInput,
} from '../../domain';

import {
  CreateTagCommand,
  DeleteTagCommand,
  GetTagQuery,
  ListTagsQuery,
  SearchTagsQuery,
  UpdateTagCommand,
} from '../../application';

@Controller()
export class TagsMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'get_tag' })
  async getTag(@Payload() data: { id: string }): Promise<TagObject | null> {
    return this.queryBus.execute(new GetTagQuery(data.id));
  }

  @MessagePattern({ cmd: 'get_tags' })
  async getTags(@Payload() filters?: FindTagsArgs): Promise<TagObject[]> {
    return this.queryBus.execute(new ListTagsQuery(filters || {}));
  }

  @MessagePattern({ cmd: 'search_tags' })
  async searchTags(
    @Payload() data: { query: string; sellerId?: string; limit?: number },
  ): Promise<TagObject[]> {
    const limitNum = data.limit ? parseInt(String(data.limit), 10) : 10;
    return this.queryBus.execute(
      new SearchTagsQuery(data.sellerId || null, data.query.trim(), limitNum),
    );
  }

  @MessagePattern({ cmd: 'create_tag' })
  async createTag(@Payload() input: CreateTagInput): Promise<TagObject> {
    return this.commandBus.execute(new CreateTagCommand(input));
  }

  @MessagePattern({ cmd: 'update_tag' })
  async updateTag(
    @Payload() data: { id: string; input: UpdateTagInput },
  ): Promise<TagObject> {
    return this.commandBus.execute(new UpdateTagCommand(data.id, data.input));
  }

  @MessagePattern({ cmd: 'delete_tag' })
  async deleteTag(
    @Payload() data: { id: string },
  ): Promise<{ success: boolean }> {
    const deleted = await this.commandBus.execute(
      new DeleteTagCommand(data.id),
    );
    return { success: !!deleted };
  }
}
