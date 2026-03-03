import { Injectable, Logger } from '@nestjs/common';
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { v4 as uuidv4 } from 'uuid';

import {
  ApiClient,
  Logging,
  Retry,
  Timeout,
} from '../decorators/api-client.decorator';
import {
  ApiClientException,
  ApiTimeoutException,
  createApiException,
  NetworkException,
  ServiceUnavailableException,
  BadRequestException,
} from '../exceptions/api-client.exception';
import {
  ApiClientOptions,
  ApiResponse,
  HttpMethod,
  IApiClient,
  RequestConfig,
  ResponseMetadata,
} from '../interfaces/api-client.interface';
import {
  CreateNotificationHistoryInput,
  ListNotificationHistoriesOptionsInput,
  NotificationHistoryObject,
  NotificationStats,
  UpdateNotificationHistoryInput,
} from '@app/common';

/**
 * Extended Axios request config with metadata
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    requestId: string;
    startTime: number;
  };
}

/**
 * Professional Notifications Service API Client
 * Handles communication with the notifications microservice
 */
@Injectable()
@ApiClient({
  serviceName: 'notifications-service',
  defaultBaseUrl: 'http://localhost:3002',
  defaultPort: 3002,
  version: 'v1',
  description: 'Notifications Service API Client',
  healthEndpoint: '/health',
})
@Retry({ maxAttempts: 3, baseDelay: 1000 })
@Timeout({ connect: 5000, read: 30000, request: 35000 })
@Logging({
  level: 'info' as any,
  includePayloads: false,
  includeHeaders: false,
})
export class NotificationsClient implements IApiClient {
  public readonly serviceName = 'notifications-service';
  protected readonly logger = new Logger(NotificationsClient.name);

  private readonly axiosInstance: AxiosInstance;
  private readonly config: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.config = {
      baseUrl: 'http://localhost:3002',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      version: 'v1',
      ...options,
    };

    this.axiosInstance = this.createAxiosInstance();
    this.logInitialization();
  }

  get baseUrl(): string {
    return this.config.baseUrl || this.config.baseUrl!;
  }

  get timeout(): number {
    return this.config.timeout || 30000;
  }

  /**
   * Create and configure Axios instance
   */
  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: `${this.baseUrl}/api/${this.config.version || 'v1'}`,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Artium-NotificationsClient/1.0.0',
        ...this.config.headers,
      },
    });

    this.setupInterceptors(instance);
    return instance;
  }

  /**
   * Setup request/response interceptors for logging and error handling
   */
  private setupInterceptors(instance: AxiosInstance): void {
    // Request interceptor
    instance.interceptors.request.use(
      async (config: ExtendedAxiosRequestConfig) => {
        const requestId = uuidv4();
        config.headers = config.headers || {};
        config.headers['X-Request-ID'] = requestId;
        config.metadata = { requestId, startTime: Date.now() };

        this.logger.debug(
          `[NotificationsClient] [ReqID: ${requestId}] - Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            requestId,
            url: config.url,
            method: config.method,
          },
        );

        return config;
      },
      async (error) => {
        this.logger.error('[NotificationsClient] - Request interceptor error', {
          error: error.message,
        });
        return Promise.reject(error);
      },
    );

    // Response interceptor
    instance.interceptors.response.use(
      async (response) => {
        const config = response.config as ExtendedAxiosRequestConfig;
        const metadata = (config?.metadata ?? {}) as {
          requestId?: string;
          startTime?: number;
        };
        const requestId = metadata.requestId ?? 'unknown';
        const responseTime = Date.now() - (metadata.startTime || Date.now());

        this.logger.debug(
          `[NotificationsClient] [ReqID: ${requestId}] - Response: ${response.status} ${response.statusText}`,
          {
            requestId,
            status: response.status,
            responseTime: `${responseTime}ms`,
            url: response.config.url,
          },
        );

        (response as any).metadata = {
          statusCode: response.status,
          headers: response.headers,
          requestId,
          responseTime,
          timestamp: new Date(),
        } as ResponseMetadata;

        return response;
      },
      async (error) => {
        const requestId = error.config?.metadata?.requestId || uuidv4();

        this.logger.error(
          `[NotificationsClient] [ReqID: ${requestId}] - Response error`,
          {
            requestId,
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
          },
        );

        // Enhance error with requestId
        if (error.config) {
          const config = error.config as ExtendedAxiosRequestConfig;
          config.metadata = config.metadata ?? {
            requestId,
            startTime: Date.now(),
          };
          config.metadata.requestId = requestId;
        }

        return Promise.reject(this.mapAxiosErrorToApiException(error));
      },
    );
  }

  /**
   * Map Axios errors to custom API client exceptions
   */
  private mapAxiosErrorToApiException(error: any): ApiClientException {
    const requestId = error.config?.metadata?.requestId;
    const retries = error.config?.__retryCount || 0;

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiTimeoutException(
        this.serviceName,
        this.timeout,
        requestId,
        retries,
      );
    }

    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      return new ServiceUnavailableException(
        this.serviceName,
        requestId,
        retries,
      );
    }

    if (error.response) {
      return createApiException(
        error.response.status,
        this.serviceName,
        error.response.data?.message || 'Request failed',
        requestId,
        retries,
      );
    }

    return new NetworkException(this.serviceName, error, requestId, retries);
  }

  /**
   * Log client initialization details
   */
  private logInitialization(): void {
    this.logger.log(`[NotificationsClient] Initialized`, {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      retryAttempts: this.config.retryAttempts,
    });
  }

  /**
   * Health check to verify service availability
   */
  async healthCheck(): Promise<boolean> {
    const requestId = uuidv4();
    this.logger.debug(
      `[NotificationsClient] [ReqID: ${requestId}] - Health check`,
      { requestId },
    );

    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `[NotificationsClient] [ReqID: ${requestId}] - Health check failed`,
        {
          requestId,
          error: error.message,
        },
      );
      return false;
    }
  }

  /**
   * Generic request method with retry logic
   */
  private async makeRequest<T = any>(
    config: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const requestId = config.requestId || uuidv4();
    const startTime = Date.now();

    try {
      const response: AxiosResponse<T> =
        await this.axiosInstance.request(config);

      return {
        data: response.data,
        success: true,
        timestamp: new Date(),
        request_id: requestId,
      };
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] [ReqID: ${requestId}] - Request failed after retry`,
        {
          requestId,
          error: error.message,
          duration: `${Date.now() - startTime}ms`,
        },
      );

      throw error;
    }
  }

  /**
   * Get a single notification history record by ID
   * @param id The notification history ID
   * @returns Notification history record or null if not found
   */
  async getNotificationHistoryObject(
    id: string,
  ): Promise<ApiResponse<NotificationHistoryObject | null>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Notification history ID is required',
      ]);
    }

    this.logger.debug(
      `[NotificationsClient] Getting notification history by ID`,
      { id },
    );

    try {
      const response = await this.makeRequest<NotificationHistoryObject>({
        method: HttpMethod.GET,
        url: `/notification-history/${id}`,
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] Notification history retrieved successfully`,
        { id },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to get notification history`,
        { id, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Get a list of notification history records with optional filtering
   * @param options Query options for filtering and pagination
   * @returns Array of notification history records
   */
  async listNotificationHistories(
    options?: ListNotificationHistoriesOptionsInput,
  ): Promise<ApiResponse<NotificationHistoryObject[]>> {
    this.logger.debug(`[NotificationsClient] Listing notification histories`, {
      options,
    });

    try {
      const response = await this.makeRequest<NotificationHistoryObject[]>({
        method: HttpMethod.GET,
        url: '/notification-history',
        params: options,
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] Notification histories listed successfully`,
        {
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to list notification histories`,
        {
          options,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Create a new notification history record
   * @param input Notification history data to create
   * @returns Created notification history record
   */
  async createNotificationHistoryObject(
    input: CreateNotificationHistoryInput,
  ): Promise<ApiResponse<NotificationHistoryObject>> {
    this.logger.debug(`[NotificationsClient] Creating notification history`, {
      userId: input.userId,
      channel: input.channel,
      triggerEvent: input.triggerEvent,
    });

    try {
      // Input validation
      if (!input?.userId || !input.channel || !input.triggerEvent) {
        throw new BadRequestException(this.serviceName, [
          'User ID, channel, and trigger event are required',
        ]);
      }

      if (input.userId.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'User ID cannot be empty',
        ]);
      }

      if (input.channel.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'Channel cannot be empty',
        ]);
      }

      if (input.triggerEvent.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'Trigger event cannot be empty',
        ]);
      }

      const response = await this.makeRequest<NotificationHistoryObject>({
        method: HttpMethod.POST,
        url: '/notification-history',
        data: input,
        requestId: uuidv4(),
      });

      this.logger.log(
        `[NotificationsClient] Notification history created successfully`,
        {
          id: response.data?.id,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to create notification history`,
        {
          userId: input.userId,
          channel: input.channel,
          triggerEvent: input.triggerEvent,
          error: error.message,
        },
      );
      throw error;
    }
  }

  /**
   * Update an existing notification history record
   * @param id The notification history ID to update
   * @param input Updated notification history data
   * @returns Updated notification history record or null if not found
   */
  async updateNotificationHistoryObject(
    id: string,
    input: UpdateNotificationHistoryInput,
  ): Promise<ApiResponse<NotificationHistoryObject | null>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Notification history ID is required',
      ]);
    }

    this.logger.debug(`[NotificationsClient] Updating notification history`, {
      id,
    });

    try {
      const response = await this.makeRequest<NotificationHistoryObject>({
        method: HttpMethod.PUT,
        url: `/notification-history/${id}`,
        data: input,
        requestId: uuidv4(),
      });

      this.logger.log(
        `[NotificationsClient] Notification history updated successfully`,
        { id },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to update notification history`,
        { id, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Get notification history statistics
   * @returns Statistics about notification history records
   */
  async getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
    this.logger.debug(`[NotificationsClient] Getting notification statistics`);

    try {
      const response = await this.makeRequest<NotificationStats>({
        method: HttpMethod.GET,
        url: '/notification-history/stats/summary',
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] Notification statistics retrieved successfully`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to get notification statistics`,
        { error: error.message },
      );
      throw error;
    }
  }

  /**
   * Get notification histories by user ID
   * @param userId The user ID to filter by
   * @param options Additional query options
   * @returns Array of notification history records for the specified user
   */
  async getNotificationsByUserId(
    userId: string,
    options?: ListNotificationHistoriesOptionsInput,
  ): Promise<ApiResponse<NotificationHistoryObject[]>> {
    if (!userId || userId.trim() === '') {
      throw new BadRequestException(this.serviceName, ['User ID is required']);
    }

    this.logger.debug(
      `[NotificationsClient] Getting notifications by user ID`,
      { userId },
    );

    try {
      const userOptions = { ...options, userId };
      const response = await this.makeRequest<NotificationHistoryObject[]>({
        method: HttpMethod.GET,
        url: `/notification-history/user/${userId}`,
        params: userOptions,
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] User notifications retrieved successfully`,
        {
          userId,
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to get user notifications`,
        { userId, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Mark notification as sent
   * @param id Notification ID
   * @returns Updated notification record
   */
  async markNotificationAsSent(
    id: string,
  ): Promise<ApiResponse<NotificationHistoryObject | null>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Notification ID is required',
      ]);
    }

    this.logger.debug(`[NotificationsClient] Marking notification as sent`, {
      id,
    });

    try {
      const response = await this.makeRequest<NotificationHistoryObject>({
        method: HttpMethod.PUT,
        url: `/notification-history/${id}/mark-sent`,
        requestId: uuidv4(),
      });

      this.logger.log(
        `[NotificationsClient] Notification marked as sent successfully`,
        { id },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to mark notification as sent`,
        { id, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Mark notification as failed
   * @param id Notification ID
   * @param failReason Reason for failure
   * @returns Updated notification record
   */
  async markNotificationAsFailed(
    id: string,
    failReason?: string,
  ): Promise<ApiResponse<NotificationHistoryObject | null>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Notification ID is required',
      ]);
    }

    this.logger.debug(`[NotificationsClient] Marking notification as failed`, {
      id,
      failReason,
    });

    try {
      const response = await this.makeRequest<NotificationHistoryObject>({
        method: HttpMethod.PUT,
        url: `/notification-history/${id}/mark-failed`,
        data: { failReason },
        requestId: uuidv4(),
      });

      this.logger.log(
        `[NotificationsClient] Notification marked as failed successfully`,
        { id },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to mark notification as failed`,
        { id, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Get failed notifications for retry processing
   * @param limit Maximum number of failed notifications to return
   * @returns Array of failed notification records
   */
  async getFailedNotifications(
    limit: number = 10,
  ): Promise<ApiResponse<NotificationHistoryObject[]>> {
    if (limit <= 0 || limit > 100) {
      throw new BadRequestException(this.serviceName, [
        'Limit must be between 1 and 100',
      ]);
    }

    this.logger.debug(
      `[NotificationsClient] Getting failed notifications for retry`,
      { limit },
    );

    try {
      const response = await this.makeRequest<NotificationHistoryObject[]>({
        method: HttpMethod.GET,
        url: '/notification-history/failed',
        params: { limit },
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] Failed notifications retrieved successfully`,
        {
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to get failed notifications`,
        { limit, error: error.message },
      );
      throw error;
    }
  }

  /**
   * Get pending notifications for processing
   * @param limit Maximum number of pending notifications to return
   * @returns Array of pending notification records
   */
  async getPendingNotifications(
    limit: number = 20,
  ): Promise<ApiResponse<NotificationHistoryObject[]>> {
    if (limit <= 0 || limit > 100) {
      throw new BadRequestException(this.serviceName, [
        'Limit must be between 1 and 100',
      ]);
    }

    this.logger.debug(`[NotificationsClient] Getting pending notifications`, {
      limit,
    });

    try {
      const response = await this.makeRequest<NotificationHistoryObject[]>({
        method: HttpMethod.GET,
        url: '/notification-history/pending',
        params: { limit },
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[NotificationsClient] Pending notifications retrieved successfully`,
        {
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(
        `[NotificationsClient] Failed to get pending notifications`,
        { limit, error: error.message },
      );
      throw error;
    }
  }
}
