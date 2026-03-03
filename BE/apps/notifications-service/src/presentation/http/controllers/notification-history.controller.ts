import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateNotificationHistoryInput,
  ListNotificationHistoriesOptionsInput,
  NotificationHistory,
  NotificationStatus,
  UpdateNotificationHistoryInput,
} from '../../../domain';
import {
  CreateNotificationHistoryCommand,
  GetNotificationHistoryQuery,
  ListNotificationHistoriesQuery,
  UpdateNotificationHistoryCommand,
} from '../../../application';
import { NotificationStats } from '@app/common';

@ApiTags('notifications')
@Controller('notification-history')
export class NotificationHistoryController {
  private readonly logger = new Logger(NotificationHistoryController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get notification history by ID',
    description:
      'Retrieves detailed information about a specific notification history record',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the notification history record',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history retrieved successfully',
    type: NotificationHistory,
  })
  @ApiNotFoundResponse({
    description: 'Notification history not found',
  })
  async getNotificationHistory(
    @Param('id') id: string,
  ): Promise<NotificationHistory | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Getting notification history`,
      { id },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Notification history ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid notification history ID format');
      }

      const result = await this.queryBus.execute(
        new GetNotificationHistoryQuery(id),
      );

      if (!result) {
        this.logger.warn(
          `[NotificationHistoryController] [ReqID: ${requestId}] - Notification history not found`,
          { id },
        );
        return null;
      }

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification history retrieved successfully`,
        { id },
      );
      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to get notification history`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve notification history',
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List notification histories',
    description:
      'Retrieves a list of notification history records with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
    type: 'string',
  })
  @ApiQuery({
    name: 'channel',
    required: false,
    description: 'Filter by notification channel (email, sms, push, etc.)',
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by notification status (pending, sent, failed)',
    type: 'string',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip for pagination',
    type: 'number',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Maximum number of records to return',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification histories retrieved successfully',
    type: [NotificationHistory],
  })
  async listNotificationHistories(
    @Query() options?: ListNotificationHistoriesOptionsInput,
  ): Promise<NotificationHistory[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Listing notification histories`,
      { options },
    );

    try {
      if (options) {
        if (
          options.skip !== undefined &&
          (options.skip < 0 || !Number.isInteger(options.skip))
        ) {
          throw new BadRequestException('Skip must be a non-negative integer');
        }

        if (
          options.take !== undefined &&
          (options.take <= 0 ||
            options.take > 100 ||
            !Number.isInteger(options.take))
        ) {
          throw new BadRequestException(
            'Take must be a positive integer not exceeding 100',
          );
        }

        if (
          options.channel &&
          !['email', 'sms', 'push', 'in_app', 'webhook'].includes(
            options.channel,
          )
        ) {
          throw new BadRequestException(
            'Invalid channel. Allowed values: email, sms, push, in_app, webhook',
          );
        }

        if (
          options.status &&
          !['pending', 'sent', 'failed', 'retrying'].includes(options.status)
        ) {
          throw new BadRequestException(
            'Invalid status. Allowed values: pending, sent, failed, retrying',
          );
        }
      }

      const result = await this.queryBus.execute(
        new ListNotificationHistoriesQuery(options),
      );

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification histories listed successfully`,
        {
          count: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to list notification histories`,
        {
          options,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve notification histories',
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create notification history',
    description:
      'Creates a new notification history record to track a notification attempt',
  })
  @ApiBody({
    type: CreateNotificationHistoryInput,
    description: 'Notification history creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification history created successfully',
    type: NotificationHistory,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createNotificationHistory(
    @Body() input: CreateNotificationHistoryInput,
  ): Promise<NotificationHistory> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Creating notification history`,
      {
        userId: input?.userId,
        channel: input?.channel,
        triggerEvent: input?.triggerEvent,
      },
    );

    try {
      if (!input) {
        throw new BadRequestException('Notification history input is required');
      }

      if (!input.userId || input.userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (!input.channel || input.channel.trim() === '') {
        throw new BadRequestException('Channel is required');
      }

      if (!input.triggerEvent || input.triggerEvent.trim() === '') {
        throw new BadRequestException('Trigger event is required');
      }

      if (
        !['email', 'sms', 'push', 'in_app', 'webhook'].includes(input.channel)
      ) {
        throw new BadRequestException(
          'Invalid channel. Allowed values: email, sms, push, in_app, webhook',
        );
      }

      if (input.userId.length < 10) {
        throw new BadRequestException('Invalid user ID format');
      }

      if (input.triggerEvent.length > 100) {
        throw new BadRequestException(
          'Trigger event must be less than 100 characters',
        );
      }

      const result = await this.commandBus.execute(
        new CreateNotificationHistoryCommand(input),
      );

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification history created successfully`,
        {
          id: result.id,
          userId: input.userId,
          channel: input.channel,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to create notification history`,
        {
          userId: input?.userId,
          channel: input?.channel,
          triggerEvent: input?.triggerEvent,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to create notification history',
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update notification history',
    description:
      'Updates an existing notification history record with new information',
  })
  @ApiParam({
    name: 'id',
    description:
      'The unique identifier of the notification history record to update',
    type: 'string',
  })
  @ApiBody({
    type: UpdateNotificationHistoryInput,
    description: 'Notification history update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification history updated successfully',
    type: NotificationHistory,
  })
  @ApiNotFoundResponse({
    description: 'Notification history not found',
  })
  async updateNotificationHistory(
    @Param('id') id: string,
    @Body() input: UpdateNotificationHistoryInput,
  ): Promise<NotificationHistory | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Updating notification history`,
      { id },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Notification history ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid notification history ID format');
      }

      if (!input) {
        throw new BadRequestException('Update input is required');
      }

      if (input.status !== undefined) {
        if (!['pending', 'sent', 'failed', 'retrying'].includes(input.status)) {
          throw new BadRequestException(
            'Invalid status. Allowed values: pending, sent, failed, retrying',
          );
        }
      }

      if (input.sentAt !== undefined && input.sentAt !== null) {
        if (
          !(input.sentAt instanceof Date) &&
          isNaN(Date.parse(input.sentAt as any))
        ) {
          throw new BadRequestException(
            'Invalid sentAt value. Must be a valid date or null',
          );
        }
      }

      const result = await this.commandBus.execute(
        new UpdateNotificationHistoryCommand(id, input),
      );

      if (!result) {
        this.logger.warn(
          `[NotificationHistoryController] [ReqID: ${requestId}] - Notification history not found for update`,
          { id },
        );
        return null;
      }

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification history updated successfully`,
        { id },
      );
      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to update notification history`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to update notification history',
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get notifications by user ID',
    description:
      'Retrieves all notification history records for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The user ID to filter notifications by',
    type: 'string',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of records to skip for pagination',
    type: 'number',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Maximum number of records to return',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved successfully',
    type: [NotificationHistory],
  })
  async getNotificationsByUserId(
    @Param('userId') userId: string,
    @Query()
    options?: Pick<ListNotificationHistoriesOptionsInput, 'skip' | 'take'>,
  ): Promise<NotificationHistory[]> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Getting notifications by user ID`,
      { userId },
    );

    try {
      if (!userId || userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (userId.length < 10) {
        throw new BadRequestException('Invalid user ID format');
      }

      if (options) {
        if (
          options.skip !== undefined &&
          (options.skip < 0 || !Number.isInteger(options.skip))
        ) {
          throw new BadRequestException('Skip must be a non-negative integer');
        }

        if (
          options.take !== undefined &&
          (options.take <= 0 ||
            options.take > 100 ||
            !Number.isInteger(options.take))
        ) {
          throw new BadRequestException(
            'Take must be a positive integer not exceeding 100',
          );
        }
      }

      const userOptions = { ...options, userId };
      const result = await this.queryBus.execute(
        new ListNotificationHistoriesQuery(userOptions),
      );

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - User notifications retrieved successfully`,
        {
          userId,
          count: result.length,
        },
      );

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to get user notifications`,
        {
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve user notifications',
      );
    }
  }

  @Get('stats/summary')
  @ApiOperation({
    summary: 'Get notification statistics',
    description:
      'Returns summary statistics about notifications including counts by status and channel',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics retrieved successfully',
    type: Object,
  })
  async getNotificationStats(): Promise<NotificationStats> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Getting notification statistics`,
    );

    try {
      // In a real implementation, this would query the database for statistics
      // For now, we'll return mock data
      const stats: NotificationStats = {
        total: 0,
        byStatus: {
          pending: 0,
          sent: 0,
          failed: 0,
        },
        byChannel: {
          email: 0,
          sms: 0,
          push: 0,
          in_app: 0,
          webhook: 0,
        },
        recent: {
          last24h: 0,
          last7d: 0,
          last30d: 0,
        },
      };

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification statistics retrieved successfully`,
      );
      return stats;
    } catch (error) {
      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to get notification statistics`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve notification statistics',
      );
    }
  }

  @Put(':id/mark-sent')
  @ApiOperation({
    summary: 'Mark notification as sent',
    description:
      'Updates the notification status to sent and records when it was sent',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the notification to mark as sent',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as sent successfully',
    type: NotificationHistory,
  })
  @ApiNotFoundResponse({
    description: 'Notification not found',
  })
  async markNotificationAsSent(
    @Param('id') id: string,
  ): Promise<NotificationHistory | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Marking notification as sent`,
      { id },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Notification ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid notification ID format');
      }

      const updateInput: UpdateNotificationHistoryInput = {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      };

      const result = await this.commandBus.execute(
        new UpdateNotificationHistoryCommand(id, updateInput),
      );

      if (!result) {
        this.logger.warn(
          `[NotificationHistoryController] [ReqID: ${requestId}] - Notification not found for marking as sent`,
          { id },
        );
        return null;
      }

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification marked as sent successfully`,
        { id },
      );
      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to mark notification as sent`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to mark notification as sent',
      );
    }
  }

  @Put(':id/mark-failed')
  @ApiOperation({
    summary: 'Mark notification as failed',
    description:
      'Updates the notification status to failed and records the failure reason',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the notification to mark as failed',
    type: 'string',
  })
  @ApiBody({
    description: 'Failure information',
    schema: {
      type: 'object',
      properties: {
        failReason: { type: 'string', description: 'Reason for the failure' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as failed successfully',
    type: NotificationHistory,
  })
  @ApiNotFoundResponse({
    description: 'Notification not found',
  })
  async markNotificationAsFailed(
    @Param('id') id: string,
    @Body() body: { failReason?: string },
  ): Promise<NotificationHistory | null> {
    const requestId = uuidv4();
    this.logger.log(
      `[NotificationHistoryController] [ReqID: ${requestId}] - Marking notification as failed`,
      { id, failReason: body?.failReason },
    );

    try {
      if (!id || id.trim() === '') {
        throw new BadRequestException('Notification ID is required');
      }

      if (id.length < 10) {
        throw new BadRequestException('Invalid notification ID format');
      }

      const updateInput: UpdateNotificationHistoryInput = {
        status: NotificationStatus.FAILED,
        failureReason: body?.failReason || 'Unknown error',
      };

      const result = await this.commandBus.execute(
        new UpdateNotificationHistoryCommand(id, updateInput),
      );

      if (!result) {
        this.logger.warn(
          `[NotificationHistoryController] [ReqID: ${requestId}] - Notification not found for marking as failed`,
          { id },
        );
        return null;
      }

      this.logger.log(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Notification marked as failed successfully`,
        { id },
      );
      return result;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `[NotificationHistoryController] [ReqID: ${requestId}] - Failed to mark notification as failed`,
        {
          id,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to mark notification as failed',
      );
    }
  }
}
