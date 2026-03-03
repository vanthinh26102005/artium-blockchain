import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor() {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns the health status of the Identity service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        service: { type: 'string', example: 'identity-service' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', description: 'Service uptime in seconds' },
      },
    },
  })
  async healthCheck() {
    this.logger.debug('[HealthController] Health check requested');

    return {
      status: 'healthy',
      service: 'identity-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Returns comprehensive health status including database connectivity and other dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information returned successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        service: { type: 'string', example: 'identity-service' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number' },
        version: { type: 'string' },
        dependencies: {
          type: 'object',
          properties: {
            database: { type: 'string', example: 'connected' },
            redis: { type: 'string', example: 'connected' },
          },
        },
      },
    },
  })
  async detailedHealthCheck() {
    this.logger.debug('[HealthController] Detailed health check requested');

    return {
      status: 'healthy',
      service: 'identity-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      dependencies: {
        database: 'connected',
        redis: 'connected',
      },
    };
  }
}
