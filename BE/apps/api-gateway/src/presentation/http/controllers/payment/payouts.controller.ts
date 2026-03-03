import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
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
import { MICROSERVICES } from '../../../../config';
import { JwtAuthGuard } from '@app/auth';
import { CreatePayoutDto } from '@app/common';
import { sendRpc } from '../../utils';

@ApiTags('Payouts')
@Controller('payments/payouts')
export class PayoutsController {
  constructor(
    @Inject(MICROSERVICES.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new payout request' })
  @ApiBody({ type: CreatePayoutDto })
  @ApiResponse({
    status: 201,
    description: 'Payout created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPayout(@Body() data: CreatePayoutDto) {
    return sendRpc(this.paymentsClient, { cmd: 'create_payout' }, data);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payout by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Payout ID' })
  @ApiResponse({
    status: 200,
    description: 'Payout retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async getPayout(@Param('id') payoutId: string) {
    return sendRpc(this.paymentsClient, { cmd: 'get_payout' }, { payoutId });
  }

  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payouts by seller ID' })
  @ApiParam({ name: 'sellerId', type: 'string', description: 'Seller ID' })
  @ApiResponse({
    status: 200,
    description: 'Payouts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPayoutsBySeller(@Param('sellerId') sellerId: string) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_payouts_by_seller' },
      { sellerId },
    );
  }

  @Get('my/payouts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my payouts as a seller' })
  @ApiResponse({
    status: 200,
    description: 'Payouts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPayouts(@Req() req: any) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_payouts_by_seller' },
      { sellerId: req.user?.id },
    );
  }
}
