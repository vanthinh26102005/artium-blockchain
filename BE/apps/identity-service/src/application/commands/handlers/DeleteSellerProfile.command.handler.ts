import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import {
  DeleteSellerProfileCommand,
  DeleteSellerProfileResult,
} from '../DeleteSellerProfile.command';
import { ISellerProfileRepository } from '../../../domain/interfaces/seller-profile.repository.interface';

@CommandHandler(DeleteSellerProfileCommand)
export class DeleteSellerProfileHandler implements ICommandHandler<
  DeleteSellerProfileCommand,
  DeleteSellerProfileResult
> {
  private readonly logger = new Logger(DeleteSellerProfileHandler.name);

  constructor(
    @Inject(ISellerProfileRepository)
    private readonly sellerProfileRepository: ISellerProfileRepository,
  ) {}

  async execute(
    command: DeleteSellerProfileCommand,
  ): Promise<DeleteSellerProfileResult> {
    try {
      const { profileId, userId, hardDelete } = command;

      this.logger.debug(
        `Deleting seller profile: ${profileId} by user: ${userId}, hardDelete: ${hardDelete}`,
      );

      const existingProfile =
        await this.sellerProfileRepository.findById(profileId);
      if (!existingProfile) {
        this.logger.warn(`Seller profile not found: ${profileId}`);
        throw RpcExceptionHelper.notFound('Seller profile not found');
      }

      if (existingProfile.userId !== userId) {
        this.logger.warn(
          `User ${userId} attempted to delete profile ${profileId} owned by ${existingProfile.userId}`,
        );
        throw RpcExceptionHelper.forbidden(
          'You do not have permission to delete this profile',
        );
      }

      // TODO: Check for active dependencies from artwork-service
      // During API refactoring phase, add a call to artwork-service to check if seller has active artworks
      // const artworkCount = await this.artworkClient.getArtworkCountBySeller(profileId);
      // if (artworkCount > 0) {
      //   throw new BadRequestException('Cannot delete seller profile with active artworks');
      // }

      let message: string;

      if (hardDelete) {
        await this.sellerProfileRepository.delete(profileId);
        message = 'Seller profile permanently deleted';
        this.logger.log(`Seller profile hard deleted: ${profileId}`);
      } else {
        await this.sellerProfileRepository.softDelete(profileId);
        message = 'Seller profile deactivated';
        this.logger.log(
          `Seller profile soft deleted (deactivated): ${profileId}`,
        );
      }

      // TODO: Emit SellerProfileDeletedEvent for other services to consume
      // this.eventBus.publish(new SellerProfileDeletedEvent(profileId, hardDelete));

      return {
        success: true,
        message,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete seller profile: ${error.message}`,
        error.stack,
      );

      if (error instanceof RpcException) {
        throw error;
      }

      throw RpcExceptionHelper.badRequest('Failed to delete seller profile');
    }
  }
}
