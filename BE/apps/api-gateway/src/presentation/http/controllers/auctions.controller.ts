import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import {
  AuctionReadObject,
  GetAuctionsDto,
  PaginatedAuctionsObject,
  SellerAuctionArtworkCandidateObject,
  SellerAuctionArtworkCandidatesResponse,
  SellerAuctionArtworkEligibilityReason,
  SellerAuctionArtworkRecoveryActionObject,
  UserRole,
} from '@app/common';
import { MICROSERVICES } from '../../../config';
import { sendRpc } from '../utils';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(
    @Inject(MICROSERVICES.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
    @Inject(MICROSERVICES.ARTWORK_SERVICE)
    private readonly artworkClient: ClientProxy,
  ) {}

  private withActiveOrderLock(
    candidate: SellerAuctionArtworkCandidateObject,
  ): SellerAuctionArtworkCandidateObject {
    const reasonCode = SellerAuctionArtworkEligibilityReason.ACTIVE_ORDER_LOCK;
    const reasonCodes = candidate.reasonCodes.includes(reasonCode)
      ? candidate.reasonCodes
      : [...candidate.reasonCodes, reasonCode];
    const recoveryAction: SellerAuctionArtworkRecoveryActionObject = {
      reasonCode,
      message: 'Artwork has an active order',
      actionLabel: 'Resolve the order before auctioning it.',
    };
    const recoveryActions = candidate.recoveryActions.some(
      (action) => action.reasonCode === reasonCode,
    )
      ? candidate.recoveryActions
      : [...candidate.recoveryActions, recoveryAction];

    return {
      ...candidate,
      isEligible: false,
      reasonCodes,
      recoveryActions,
    };
  }

  private mergeOrderLocks(
    candidates: SellerAuctionArtworkCandidatesResponse,
    lockedArtworkIds: string[],
  ): SellerAuctionArtworkCandidatesResponse {
    const locked = new Set(lockedArtworkIds);
    const merged = [...candidates.eligible, ...candidates.blocked].map(
      (candidate) =>
        locked.has(candidate.artworkId)
          ? this.withActiveOrderLock(candidate)
          : candidate,
    );
    const eligible = merged.filter((candidate) => candidate.isEligible);
    const blocked = merged.filter((candidate) => !candidate.isEligible);

    return {
      eligible,
      blocked,
      total: merged.length,
      eligibleCount: eligible.length,
      blockedCount: blocked.length,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List blockchain-backed auction lots' })
  @ApiResponse({
    status: 200,
    description: 'Auction lots retrieved successfully',
    type: PaginatedAuctionsObject,
  })
  async getAuctions(@Query() query: GetAuctionsDto) {
    return sendRpc<PaginatedAuctionsObject>(
      this.ordersClient,
      { cmd: 'get_auctions' },
      query,
    );
  }

  @Get('seller/artwork-candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List seller-owned artwork candidates for auction creation' })
  @ApiResponse({
    status: 200,
    description: 'Seller auction artwork candidates retrieved successfully',
    type: SellerAuctionArtworkCandidatesResponse,
  })
  async getSellerArtworkCandidates(@Req() req: any) {
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new UnauthorizedException('Authenticated seller is required');
    }

    const candidates = await sendRpc<SellerAuctionArtworkCandidatesResponse>(
      this.artworkClient,
      { cmd: 'list_seller_auction_artwork_candidates' },
      { sellerId },
    );
    const artworkIds = [...candidates.eligible, ...candidates.blocked].map(
      (candidate) => candidate.artworkId,
    );
    const lockResult = artworkIds.length
      ? await sendRpc<{ artworkIds: string[] }>(
          this.ordersClient,
          { cmd: 'get_artwork_order_locks' },
          { sellerId, artworkIds },
        )
      : { artworkIds: [] };

    return this.mergeOrderLocks(candidates, lockResult.artworkIds);
  }

  @Get(':auctionId')
  @ApiOperation({ summary: 'Get a blockchain-backed auction lot by ID' })
  @ApiParam({
    name: 'auctionId',
    type: 'string',
    description: 'Auction ID or on-chain order ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Auction lot retrieved successfully',
    type: AuctionReadObject,
  })
  async getAuctionById(@Param('auctionId') auctionId: string) {
    return sendRpc<AuctionReadObject>(
      this.ordersClient,
      { cmd: 'get_auction_by_id' },
      { auctionId },
    );
  }
}
