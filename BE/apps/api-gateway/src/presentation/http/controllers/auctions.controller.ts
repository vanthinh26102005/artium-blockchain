import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import {
  AuctionReadObject,
  AttachSellerAuctionStartTxDto,
  GetAuctionsDto,
  PaginatedAuctionsObject,
  SellerAuctionStartStatusObject,
  SellerAuctionArtworkCandidateObject,
  SellerAuctionArtworkCandidatesResponse,
  SellerAuctionArtworkEligibilityReason,
  SellerAuctionArtworkRecoveryActionObject,
  SellerProfilePayload,
  StartSellerAuctionDto,
  UserPayload,
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
    @Inject(MICROSERVICES.IDENTITY_SERVICE)
    private readonly identityClient: ClientProxy,
  ) {}

  private async getSellerArtworkCandidatesWithLocks(
    sellerId: string,
  ): Promise<SellerAuctionArtworkCandidatesResponse> {
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

  private async getSellerIdentityContext(
    sellerId: string,
  ): Promise<{ user: UserPayload; sellerProfile: SellerProfilePayload }> {
    const [user, sellerProfile] = await Promise.all([
      sendRpc<UserPayload>(
        this.identityClient,
        { cmd: 'get_user_by_id' },
        { userId: sellerId },
      ),
      sendRpc<SellerProfilePayload>(
        this.identityClient,
        { cmd: 'get_seller_profile_by_user_id' },
        { userId: sellerId },
      ),
    ]);

    if (!user.walletAddress) {
      throw new ConflictException(
        'Connect and save a seller wallet before starting an auction.',
      );
    }

    if (!sellerProfile.isActive) {
      throw new ConflictException(
        'Activate your seller profile before starting an auction.',
      );
    }

    return { user, sellerProfile };
  }

  private async getArtworkStartDetails(artworkId: string): Promise<{
    id: string;
    ipfsMetadataHash?: string | null;
  }> {
    return sendRpc<{ id: string; ipfsMetadataHash?: string | null }>(
      this.artworkClient,
      { cmd: 'get_artwork_by_id' },
      { id: artworkId },
    );
  }

  private getRequiredSellerId(req: any): string {
    const sellerId = req.user?.id;
    if (!sellerId) {
      throw new UnauthorizedException('Authenticated seller is required');
    }
    return sellerId;
  }

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
  @ApiOperation({
    summary: 'List seller-owned artwork candidates for auction creation',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller auction artwork candidates retrieved successfully',
    type: SellerAuctionArtworkCandidatesResponse,
  })
  async getSellerArtworkCandidates(@Req() req: any) {
    const sellerId = this.getRequiredSellerId(req);
    return this.getSellerArtworkCandidatesWithLocks(sellerId);
  }

  @Post('seller/start-attempts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or reuse a seller auction start attempt' })
  @ApiBody({ type: StartSellerAuctionDto })
  @ApiResponse({
    status: 201,
    description: 'Seller auction start attempt created or reused',
    type: SellerAuctionStartStatusObject,
  })
  async startSellerAuction(
    @Body() input: StartSellerAuctionDto,
    @Req() req: any,
  ): Promise<SellerAuctionStartStatusObject> {
    const sellerId = this.getRequiredSellerId(req);
    const candidates = await this.getSellerArtworkCandidatesWithLocks(sellerId);
    const candidate = [...candidates.eligible, ...candidates.blocked].find(
      (item) => item.artworkId === input.artworkId,
    );

    if (!candidate) {
      throw new NotFoundException(
        'Selected artwork was not found for this seller.',
      );
    }
    if (!candidate.isEligible) {
      throw new ConflictException(
        candidate.recoveryActions[0]?.actionLabel ??
          'Artwork is no longer eligible for auction start.',
      );
    }
    if (!input.economicsLockedAcknowledged) {
      throw new BadRequestException(
        'Confirm that auction economics lock after activation.',
      );
    }

    const [{ user }, artwork] = await Promise.all([
      this.getSellerIdentityContext(sellerId),
      this.getArtworkStartDetails(input.artworkId),
    ]);

    if (!artwork.ipfsMetadataHash) {
      throw new ConflictException(
        'Artwork metadata must be available on IPFS before starting an auction.',
      );
    }

    return sendRpc<SellerAuctionStartStatusObject>(
      this.ordersClient,
      { cmd: 'start_seller_auction' },
      {
        ...input,
        sellerId,
        walletAddress: user.walletAddress,
        artworkTitle: candidate.title,
        creatorName: candidate.creatorName,
        thumbnailUrl: candidate.thumbnailUrl,
        ipfsMetadataHash: artwork.ipfsMetadataHash,
      },
    );
  }

  @Patch('seller/start-attempts/:attemptId/tx')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Attach the seller wallet transaction to a start attempt',
  })
  @ApiParam({
    name: 'attemptId',
    type: 'string',
    description: 'Seller auction start attempt ID',
  })
  @ApiBody({ type: AttachSellerAuctionStartTxDto })
  @ApiResponse({
    status: 200,
    description: 'Seller auction start transaction attached',
    type: SellerAuctionStartStatusObject,
  })
  @HttpCode(HttpStatus.OK)
  async attachSellerAuctionStartTx(
    @Param('attemptId') attemptId: string,
    @Body() input: AttachSellerAuctionStartTxDto,
    @Req() req: any,
  ): Promise<SellerAuctionStartStatusObject> {
    const sellerId = this.getRequiredSellerId(req);
    return sendRpc<SellerAuctionStartStatusObject>(
      this.ordersClient,
      { cmd: 'attach_seller_auction_start_tx' },
      {
        attemptId,
        sellerId,
        ...input,
      },
    );
  }

  @Get('seller/start-status/:artworkId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get persisted seller auction start status for an artwork',
  })
  @ApiParam({
    name: 'artworkId',
    type: 'string',
    description: 'Artwork ID tied to the seller auction start attempt',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller auction start status retrieved',
    type: SellerAuctionStartStatusObject,
  })
  async getSellerAuctionStartStatus(
    @Param('artworkId') artworkId: string,
    @Req() req: any,
  ): Promise<SellerAuctionStartStatusObject | null> {
    const sellerId = this.getRequiredSellerId(req);
    return sendRpc<SellerAuctionStartStatusObject | null>(
      this.ordersClient,
      { cmd: 'get_seller_auction_start_status' },
      { sellerId, artworkId },
    );
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
