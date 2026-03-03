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
  NetworkException,
  ServiceUnavailableException,
  BadRequestException,
  createApiException,
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

import {
  CompleteUserRegisterInput,
  ConfirmPasswordResetInput,
  EmailLoginInput,
  LoginResponse,
  RequestPasswordResetInput,
  UserPayload,
  UserRegisterInput,
  VerifyPasswordResetInput,
} from '@app/common';

/**
 * Professional Identity Service API Client
 * Handles communication with the identity microservice
 */
@Injectable()
@ApiClient({
  serviceName: 'identity-service',
  defaultBaseUrl: 'http://localhost:3001',
  defaultPort: 3001,
  version: 'v1',
  description: 'Identity Service API Client',
  healthEndpoint: '/health',
})
@Retry({ maxAttempts: 3, baseDelay: 1000 })
@Timeout({ connect: 5000, read: 30000, request: 35000 })
@Logging({
  level: 'info' as any,
  includePayloads: false,
  includeHeaders: false,
})
export class IdentityClient implements IApiClient {
  public readonly serviceName = 'identity-service';
  protected readonly logger = new Logger(IdentityClient.name);

  private readonly axiosInstance: AxiosInstance;
  private readonly config: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.config = {
      baseUrl: 'http://localhost:3001',
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
        'User-Agent': 'Artium-IdentityClient/1.0.0',
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
          `[IdentityClient] [ReqID: ${requestId}] - Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            requestId,
            url: config.url,
            method: config.method,
          },
        );

        return config;
      },
      async (error) => {
        this.logger.error('[IdentityClient] - Request interceptor error', {
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
        const requestId = metadata.requestId || 'unknown';
        const responseTime = Date.now() - (metadata.startTime || Date.now());

        this.logger.debug(
          `[IdentityClient] [ReqID: ${requestId}] - Response: ${response.status} ${response.statusText}`,
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
          `[IdentityClient] [ReqID: ${requestId}] - Response error`,
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
    this.logger.log(`[IdentityClient] Initialized`, {
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
    this.logger.debug(`[IdentityClient] [ReqID: ${requestId}] - Health check`, {
      requestId,
    });

    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `[IdentityClient] [ReqID: ${requestId}] - Health check failed`,
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
        `[IdentityClient] [ReqID: ${requestId}] - Request failed after retry`,
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
   * Get user by ID
   * @param userId User ID to retrieve
   * @returns User profile information
   */
  async getUserById(userId: string): Promise<ApiResponse<UserPayload>> {
    if (!userId || userId.trim() === '') {
      throw new BadRequestException(this.serviceName, ['User ID is required']);
    }

    this.logger.debug(`[IdentityClient] Getting user by ID: ${userId}`);

    try {
      const response = await this.makeRequest<UserPayload>({
        method: HttpMethod.GET,
        url: `/users/${userId}`,
        requestId: uuidv4(),
      });

      this.logger.debug(`[IdentityClient] User retrieved successfully`, {
        userId,
      });
      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Failed to get user`, {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Login with email and password
   * @param loginData Login credentials
   * @returns Authentication response with JWT token
   */
  async loginByEmail(
    loginData: EmailLoginInput,
  ): Promise<ApiResponse<LoginResponse>> {
    this.logger.debug(`[IdentityClient] Starting email login`, {
      email: this.sanitizeEmail(loginData.email),
    });

    try {
      // Input validation
      if (!loginData?.email || !loginData?.password) {
        throw new BadRequestException(this.serviceName, [
          'Email and password are required',
        ]);
      }

      if (!this.isValidEmail(loginData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      const response = await this.makeRequest<LoginResponse>({
        method: HttpMethod.POST,
        url: '/users/login',
        data: loginData,
        requestId: uuidv4(),
      });

      this.logger.log(`[IdentityClient] Login successful`, {
        email: this.sanitizeEmail(loginData.email),
      });

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Login failed`, {
        email: this.sanitizeEmail(loginData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Initiate user registration
   * @param userData User registration information
   * @returns Response indicating registration initiation success
   */
  async initiateRegistration(
    userData: UserRegisterInput,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    this.logger.debug(`[IdentityClient] Starting registration initiation`, {
      email: this.sanitizeEmail(userData.email),
    });

    try {
      // Input validation
      if (!userData?.email || !userData?.password) {
        throw new BadRequestException(this.serviceName, [
          'Email and password are required',
        ]);
      }

      if (!this.isValidEmail(userData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      if (userData.password.length < 8) {
        throw new BadRequestException(this.serviceName, [
          'Password must be at least 8 characters long',
        ]);
      }

      const response = await this.makeRequest<{
        success: boolean;
        message: string;
      }>({
        method: HttpMethod.POST,
        url: '/users/register/initiate',
        data: userData,
        requestId: uuidv4(),
      });

      this.logger.log(`[IdentityClient] Registration initiation successful`, {
        email: this.sanitizeEmail(userData.email),
      });

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Registration initiation failed`, {
        email: this.sanitizeEmail(userData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Complete user registration
   * @param completeData Complete registration data with OTP
   * @returns Authentication response with JWT token
   */
  async completeRegistration(
    completeData: CompleteUserRegisterInput,
  ): Promise<ApiResponse<LoginResponse>> {
    this.logger.debug(`[IdentityClient] Starting registration completion`, {
      email: this.sanitizeEmail(completeData.email),
    });

    try {
      // Input validation
      if (!completeData?.email || !completeData?.otp) {
        throw new BadRequestException(this.serviceName, [
          'Email and OTP are required',
        ]);
      }

      if (!this.isValidEmail(completeData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      if (!/^\d{6}$/.test(completeData.otp)) {
        throw new BadRequestException(this.serviceName, [
          'OTP must be exactly 6 digits',
        ]);
      }

      const response = await this.makeRequest<LoginResponse>({
        method: HttpMethod.POST,
        url: '/users/register/complete',
        data: completeData,
        requestId: uuidv4(),
      });

      this.logger.log(`[IdentityClient] Registration completion successful`, {
        email: this.sanitizeEmail(completeData.email),
      });

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Registration completion failed`, {
        email: this.sanitizeEmail(completeData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Request password reset
   * @param resetData Password reset request information
   * @returns Password reset request response
   */
  async requestPasswordReset(
    resetData: RequestPasswordResetInput,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    this.logger.debug(`[IdentityClient] Starting password reset request`, {
      email: this.sanitizeEmail(resetData.email),
    });

    try {
      // Input validation
      if (!resetData?.email) {
        throw new BadRequestException(this.serviceName, ['Email is required']);
      }

      if (!this.isValidEmail(resetData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      const response = await this.makeRequest<{
        success: boolean;
        message: string;
      }>({
        method: HttpMethod.POST,
        url: '/users/password/reset/request',
        data: resetData,
        requestId: uuidv4(),
      });

      this.logger.log(`[IdentityClient] Password reset request processed`, {
        email: this.sanitizeEmail(resetData.email),
      });

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Password reset request failed`, {
        email: this.sanitizeEmail(resetData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify password reset token
   * @param verifyData Password reset verification information
   * @returns Verification response
   */
  async verifyPasswordReset(
    verifyData: VerifyPasswordResetInput,
  ): Promise<ApiResponse<any>> {
    this.logger.debug(`[IdentityClient] Starting password reset verification`, {
      email: this.sanitizeEmail(verifyData.email),
    });

    try {
      // Input validation
      if (!verifyData?.email) {
        throw new BadRequestException(this.serviceName, ['Email is required']);
      }

      if (!this.isValidEmail(verifyData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      const response = await this.makeRequest<any>({
        method: HttpMethod.POST,
        url: '/users/password/reset/verify',
        data: verifyData,
        requestId: uuidv4(),
      });

      this.logger.log(
        `[IdentityClient] Password reset verification successful`,
        {
          email: this.sanitizeEmail(verifyData.email),
        },
      );

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] Password reset verification failed`, {
        email: this.sanitizeEmail(verifyData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Confirm new password after reset
   * @param confirmData New password confirmation
   * @returns Authentication response with JWT token
   */
  async confirmPasswordReset(
    confirmData: ConfirmPasswordResetInput,
  ): Promise<ApiResponse<LoginResponse>> {
    this.logger.debug(`[IdentityClient] Starting new password confirmation`, {
      email: this.sanitizeEmail(confirmData.email),
    });

    try {
      // Input validation
      if (
        !confirmData?.email ||
        !confirmData?.resetToken ||
        !confirmData?.newPassword
      ) {
        throw new BadRequestException(this.serviceName, [
          'Email, token, and new password are required',
        ]);
      }

      if (!this.isValidEmail(confirmData.email)) {
        throw new BadRequestException(this.serviceName, [
          'Invalid email format',
        ]);
      }

      if (confirmData.newPassword.length < 8) {
        throw new BadRequestException(this.serviceName, [
          'New password must be at least 8 characters long',
        ]);
      }

      if (confirmData.newPassword !== confirmData.confirmPassword) {
        throw new BadRequestException(this.serviceName, [
          'New password and confirmation do not match',
        ]);
      }

      const response = await this.makeRequest<LoginResponse>({
        method: HttpMethod.POST,
        url: '/users/password/reset/confirm',
        data: confirmData,
        requestId: uuidv4(),
      });

      this.logger.log(`[IdentityClient] New password confirmation successful`, {
        email: this.sanitizeEmail(confirmData.email),
      });

      return response;
    } catch (error) {
      this.logger.error(`[IdentityClient] New password confirmation failed`, {
        email: this.sanitizeEmail(confirmData.email),
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate email format
   * @param email Email to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize email for logging (hide partial email for privacy)
   * @param email Email to sanitize
   * @returns Sanitized email
   */
  private sanitizeEmail(email: string): string {
    return email?.replace(/(.{2}).*(@.*)/, '$1***$2') || 'unknown';
  }
}
