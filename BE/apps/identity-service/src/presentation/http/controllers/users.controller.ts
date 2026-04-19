import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import {
  CompleteUserRegisterInput,
  ConfirmPasswordResetInput,
  EmailLoginInput,
  GoogleLoginInput,
  LoginResponse,
  RequestOtpResponse,
  RequestPasswordResetInput,
  RequestPasswordResetResponse,
  UserPayload,
  UserRegisterInput,
  VerifyPasswordResetInput,
  VerifyPasswordResetResponse,
} from '../../../domain';
import {
  CompleteUserRegistrationCommand,
  ConfirmNewPasswordCommand,
  GetUserByIdQuery,
  InitiateUserRegistrationCommand,
  LoginByEmailCommand,
  LoginByGoogleCommand,
  RequestPasswordResetCommand,
  VerifyPasswordResetCommand,
} from '../../../application';
import { JwtAuthGuard } from '@app/auth';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserPayload,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Request() req: any): Promise<UserPayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Getting current user profile`,
    );

    try {
      const userId = req?.user?.id;
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      const user = await this.queryBus.execute(new GetUserByIdQuery(userId));

      if (!user) {
        this.logger.warn(
          `[UsersController] [ReqID: ${requestId}] - User not found: ${userId}`,
        );
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const { password: _password, ...safeUser } = user;
      return safeUser as UserPayload;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Failed to get user profile`,
        {
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException('Failed to retrieve user profile');
    }
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves public profile information for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'The unique identifier of the user',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserPayload,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID format',
  })
  async getUserById(@Param('userId') userId: string): Promise<UserPayload> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Getting user by ID: ${userId}`,
    );

    try {
      if (!userId || userId.trim() === '') {
        throw new BadRequestException('User ID is required');
      }

      if (userId.length < 10) {
        throw new BadRequestException('Invalid user ID format');
      }

      const user = await this.queryBus.execute(new GetUserByIdQuery(userId));

      if (!user) {
        this.logger.warn(
          `[UsersController] [ReqID: ${requestId}] - User not found: ${userId}`,
        );
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - User retrieved successfully: ${userId}`,
      );
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected error getting user by ID`,
        {
          userId,
          error: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve user information',
      );
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login with email and password',
    description: 'Authenticates a user using email and password credentials',
  })
  @ApiBody({
    type: EmailLoginInput,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Returns user data and access tokens',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid email/password format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected system error',
  })
  async login(@Body() loginInput: EmailLoginInput): Promise<LoginResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - User login attempt`,
      {
        email: this.sanitizeEmail(loginInput?.email),
      },
    );

    try {
      if (!loginInput) {
        throw new BadRequestException('Login input is required');
      }

      if (!loginInput.email || loginInput.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!loginInput.password || loginInput.password.trim() === '') {
        throw new BadRequestException('Password is required');
      }

      if (!this.isValidEmail(loginInput.email)) {
        throw new BadRequestException('Invalid email format');
      }

      const result = await this.commandBus.execute(
        new LoginByEmailCommand(loginInput),
      );

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Login successful`,
        {
          email: this.sanitizeEmail(loginInput.email),
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected login error`,
        {
          email: this.sanitizeEmail(loginInput?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Login failed. Please try again later.',
      );
    }
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login with Google',
    description: 'Authenticates a user using Google ID token from OAuth',
  })
  @ApiBody({
    type: GoogleLoginInput,
    description: 'Google authentication credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Returns user data and access tokens',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid Google ID token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired Google token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected system error',
  })
  async loginWithGoogle(
    @Body() loginInput: GoogleLoginInput,
  ): Promise<LoginResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - User Google login attempt`,
    );

    try {
      if (!loginInput) {
        throw new BadRequestException('Google login input is required');
      }

      if (!loginInput.idToken || loginInput.idToken.trim() === '') {
        throw new BadRequestException('Google ID token is required');
      }

      const result = await this.commandBus.execute(
        new LoginByGoogleCommand(loginInput),
      );

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Google login successful`,
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected Google login error`,
        {
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Google login failed. Please try again later.',
      );
    }
  }

  @Post('register/initiate')
  @ApiOperation({
    summary: 'Initiate user registration',
    description:
      'Starts user registration process by sending OTP verification code to email',
  })
  @ApiBody({
    type: UserRegisterInput,
    description: 'User registration information',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration initiated successfully - OTP sent to email',
    type: RequestOtpResponse,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid email format or password requirements not met',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already registered',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected system error',
  })
  async initiateRegistration(
    @Body() input: UserRegisterInput,
  ): Promise<RequestOtpResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Initiating user registration`,
      {
        email: this.sanitizeEmail(input?.email),
      },
    );

    try {
      if (!input) {
        throw new BadRequestException('Registration input is required');
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!input.password || input.password.trim() === '') {
        throw new BadRequestException('Password is required');
      }

      if (!this.isValidEmail(input.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (input.password.length < 8) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }

      if (input.password.length > 128) {
        throw new BadRequestException(
          'Password must be less than 128 characters long',
        );
      }

      await this.commandBus.execute(new InitiateUserRegistrationCommand(input));

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Registration initiated successfully`,
        {
          email: this.sanitizeEmail(input.email),
        },
      );

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected registration initiation error`,
        {
          email: this.sanitizeEmail(input?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Failed to initiate registration. Please try again later.',
      );
    }
  }

  @Post('register/complete')
  @ApiOperation({
    summary: 'Complete user registration',
    description:
      'Completes user registration by verifying OTP and creating user account',
  })
  @ApiBody({
    type: CompleteUserRegisterInput,
    description: 'Registration completion data with OTP',
  })
  @ApiResponse({
    status: 201,
    description:
      'Registration completed successfully - Returns user data and access tokens',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid, expired, or incorrect OTP',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected system error',
  })
  async completeRegistration(
    @Body() input: CompleteUserRegisterInput,
  ): Promise<LoginResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Completing user registration`,
      {
        email: this.sanitizeEmail(input?.email),
      },
    );

    try {
      if (!input) {
        throw new BadRequestException(
          'Registration completion input is required',
        );
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!input.otp || input.otp.trim() === '') {
        throw new BadRequestException('OTP is required');
      }

      if (!this.isValidEmail(input.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (!/^\d{6}$/.test(input.otp)) {
        throw new BadRequestException('OTP must be exactly 6 digits');
      }

      const result = await this.commandBus.execute(
        new CompleteUserRegistrationCommand(input),
      );

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Registration completed successfully`,
        {
          email: this.sanitizeEmail(input.email),
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected registration completion error`,
        {
          email: this.sanitizeEmail(input?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Failed to complete registration. Please try again later.',
      );
    }
  }

  @Post('password/reset/request')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Initiates password reset process by sending reset instructions to user email',
  })
  @ApiBody({
    type: RequestPasswordResetInput,
    description: 'Password reset request information',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed successfully',
    type: RequestPasswordResetResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async requestPasswordReset(
    @Body() input: RequestPasswordResetInput,
  ): Promise<RequestPasswordResetResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Requesting password reset`,
      {
        email: this.sanitizeEmail(input?.email),
      },
    );

    try {
      if (!input) {
        throw new BadRequestException(
          'Password reset request input is required',
        );
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!this.isValidEmail(input.email)) {
        throw new BadRequestException('Invalid email format');
      }

      await this.commandBus.execute(new RequestPasswordResetCommand(input));

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Password reset request processed`,
        {
          email: this.sanitizeEmail(input.email),
        },
      );

      return {
        success: true,
        message: 'If email exists, reset instructions will be sent',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected password reset request error`,
        {
          email: this.sanitizeEmail(input?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Failed to process password reset request. Please try again later.',
      );
    }
  }

  @Post('password/reset/verify')
  @ApiOperation({
    summary: 'Verify password reset token',
    description:
      'Verifies the validity of a password reset token before setting new password',
  })
  @ApiBody({
    type: VerifyPasswordResetInput,
    description: 'Password reset verification information',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset token verified successfully',
    type: VerifyPasswordResetResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  async verifyPasswordReset(
    @Body() input: VerifyPasswordResetInput,
  ): Promise<VerifyPasswordResetResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Verifying password reset`,
      {
        email: this.sanitizeEmail(input?.email),
      },
    );

    try {
      if (!input) {
        throw new BadRequestException(
          'Password reset verification input is required',
        );
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!this.isValidEmail(input.email)) {
        throw new BadRequestException('Invalid email format');
      }

      const result = await this.commandBus.execute(
        new VerifyPasswordResetCommand(input),
      );

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Password reset verified successfully`,
        {
          email: this.sanitizeEmail(input.email),
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected password reset verification error`,
        {
          email: this.sanitizeEmail(input?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Failed to verify password reset token. Please try again later.',
      );
    }
  }

  @Put('password/reset/confirm')
  @ApiOperation({
    summary: 'Confirm new password after reset',
    description:
      'Sets a new password after successful verification of the reset token',
  })
  @ApiBody({
    type: ConfirmPasswordResetInput,
    description: 'New password confirmation data',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset completed successfully',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password confirmation',
  })
  async confirmPasswordReset(
    @Body() input: ConfirmPasswordResetInput,
  ): Promise<LoginResponse> {
    const requestId = uuidv4();
    this.logger.log(
      `[UsersController] [ReqID: ${requestId}] - Confirming new password`,
      {
        email: this.sanitizeEmail(input?.email),
      },
    );

    try {
      if (!input) {
        throw new BadRequestException(
          'Password reset confirmation input is required',
        );
      }

      if (!input.email || input.email.trim() === '') {
        throw new BadRequestException('Email is required');
      }

      if (!input.resetToken || input.resetToken.trim() === '') {
        throw new BadRequestException('Reset token is required');
      }

      if (!input.newPassword || input.newPassword.trim() === '') {
        throw new BadRequestException('New password is required');
      }

      if (!input.confirmPassword || input.confirmPassword.trim() === '') {
        throw new BadRequestException('Password confirmation is required');
      }

      if (!this.isValidEmail(input.email)) {
        throw new BadRequestException('Invalid email format');
      }

      if (input.newPassword.length < 8) {
        throw new BadRequestException(
          'New password must be at least 8 characters long',
        );
      }

      if (input.newPassword.length > 128) {
        throw new BadRequestException(
          'New password must be less than 128 characters long',
        );
      }

      if (input.newPassword !== input.confirmPassword) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      if (input.resetToken.length < 10) {
        throw new BadRequestException('Invalid reset token format');
      }

      const result = await this.commandBus.execute(
        new ConfirmNewPasswordCommand(input),
      );

      this.logger.log(
        `[UsersController] [ReqID: ${requestId}] - Password reset confirmation successful`,
        {
          email: this.sanitizeEmail(input.email),
        },
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `[UsersController] [ReqID: ${requestId}] - Unexpected password reset confirmation error`,
        {
          email: this.sanitizeEmail(input?.email),
          error: error.message,
          stack: error.stack,
        },
      );

      throw new InternalServerErrorException(
        'Failed to confirm new password. Please try again later.',
      );
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private sanitizeEmail(email: string): string {
    if (!email) return 'unknown';
    return email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }
}
