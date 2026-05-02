import { JwtAuthGuard } from '@app/auth';
import {
  CompleteUserRegisterInput,
  ConfirmPasswordResetInput,
  EmailLoginInput,
  GetUserProfileDto,
  GoogleLoginInput,
  UpdateUserProfileInput,
  LoginEmailDto,
  LoginGoogleDto,
  LoginResponse,
  LoginWalletDto,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  PasswordResetVerifyDto,
  RegisterCompleteDto,
  RegisterInitiateDto,
  RequestOtpResponse,
  RequestPasswordResetInput,
  RequestPasswordResetResponse,
  UserPayload,
  UserRegisterInput,
  VerifyPasswordResetInput,
  VerifyPasswordResetResponse,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MICROSERVICES } from 'apps/api-gateway/src/config';
import { sendRpc } from '../../utils';

@ApiTags('Users')
@Controller('identity')
export class UserController {
  constructor(
    @Inject(MICROSERVICES.IDENTITY_SERVICE)
    private readonly identityClient: ClientProxy,
  ) {}

  @Get('users/me')
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
  @UseGuards(JwtAuthGuard)
  async getUserProfile(
    @Request() req: Express.Request & { user: GetUserProfileDto['user'] },
  ) {
    return sendRpc<UserPayload>(
      this.identityClient,
      { cmd: 'get_user_profile' },
      { user: { id: req.user.id } },
    );
  }

  @Put('users/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the profile of the currently authenticated user',
  })
  @ApiBody({
    type: UpdateUserProfileInput,
    description: 'Fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'Slug already taken',
  })
  async updateUserProfile(
    @Request() req: Express.Request & { user: GetUserProfileDto['user'] },
    @Body() input: UpdateUserProfileInput,
  ) {
    return sendRpc(
      this.identityClient,
      { cmd: 'update_user_profile' },
      { userId: req.user.id, input },
    );
  }

  @Get('users/slug/:slug')
  @ApiOperation({
    summary: 'Get user by slug',
    description:
      'Retrieves public profile information for a user by their unique slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'The unique URL-friendly identifier of the user',
    type: 'string',
    example: 'duong-phuong-thinh',
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
  async getUserBySlug(@Param('slug') slug: string) {
    return sendRpc<UserPayload>(
      this.identityClient,
      { cmd: 'get_user_by_slug' },
      { slug },
    );
  }

  @Get('users/:userId')
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
  async getUserById(@Param('userId') userId: string) {
    return sendRpc<UserPayload>(
      this.identityClient,
      { cmd: 'get_user_by_id' },
      { userId },
    );
  }

  @Post('auth/login')
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
  async login(@Body() loginInput: LoginEmailDto) {
    return sendRpc<LoginResponse>(
      this.identityClient,
      { cmd: 'login_email' },
      loginInput,
    );
  }

  @Post('auth/google')
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
  async loginWithGoogle(@Body() loginInput: LoginGoogleDto) {
    return sendRpc<LoginResponse>(
      this.identityClient,
      { cmd: 'login_google' },
      loginInput,
    );
  }

  @Post('auth/wallet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Ethereum wallet (SIWE)' })
  @ApiBody({ type: LoginWalletDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Returns user data and access tokens',
    type: LoginResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid SIWE message format' })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired nonce / signature',
  })
  async loginWallet(@Body() input: LoginWalletDto) {
    return sendRpc<LoginResponse>(
      this.identityClient,
      { cmd: 'login_wallet' },
      input,
    );
  }

  @Get('auth/wallet/nonce')
  @ApiOperation({ summary: 'Get nonce for wallet login' })
  @ApiQuery({ name: 'address', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Nonce generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid Ethereum address format' })
  async getWalletNonce(@Query('address') address: string) {
    return sendRpc<{ nonce: string }>(
      this.identityClient,
      { cmd: 'get_wallet_nonce' },
      { address },
    );
  }

  @Post('auth/register/initiate')
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
  async initiateRegistration(@Body() input: RegisterInitiateDto) {
    return sendRpc<{ success: boolean; message: string }>(
      this.identityClient,
      { cmd: 'initiate_registeration' },
      input,
    );
  }

  @Post('auth/register/complete')
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
  async completeRegistration(@Body() input: RegisterCompleteDto) {
    return sendRpc<LoginResponse>(
      this.identityClient,
      { cmd: 'complete_registeration' },
      input,
    );
  }

  @Post('auth/password/reset/request')
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
  async requestPasswordReset(@Body() input: PasswordResetRequestDto) {
    return sendRpc<{ success: boolean; message: string }>(
      this.identityClient,
      { cmd: 'request_password_reset' },
      input,
    );
  }

  @Post('auth/password/reset/verify')
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
  async verifyPasswordReset(@Body() input: PasswordResetVerifyDto) {
    return sendRpc<{ success: boolean; resetToken: string }>(
      this.identityClient,
      { cmd: 'password_reset_verify' },
      input,
    );
  }

  @Put('auth/password/reset/confirm')
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
  async confirmPasswordReset(@Body() input: PasswordResetConfirmDto) {
    return sendRpc<LoginResponse>(
      this.identityClient,
      { cmd: 'password_reset_confirm' },
      input,
    );
  }
}
