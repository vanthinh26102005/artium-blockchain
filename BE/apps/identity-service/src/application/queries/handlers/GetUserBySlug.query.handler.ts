import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetUserBySlugQuery } from '../GetUserBySlug.query';
import { IUserRepository, User } from 'apps/identity-service/src/domain';

@QueryHandler(GetUserBySlugQuery)
export class GetUserBySlugHandler
  implements IQueryHandler<GetUserBySlugQuery, User | null>
{
  private readonly logger = new Logger(GetUserBySlugHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserBySlugQuery): Promise<User | null> {
    const { slug } = query;

    if (!slug) {
      throw RpcExceptionHelper.badRequest('Slug is required');
    }

    this.logger.debug(`Fetching user by slug: ${slug}`);

    const user = await this.userRepository.findBySlug(slug);

    if (!user) {
      this.logger.debug(`User not found for slug: ${slug}`);
    }

    return user;
  }
}
