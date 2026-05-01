import { OutboxService } from '@app/outbox/outbox.service';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OtpContext, OtpService } from 'apps/identity-service/src/domain';
import { RegistrationService } from 'apps/identity-service/src/domain/services/registration.service';
import * as bcrypt from 'bcryptjs';
import { ITransactionService, RpcExceptionHelper } from '@app/common/index';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { InitiateUserRegistrationCommand } from '../InitiateUserRegistration.command.ts';

@CommandHandler(InitiateUserRegistrationCommand)
export class InitiateUserRegistrationHandler implements ICommandHandler<InitiateUserRegistrationCommand> {
  private readonly logger = new Logger(InitiateUserRegistrationHandler.name);

  constructor(
    private readonly registrationService: RegistrationService,
    private readonly otpService: OtpService,
    @Inject(ITransactionService)
    private readonly transactionService: ITransactionService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: InitiateUserRegistrationCommand): Promise<void> {
    const { email, firstName, password } = command.input;
    this.logger.log(`Initiating registration process for email: ${email}`);

    try {
      await this.registrationService.ensureEmailIsUnique(email);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = await this.otpService.generateAndStoreOtp(
        OtpContext.USER_REGISTRATION,
        email,
        { email, fullName: firstName, password: hashedPassword },
      );
      this.logger.debug(`Generated OTP ${otp} for email: ${email}`);

      const emailPayload = {
        to: email,
        subject: `Mã xác thực đăng ký tài khoản của bạn là ${otp}`,
        template: 'verification',
        context: {
          otp,
          firstName,
        },
      };

      await this.transactionService.execute(async (manager) => {
        await this.outboxService.createOutboxMessage(
          {
            aggregateType: 'registration',
            aggregateId: email,
            eventType: 'SEND_REGISTRATION_OTP_EMAIL',
            payload: emailPayload,
            exchange: ExchangeName.NOTIFICATION_EVENTS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL,
          },
          manager,
        );
      });

      this.logger.log(
        `Successfully initiated registration and queued OTP email for: ${email}`,
      );
    } catch (error) {
      if (error.status !== 500) {
        this.logger.warn(
          `Business rule failed during registration initiation for ${email}: ${error.message}`,
        );
        throw error;
      }

      this.logger.error(
        `An unexpected error occurred while initiating registration for ${email}`,
        error.stack,
      );
      throw RpcExceptionHelper.internalError(
        'Không thể bắt đầu quá trình đăng ký vào lúc này.',
      );
    }
  }
}
