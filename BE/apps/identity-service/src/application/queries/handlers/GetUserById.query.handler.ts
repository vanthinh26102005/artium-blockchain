import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RpcExceptionHelper } from '@app/common';
import { GetUserByIdQuery } from '../GetUserById.query';
import { IUserRepository, User } from 'apps/identity-service/src/domain';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<
  GetUserByIdQuery,
  User | null
> {
  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery) {
    const { userId } = query;
    if (!userId) {
      throw RpcExceptionHelper.unauthorized('User ID is required');
    }
    return this.userRepository.findById(userId);
  }
}
