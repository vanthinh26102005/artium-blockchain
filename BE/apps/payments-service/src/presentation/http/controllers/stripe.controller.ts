import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  HttpException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatePaymentIntentDTO,
  ConfirmPaymentIntentDTO,
  CreateCustomerDTO,
  CreateRefundDTO,
  AttachPaymentMethodDTO,
} from '../../../domain/dtos/stripe';
import {
  CreateStripePaymentIntentCommand,
  ConfirmStripePaymentIntentCommand,
  CreateStripeCustomerCommand,
  CreateStripeRefundCommand,
  AttachStripePaymentMethodCommand,
} from '../../../application/commands/stripe';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post('payment-intents')
  @ApiOperation({
    summary: 'Create Stripe payment intent',
    description: 'Creates a new Stripe payment intent for processing a payment',
  })
  @ApiBody({
    type: CreatePaymentIntentDTO,
    description: 'Payment intent creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createPaymentIntent(@Body() input: CreatePaymentIntentDTO) {
    const requestId = uuidv4();
    this.logger.log(
      `[StripeController] [ReqID: ${requestId}] - Creating payment intent for user: ${input.userId}`,
    );

    try {
      if (!input.userId || input.userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (input.amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      if (!input.currency || input.currency.length !== 3) {
        throw new BadRequestException(
          'Currency must be a valid 3-letter ISO code',
        );
      }

      const result = await this.commandBus.execute(
        new CreateStripePaymentIntentCommand(input),
      );

      this.logger.log(
        `[StripeController] [ReqID: ${requestId}] - Payment intent created successfully: ${result.id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[StripeController] [ReqID: ${requestId}] - Unexpected error: create payment intent`,
        {
          userId: input?.userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  @Post('payment-intents/confirm')
  @ApiOperation({
    summary: 'Confirm Stripe payment intent',
    description: 'Confirms a Stripe payment intent to complete the payment',
  })
  @ApiBody({
    type: ConfirmPaymentIntentDTO,
    description: 'Payment intent confirmation data',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent confirmed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async confirmPaymentIntent(@Body() input: ConfirmPaymentIntentDTO) {
    const requestId = uuidv4();
    this.logger.log(
      `[StripeController] [ReqID: ${requestId}] - Confirming payment intent: ${input.paymentIntentId}`,
    );

    try {
      if (!input.paymentIntentId || input.paymentIntentId.trim() === '') {
        throw new BadRequestException('Payment intent ID is required');
      }

      const result = await this.commandBus.execute(
        new ConfirmStripePaymentIntentCommand(input),
      );

      this.logger.log(
        `[StripeController] [ReqID: ${requestId}] - Payment intent confirmed successfully`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[StripeController] [ReqID: ${requestId}] - Unexpected error: confirm payment intent`,
        {
          paymentIntentId: input?.paymentIntentId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to confirm payment intent',
      );
    }
  }

  @Post('customers')
  @ApiOperation({
    summary: 'Create Stripe customer',
    description:
      'Creates a new Stripe customer for recurring billing or saved payment methods',
  })
  @ApiBody({
    type: CreateCustomerDTO,
    description: 'Customer creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createCustomer(@Body() input: CreateCustomerDTO) {
    const requestId = uuidv4();
    this.logger.log(
      `[StripeController] [ReqID: ${requestId}] - Creating customer for user: ${input.userId}`,
    );

    try {
      if (!input.userId || input.userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      const result = await this.commandBus.execute(
        new CreateStripeCustomerCommand(input),
      );

      this.logger.log(
        `[StripeController] [ReqID: ${requestId}] - Customer created successfully: ${result.stripeCustomerId}`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[StripeController] [ReqID: ${requestId}] - Unexpected error: create customer`,
        {
          userId: input?.userId,
          email: input?.email,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  @Post('refunds')
  @ApiOperation({
    summary: 'Create Stripe refund',
    description: 'Creates a refund for a previously completed payment',
  })
  @ApiBody({
    type: CreateRefundDTO,
    description: 'Refund creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Refund created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createRefund(@Body() input: CreateRefundDTO) {
    const requestId = uuidv4();
    this.logger.log(
      `[StripeController] [ReqID: ${requestId}] - Creating refund for payment intent: ${input.paymentIntentId}`,
    );

    try {
      if (!input.paymentIntentId || input.paymentIntentId.trim() === '') {
        throw new BadRequestException('Payment intent ID is required');
      }

      if (!input.transactionId || input.transactionId.trim() === '') {
        throw new BadRequestException('Transaction ID is required');
      }

      if (input.amount !== undefined && input.amount <= 0) {
        throw new BadRequestException('Refund amount must be greater than 0');
      }

      const result = await this.commandBus.execute(
        new CreateStripeRefundCommand(input),
      );

      this.logger.log(
        `[StripeController] [ReqID: ${requestId}] - Refund created successfully`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[StripeController] [ReqID: ${requestId}] - Unexpected error: create refund`,
        {
          paymentIntentId: input?.paymentIntentId,
          transactionId: input?.transactionId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to create refund');
    }
  }

  @Post('payment-methods/attach')
  @ApiOperation({
    summary: 'Attach payment method to customer',
    description:
      'Attaches a Stripe payment method to a customer for future use',
  })
  @ApiBody({
    type: AttachPaymentMethodDTO,
    description: 'Payment method attachment data',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment method attached successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async attachPaymentMethod(@Body() input: AttachPaymentMethodDTO) {
    const requestId = uuidv4();
    this.logger.log(
      `[StripeController] [ReqID: ${requestId}] - Attaching payment method for user: ${input.userId}`,
    );

    try {
      if (!input.userId || input.userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (!input.stripeCustomerId || input.stripeCustomerId.trim() === '') {
        throw new BadRequestException('Stripe customer ID is required');
      }

      if (!input.paymentMethodId || input.paymentMethodId.trim() === '') {
        throw new BadRequestException('Payment method ID is required');
      }

      const result = await this.commandBus.execute(
        new AttachStripePaymentMethodCommand(input),
      );

      this.logger.log(
        `[StripeController] [ReqID: ${requestId}] - Payment method attached successfully: ${result.id}`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[StripeController] [ReqID: ${requestId}] - Unexpected error: attach payment method`,
        {
          userId: input?.userId,
          stripeCustomerId: input?.stripeCustomerId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to attach payment method');
    }
  }
}
