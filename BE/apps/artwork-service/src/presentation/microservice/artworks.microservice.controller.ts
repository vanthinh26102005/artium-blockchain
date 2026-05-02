import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateArtworkCommand,
  CreateArtworkDraftCommand,
  MarkArtworkInAuctionCommand,
  SaveArtworkDraftCommand,
  SubmitArtworkDraftCommand,
  UpdateArtworkCommand,
  DeleteArtworkCommand,
  BulkMoveArtworksCommand,
  BulkDeleteArtworksCommand,
  BulkUpdateArtworkStatusCommand,
  AddImagesToArtworkCommand,
  GetArtworkQuery,
  GetArtworkUploadDraftQuery,
  IsArtworkLikedQuery,
  ListArtworksQuery,
  ListSellerAuctionArtworkCandidatesQuery,
  SetArtworkLikeStatusCommand,
} from '../../application';
import {
  CreateArtworkDraftInput,
  GetArtworksQueryDto,
  SaveArtworkDraftInput,
  SubmitArtworkDraftInput,
  UserPayload,
  ArtworkImageInput,
  ArtworkStatus,
} from '@app/common';
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

  @MessagePattern({ cmd: 'is_artwork_liked' })
  async isArtworkLiked(
    @Payload() data: { userId: string; artworkId: string },
  ) {
    return this.queryBus.execute(
      new IsArtworkLikedQuery(data.userId, data.artworkId),
    );
  }

  @MessagePattern({ cmd: 'set_artwork_like_status' })
  async setArtworkLikeStatus(
    @Payload() data: { userId: string; artworkId: string; liked: boolean },
  ) {
    return this.commandBus.execute(new SetArtworkLikeStatusCommand(data));
  }

  @MessagePattern({ cmd: 'list_seller_auction_artwork_candidates' })
  async listSellerAuctionArtworkCandidates(
    @Payload() data: { sellerId: string },
  ) {
    return this.queryBus.execute(
      new ListSellerAuctionArtworkCandidatesQuery(data.sellerId),
    );
  }

  @MessagePattern({ cmd: 'mark_artwork_in_auction' })
  async markArtworkInAuction(
    @Payload()
    data: { artworkId: string; sellerId: string; onChainAuctionId: string },
  ) {
    return this.commandBus.execute(
      new MarkArtworkInAuctionCommand(
        data.artworkId,
        data.sellerId,
        data.onChainAuctionId,
      ),
    );
  }

  @MessagePattern({ cmd: 'create_artwork' })
  async createArtwork(
    @Payload() data: CreateArtworkInput & { user?: UserPayload },
  ) {
    return this.commandBus.execute(new CreateArtworkCommand(data));
  }

  @MessagePattern({ cmd: 'create_artwork_upload_draft' })
  async createArtworkUploadDraft(
    @Payload()
    data: {
      draftArtworkId: string;
      data: CreateArtworkDraftInput;
      user: UserPayload;
    },
  ) {
    return this.commandBus.execute(
      new CreateArtworkDraftCommand(data.draftArtworkId, data.data, data.user),
    );
  }

  @MessagePattern({ cmd: 'get_artwork_upload_draft' })
  async getArtworkUploadDraft(
    @Payload() data: { draftArtworkId: string; user: UserPayload },
  ) {
    return this.queryBus.execute(
      new GetArtworkUploadDraftQuery(data.draftArtworkId, data.user),
    );
  }

  @MessagePattern({ cmd: 'save_artwork_upload_draft' })
  async saveArtworkUploadDraft(
    @Payload()
    data: {
      draftArtworkId: string;
      data: SaveArtworkDraftInput;
      user: UserPayload;
    },
  ) {
    return this.commandBus.execute(
      new SaveArtworkDraftCommand(data.draftArtworkId, data.data, data.user),
    );
  }

  @MessagePattern({ cmd: 'submit_artwork_upload_draft' })
  async submitArtworkUploadDraft(
    @Payload()
    data: {
      draftArtworkId: string;
      data: SubmitArtworkDraftInput;
      user: UserPayload;
    },
  ) {
    return this.commandBus.execute(
      new SubmitArtworkDraftCommand(data.draftArtworkId, data.data, data.user),
    );
  }

  @MessagePattern({ cmd: 'update_artwork' })
  async updateArtwork(
    @Payload()
    data: { id: string } & UpdateArtworkInput & { user?: UserPayload },
  ) {
    const { id, user, ...updateData } = data;
    return this.commandBus.execute(new UpdateArtworkCommand(id, updateData, user));
  }

  @MessagePattern({ cmd: 'delete_artwork' })
  async deleteArtwork(@Payload() data: { id: string; user?: UserPayload }) {
    return this.commandBus.execute(new DeleteArtworkCommand(data.id, data.user));
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
        data.status as ArtworkStatus,
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
