import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
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
import {
  CreateInvoiceDto,
  SaveInvoiceDto,
  UpdateInvoiceDto,
} from '@app/common';
import { sendRpc } from '../../utils';

@ApiTags('Invoices')
@Controller('payments/invoices')
export class InvoicesController {
  constructor(
    @Inject(MICROSERVICES.PAYMENTS_SERVICE)
    private readonly paymentsClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createInvoice(@Body() data: CreateInvoiceDto) {
    return sendRpc(this.paymentsClient, { cmd: 'create_invoice' }, data);
  }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save an invoice (create or update)' })
  @ApiBody({ type: SaveInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Invoice saved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found (when updating)',
  })
  async saveInvoice(@Body() data: SaveInvoiceDto) {
    return sendRpc(this.paymentsClient, { cmd: 'save_invoice' }, data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiParam({ name: 'id', type: 'string', description: 'Invoice ID' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async updateInvoice(
    @Param('id') invoiceId: string,
    @Body() data: UpdateInvoiceDto,
  ) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'update_invoice' },
      { invoiceId, data },
    );
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an invoice' })
  @ApiParam({ name: 'id', type: 'string', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 409, description: 'Invoice cannot be cancelled' })
  async cancelInvoice(@Param('id') invoiceId: string) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'cancel_invoice' },
      { invoiceId },
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Param('id') invoiceId: string) {
    return sendRpc(this.paymentsClient, { cmd: 'get_invoice' }, { invoiceId });
  }

  @Get('seller/:sellerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoices by seller ID' })
  @ApiParam({ name: 'sellerId', type: 'string', description: 'Seller ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInvoicesBySeller(@Param('sellerId') sellerId: string) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_invoices_by_seller' },
      { sellerId },
    );
  }

  @Get('collector/:collectorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoices by collector ID' })
  @ApiParam({
    name: 'collectorId',
    type: 'string',
    description: 'Collector ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInvoicesByCollector(@Param('collectorId') collectorId: string) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_invoices_by_collector' },
      { collectorId },
    );
  }

  @Get('my/seller')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my invoices as a seller' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMySellerInvoices(@Req() req: any) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_invoices_by_seller' },
      { sellerId: req.user?.id },
    );
  }

  @Get('my/collector')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my invoices as a collector/buyer' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyCollectorInvoices(@Req() req: any) {
    return sendRpc(
      this.paymentsClient,
      { cmd: 'get_invoices_by_collector' },
      { collectorId: req.user?.id },
    );
  }
}
