import { OutboxService } from '@app/outbox/outbox.service';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IUserRepository,
  OtpContext,
  OtpService,
  RequestPasswordResetResponse,
} from 'apps/identity-service/src/domain';
import { ITransactionService } from '@app/common';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { RequestPasswordResetCommand } from '../RequestPasswordReset.command';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<
  RequestPasswordResetCommand,
  RequestPasswordResetResponse
> {
  private readonly logger = new Logger(RequestPasswordResetHandler.name);

  constructor(
    @Inject(IUserRepository) private readonly userRepository: IUserRepository,
    private readonly outboxService: OutboxService,
    private readonly otpService: OtpService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResponse> {
    const { email } = command.input;
    this.logger.log(`Password reset requested for email: ${email}`);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return {
        success: true,
        message:
          'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.',
      };
    }

    return this.transactionService.execute(async (manager) => {
      const otp = await this.otpService.generateAndStoreOtp(
        OtpContext.PASSWORD_RESET,
        email,
        { userId: user.id },
      );

      await this.outboxService.createOutboxMessage(
        {
          aggregateType: 'auth',
          aggregateId: user.id,
          eventType: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
          payload: {
            to: email,
            subject: '[Artium] Yêu cầu đặt lại mật khẩu',
            template: 'password-reset',
            context: { otp },
            history: {
              type: 'PASSWORD_RESET_OTP',
              title: 'Xác thực email đăng ký',
              body: `Mã OTP của bạn là: ${otp}`,
            },
          },
          exchange: ExchangeName.NOTIFICATION_EVENTS,
          routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
        },
        manager,
      );

      this.logger.log(`Queued password reset OTP for email: ${email}`);
      return {
        success: true,
        message:
          'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.',
      };
    });
  }
}
