import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuctionReadObject,
  GetAuctionsDto,
  PaginatedAuctionsObject,
} from '@app/common';
import { MICROSERVICES } from '../../../config';
import { sendRpc } from '../utils';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(
    @Inject(MICROSERVICES.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
  ) {}

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
