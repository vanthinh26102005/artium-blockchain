import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ListCommentsByEntityQuery } from '../ListCommentsByEntity.query';
import { Comment, ICommentRepository } from '../../../../domain';

@QueryHandler(ListCommentsByEntityQuery)
export class ListCommentsByEntityHandler
  implements IQueryHandler<ListCommentsByEntityQuery, Comment[]>
{
  private readonly logger = new Logger(ListCommentsByEntityHandler.name);

  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(query: ListCommentsByEntityQuery): Promise<Comment[]> {
    this.logger.debug(
      `Listing comments for ${query.commentableType}:${query.commentableId}`,
    );

    const options = query.options ?? {};
    const where: any = {};

    if (!options.includeDeleted) {
      where.isDeleted = false;
    }

    return this.commentRepository.findByEntity(query.commentableType, query.commentableId, {
      where,
      skip: options.skip,
      take: options.take ?? 50,
      orderBy: { createdAt: 'desc' },
    });
  }
}
