import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateArtworkCommand,
  UpdateArtworkCommand,
  DeleteArtworkCommand,
  BulkMoveArtworksCommand,
  BulkDeleteArtworksCommand,
  BulkUpdateArtworkStatusCommand,
  AddImagesToArtworkCommand,
  GetArtworkQuery,
  ListArtworksQuery,
} from '../../application';
import { GetArtworksQueryDto, UserPayload, ArtworkImageInput } from '@app/common';
import { CreateArtworkInput } from '../../domain/dtos/artworks/create-artwork.input';
import { UpdateArtworkInput } from '../../domain/dtos/artworks/update-artwork.input';
import {
  BulkDeleteArtworksInput,
  BulkMoveArtworksInput,
  BulkUpdateArtworkStatusInput,
} from '../../domain';

@Controller()
export class ArtworkMicroserviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern({ cmd: 'get_artworks' })
  async getArtworks(@Payload() query: GetArtworksQueryDto) {
    return this.queryBus.execute(new ListArtworksQuery(query));
  }

  @MessagePattern({ cmd: 'get_artwork_by_id' })
  async getArtworkById(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetArtworkQuery(data.id));
  }

  @MessagePattern({ cmd: 'create_artwork' })
  async createArtwork(
    @Payload() data: CreateArtworkInput & { user?: UserPayload },
  ) {
    return this.commandBus.execute(new CreateArtworkCommand(data));
  }

  @MessagePattern({ cmd: 'update_artwork' })
  async updateArtwork(
    @Payload()
    data: { id: string } & UpdateArtworkInput & { user?: UserPayload },
  ) {
    const { id, user, ...updateData } = data;
    return this.commandBus.execute(new UpdateArtworkCommand(id, updateData));
  }

  @MessagePattern({ cmd: 'delete_artwork' })
  async deleteArtwork(@Payload() data: { id: string; user?: UserPayload }) {
    return this.commandBus.execute(new DeleteArtworkCommand(data.id));
  }

  @MessagePattern({ cmd: 'bulk_move_artworks' })
  async bulkMoveArtworks(
    @Payload()
    data: BulkMoveArtworksInput & { user?: UserPayload },
  ) {
    return this.commandBus.execute(
      new BulkMoveArtworksCommand(
        data.artworkIds,
        data.folderId ?? null,
        data.sellerId,
      ),
    );
  }

  @MessagePattern({ cmd: 'bulk_delete_artworks' })
  async bulkDeleteArtworks(
    @Payload() data: BulkDeleteArtworksInput & { user?: UserPayload },
  ) {
    return this.commandBus.execute(
      new BulkDeleteArtworksCommand(data.artworkIds, data.sellerId),
    );
  }

  @MessagePattern({ cmd: 'bulk_update_artwork_status' })
  async bulkUpdateArtworkStatus(
    @Payload() data: BulkUpdateArtworkStatusInput & { user?: UserPayload },
  ) {
    return this.commandBus.execute(
      new BulkUpdateArtworkStatusCommand(
        data.artworkIds,
        data.status as any,
        data.sellerId,
      ),
    );
  }

  @MessagePattern({ cmd: 'add_images_to_artwork' })
  async addImagesToArtwork(
    @Payload() data: { id: string; images: ArtworkImageInput[]; user?: UserPayload },
  ) {
    return this.commandBus.execute(
      new AddImagesToArtworkCommand(data.id, data.images),
    );
  }
}
