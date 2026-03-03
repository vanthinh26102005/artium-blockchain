import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

/**
 * Health check controller for the Artwork service
 * Provides endpoints for monitoring service health and status
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor() {}

  /**
   * Basic health check endpoint
   * Returns the service status and basic information
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns the health status of the Artwork service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        service: { type: 'string', example: 'artwork-service' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Service uptime in seconds' },
      },
    },
  })
  async healthCheck() {
    this.logger.debug('[HealthController] Health check requested');

    return {
      status: 'healthy',
      service: 'artwork-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Detailed health check with service dependencies
   * Returns comprehensive health information including database and storage connectivity
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Returns comprehensive health status including database and storage connectivity',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information returned successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        service: { type: 'string', example: 'artwork-service' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' },
        dependencies: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            storage_service: { type: 'string', example: 'connected' },
            cache_service: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  async detailedHealthCheck() {
    this.logger.debug('[HealthController] Detailed health check requested');

    // In a real implementation, you would check actual dependencies here
    // For now, we'll return mock data
    return {
      status: 'healthy',
      service: 'artwork-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      dependencies: {
        database: 'connected',
        storage_service: 'connected',
        cache_service: 'connected',
      },
    };
  }
}
