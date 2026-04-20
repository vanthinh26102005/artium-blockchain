import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  UpdateUserProfileCommand,
  UpdateUserProfileResult,
} from '../UpdateUserProfile.command';
import { IUserRepository } from '../../../domain/interfaces/user.repository.interface';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand, UpdateUserProfileResult>
{
  private readonly logger = new Logger(UpdateUserProfileHandler.name);

  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    command: UpdateUserProfileCommand,
  ): Promise<UpdateUserProfileResult> {
    try {
      const { userId, input } = command;

      this.logger.debug(`Updating user profile: ${userId}`);

      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw RpcExceptionHelper.notFound('User not found');
      }

      // If slug is being changed, check uniqueness
      if (input.slug && input.slug !== existingUser.slug) {
        const slugNormalized = input.slug.toLowerCase();
        const existingBySlug =
          await this.userRepository.findBySlug(slugNormalized);
        if (existingBySlug && existingBySlug.id !== userId) {
          throw RpcExceptionHelper.conflict(
            'Slug is already taken. Please choose a different one.',
          );
        }
        input.slug = slugNormalized;
      }

      // Only allow updating safe fields
      const safeInput: Record<string, unknown> = {};
      if (input.fullName !== undefined) safeInput.fullName = input.fullName;
      if (input.slug !== undefined) safeInput.slug = input.slug;
      if (input.avatarUrl !== undefined) safeInput.avatarUrl = input.avatarUrl;

      const updatedUser = await this.userRepository.update(userId, safeInput);
      if (!updatedUser) {
        throw RpcExceptionHelper.notFound('Failed to update user profile');
      }

      this.logger.log(`User profile updated successfully: ${userId}`);

      const { password: _password, ...safeUser } = updatedUser;
      return { user: safeUser };
    } catch (error) {
      this.logger.error(
        `Failed to update user profile: ${error.message}`,
        error.stack,
      );

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.badRequest('Failed to update user profile');
    }
  }
}
