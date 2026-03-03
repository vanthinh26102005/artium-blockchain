import { Injectable, Logger } from '@nestjs/common';
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { v4 as uuidv4 } from 'uuid';

import {
  ArtworkObject,
  CreateArtworkInput,
  FindManyArtworkInput,
  UpdateArtworkInput,
} from '@app/common';
import {
  ApiClient,
  Logging,
  Retry,
  Timeout,
} from '../decorators/api-client.decorator';
import {
  ApiClientException,
  ApiTimeoutException,
  BadRequestException,
  createApiException,
  NetworkException,
  ServiceUnavailableException,
} from '../exceptions/api-client.exception';
import {
  ApiClientOptions,
  ApiResponse,
  HttpMethod,
  IApiClient,
  RequestConfig,
  ResponseMetadata,
} from '../interfaces/api-client.interface';

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
 * Professional Artwork Service API Client
 * Handles communication with the artwork microservice
 */
@Injectable()
@ApiClient({
  serviceName: 'artwork-service',
  defaultBaseUrl: 'http://localhost:3003',
  defaultPort: 3003,
  version: 'v1',
  description: 'Artwork Service API Client',
  healthEndpoint: '/health',
})
@Retry({ maxAttempts: 3, baseDelay: 1000 })
@Timeout({ connect: 5000, read: 30000, request: 35000 })
@Logging({
  level: 'info' as any,
  includePayloads: false,
  includeHeaders: false,
})
export class ArtworkClient implements IApiClient {
  public readonly serviceName = 'artwork-service';
  protected readonly logger = new Logger(ArtworkClient.name);

  private readonly axiosInstance: AxiosInstance;
  private readonly config: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.config = {
      baseUrl: 'http://localhost:3003',
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
        'User-Agent': 'Artium-ArtworkClient/1.0.0',
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
          `[ArtworkClient] [ReqID: ${requestId}] - Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            requestId,
            url: config.url,
            method: config.method,
          },
        );

        return config;
      },
      async (error) => {
        this.logger.error('[ArtworkClient] - Request interceptor error', {
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
          `[ArtworkClient] [ReqID: ${requestId}] - Response: ${response.status} ${response.statusText}`,
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
          `[ArtworkClient] [ReqID: ${requestId}] - Response error`,
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
    this.logger.log(`[ArtworkClient] Initialized`, {
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
    this.logger.debug(`[ArtworkClient] [ReqID: ${requestId}] - Health check`, {
      requestId,
    });

    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `[ArtworkClient] [ReqID: ${requestId}] - Health check failed`,
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
      const response: AxiosResponse<T> & { metadata?: ResponseMetadata } =
        await this.axiosInstance.request(config);

      return {
        data: response.data,
        success: true,
        timestamp: new Date(),
        request_id: requestId,
      };
    } catch (error) {
      this.logger.error(
        `[ArtworkClient] [ReqID: ${requestId}] - Request failed after retry`,
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
   * Get a single artwork by ID
   * @param id The artwork ID
   * @returns Artwork object or null if not found
   */
  async getArtwork(id: string): Promise<ApiResponse<ArtworkObject | null>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Artwork ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Getting artwork by ID`, { id });

    try {
      const response = await this.makeRequest<ArtworkObject>({
        method: HttpMethod.GET,
        url: `/artworks/${id}`,
        requestId: uuidv4(),
      });

      this.logger.debug(`[ArtworkClient] Artwork retrieved successfully`, {
        id,
      });
      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to get artwork`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get a list of artworks with optional filtering and pagination
   * @param options Query options for filtering and pagination
   * @returns Array of artwork objects
   */
  async listArtworks(
    options?: FindManyArtworkInput,
  ): Promise<ApiResponse<ArtworkObject[]>> {
    this.logger.debug(`[ArtworkClient] Listing artworks`, { options });

    try {
      const response = await this.makeRequest<ArtworkObject[]>({
        method: HttpMethod.GET,
        url: '/artworks',
        params: options,
        requestId: uuidv4(),
      });

      this.logger.debug(`[ArtworkClient] Artworks listed successfully`, {
        count: response.data?.length || 0,
      });

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to list artworks`, {
        options,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Search artworks by query string
   * @param sellerId The seller ID to search artworks for
   * @param query Search query string
   * @param skip Number of records to skip
   * @param take Maximum number of records to return
   * @returns Array of matching artwork objects
   */
  async searchArtworks(
    sellerId: string,
    query: string,
    skip?: number,
    take?: number,
  ): Promise<ApiResponse<ArtworkObject[]>> {
    this.logger.debug(`[ArtworkClient] Searching artworks`, {
      sellerId,
      query,
    });

    try {
      // Input validation
      if (!query || query.trim().length === 0) {
        throw new BadRequestException(this.serviceName, [
          'Search query cannot be empty',
        ]);
      }

      if (query.length < 2) {
        throw new BadRequestException(this.serviceName, [
          'Search query must be at least 2 characters long',
        ]);
      }

      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'Seller ID is required',
        ]);
      }

      const response = await this.makeRequest<ArtworkObject[]>({
        method: HttpMethod.GET,
        url: '/artworks/search',
        params: { sellerId, q: query, skip, take },
        requestId: uuidv4(),
      });

      this.logger.debug(`[ArtworkClient] Artwork search completed`, {
        sellerId,
        query,
        found: response.data?.length || 0,
      });

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to search artworks`, {
        sellerId,
        query,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get artworks by tags
   * @param sellerId The seller ID
   * @param tagIds Array of tag IDs
   * @param match Match type: 'any' or 'all'
   * @param skip Number of records to skip
   * @param take Maximum number of records to return
   * @returns Array of artwork objects matching the tags
   */
  async artworksByTags(
    sellerId: string,
    tagIds: string[],
    match: 'any' | 'all' = 'any',
    skip?: number,
    take?: number,
  ): Promise<ApiResponse<ArtworkObject[]>> {
    this.logger.debug(`[ArtworkClient] Getting artworks by tags`, {
      sellerId,
      tagCount: tagIds?.length,
      match,
    });

    try {
      // Input validation
      if (!sellerId || sellerId.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'Seller ID is required',
        ]);
      }

      if (!tagIds || tagIds.length === 0) {
        return { data: [], success: true, timestamp: new Date() };
      }

      if (tagIds.length > 50) {
        throw new BadRequestException(this.serviceName, [
          'Maximum 50 tags can be specified at once',
        ]);
      }

      // Validate each tag ID
      for (const tagId of tagIds) {
        if (!tagId || tagId.trim() === '') {
          throw new BadRequestException(this.serviceName, [
            'All tag IDs must be non-empty strings',
          ]);
        }
      }

      const response = await this.makeRequest<ArtworkObject[]>({
        method: HttpMethod.GET,
        url: '/artworks/by-tags',
        params: { sellerId, tagIds, match, skip, take },
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[ArtworkClient] Tag-based artwork retrieval completed`,
        {
          sellerId,
          tagCount: tagIds.length,
          match,
          returned: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to get artworks by tags`, {
        sellerId,
        tagCount: tagIds?.length,
        match,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get artwork counts by status for a seller
   * @param sellerId The seller ID
   * @returns JSON string containing counts by status
   */
  async getCountsByStatus(sellerId: string): Promise<ApiResponse<string>> {
    if (!sellerId || sellerId.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Seller ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Getting artwork counts by status`, {
      sellerId,
    });

    try {
      const response = await this.makeRequest<string>({
        method: HttpMethod.GET,
        url: '/artworks/counts/by-status',
        params: { sellerId },
        requestId: uuidv4(),
      });

      this.logger.debug(`[ArtworkClient] Status count retrieval completed`, {
        sellerId,
      });

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to get counts by status`, {
        sellerId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new artwork
   * @param input Artwork creation data
   * @returns Created artwork object
   */
  async createArtwork(
    input: CreateArtworkInput,
  ): Promise<ApiResponse<ArtworkObject>> {
    this.logger.debug(`[ArtworkClient] Creating artwork`, {
      title: input?.title,
      sellerId: input?.sellerId,
    });

    try {
      // Input validation
      if (!input?.sellerId || input.sellerId.trim() === '') {
        throw new BadRequestException(this.serviceName, [
          'Seller ID is required',
        ]);
      }

      if (!input?.title || input.title.trim() === '') {
        throw new BadRequestException(this.serviceName, ['Title is required']);
      }

      if (input.title.length > 200) {
        throw new BadRequestException(this.serviceName, [
          'Title must be less than 200 characters',
        ]);
      }

      if (input.description && input.description.length > 2000) {
        throw new BadRequestException(this.serviceName, [
          'Description must be less than 2000 characters',
        ]);
      }

      if (
        input.price !== undefined &&
        (isNaN(Number(input.price)) || Number(input.price) < 0)
      ) {
        throw new BadRequestException(this.serviceName, [
          'Price must be a valid positive number',
        ]);
      }

      const response = await this.makeRequest<ArtworkObject>({
        method: HttpMethod.POST,
        url: '/artworks',
        data: input,
        requestId: uuidv4(),
      });

      this.logger.log(`[ArtworkClient] Artwork created successfully`, {
        id: response.data?.id,
        title: response.data?.title,
      });

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to create artwork`, {
        title: input?.title,
        sellerId: input?.sellerId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update an existing artwork
   * @param id The artwork ID to update
   * @param input Updated artwork data
   * @returns Updated artwork object
   */
  async updateArtwork(
    id: string,
    input: UpdateArtworkInput,
  ): Promise<ApiResponse<ArtworkObject>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Artwork ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Updating artwork`, { id });

    try {
      // Input validation
      if (input.title !== undefined) {
        if (input.title.trim() === '') {
          throw new BadRequestException(this.serviceName, [
            'Title cannot be empty',
          ]);
        }
        if (input.title.length > 200) {
          throw new BadRequestException(this.serviceName, [
            'Title must be less than 200 characters',
          ]);
        }
      }

      if (
        input.description !== undefined &&
        input.description &&
        input.description.length > 2000
      ) {
        throw new BadRequestException(this.serviceName, [
          'Description must be less than 2000 characters',
        ]);
      }

      if (
        input.price !== undefined &&
        (isNaN(Number(input.price)) || Number(input.price) < 0)
      ) {
        throw new BadRequestException(this.serviceName, [
          'Price must be a valid positive number',
        ]);
      }

      const response = await this.makeRequest<ArtworkObject>({
        method: HttpMethod.PUT,
        url: `/artworks/${id}`,
        data: input,
        requestId: uuidv4(),
      });

      this.logger.log(`[ArtworkClient] Artwork updated successfully`, { id });
      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to update artwork`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete an artwork
   * @param id The artwork ID to delete
   * @returns True if deletion was successful
   */
  async deleteArtwork(id: string): Promise<ApiResponse<boolean>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Artwork ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Deleting artwork`, { id });

    try {
      const response = await this.makeRequest<boolean>({
        method: HttpMethod.DELETE,
        url: `/artworks/${id}`,
        requestId: uuidv4(),
      });

      this.logger.log(`[ArtworkClient] Artwork deletion completed`, { id });
      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to delete artwork`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mark an artwork as sold
   * @param id The artwork ID to mark as sold
   * @param quantity Quantity sold (default: 1)
   * @returns Updated artwork object
   */
  async markArtworkAsSold(
    id: string,
    quantity: number = 1,
  ): Promise<ApiResponse<ArtworkObject>> {
    if (!id || id.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Artwork ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Marking artwork as sold`, {
      id,
      quantity,
    });

    try {
      if (quantity <= 0) {
        throw new BadRequestException(this.serviceName, [
          'Quantity must be greater than 0',
        ]);
      }

      if (quantity > 1000) {
        throw new BadRequestException(this.serviceName, [
          'Quantity cannot exceed 1000',
        ]);
      }

      const response = await this.makeRequest<ArtworkObject>({
        method: HttpMethod.POST,
        url: `/artworks/${id}/mark-sold`,
        data: { quantity },
        requestId: uuidv4(),
      });

      this.logger.log(`[ArtworkClient] Artwork marked as sold successfully`, {
        id,
        quantity,
      });
      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to mark artwork as sold`, {
        id,
        quantity,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get artworks by seller
   * @param sellerId The seller ID
   * @param options Additional query options
   * @returns Array of artwork objects for the specified seller
   */
  async getArtworksBySeller(
    sellerId: string,
    options?: FindManyArtworkInput,
  ): Promise<ApiResponse<ArtworkObject[]>> {
    if (!sellerId || sellerId.trim() === '') {
      throw new BadRequestException(this.serviceName, [
        'Seller ID is required',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Getting artworks by seller`, {
      sellerId,
    });

    try {
      const sellerOptions = { ...options, sellerId };
      const response = await this.makeRequest<ArtworkObject[]>({
        method: HttpMethod.GET,
        url: `/artworks/seller/${sellerId}`,
        params: sellerOptions,
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[ArtworkClient] Seller artworks retrieved successfully`,
        {
          sellerId,
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to get seller artworks`, {
        sellerId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get featured artworks
   * @param limit Maximum number of artworks to return
   * @returns Array of featured artwork objects
   */
  async getFeaturedArtworks(
    limit: number = 10,
  ): Promise<ApiResponse<ArtworkObject[]>> {
    if (limit <= 0 || limit > 50) {
      throw new BadRequestException(this.serviceName, [
        'Limit must be between 1 and 50',
      ]);
    }

    this.logger.debug(`[ArtworkClient] Getting featured artworks`, { limit });

    try {
      const response = await this.makeRequest<ArtworkObject[]>({
        method: HttpMethod.GET,
        url: '/artworks/featured',
        params: { limit },
        requestId: uuidv4(),
      });

      this.logger.debug(
        `[ArtworkClient] Featured artworks retrieved successfully`,
        {
          limit,
          count: response.data?.length || 0,
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`[ArtworkClient] Failed to get featured artworks`, {
        limit,
        error: error.message,
      });
      throw error;
    }
  }
}
