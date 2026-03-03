import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcExceptionHelper } from '@app/common';
import { SavePaymentMethodCommand } from '../SavePaymentMethod.command';
import { PaymentMethod } from '../../../../domain/entities';
import { IPaymentMethodRepository } from '../../../../domain/interfaces';

@CommandHandler(SavePaymentMethodCommand)
export class SavePaymentMethodHandler implements ICommandHandler<SavePaymentMethodCommand> {
  private readonly logger = new Logger(SavePaymentMethodHandler.name);

  constructor(
    @Inject(IPaymentMethodRepository)
    private readonly paymentMethodRepo: IPaymentMethodRepository,
  ) {}

  async execute(command: SavePaymentMethodCommand): Promise<PaymentMethod> {
    try {
      const { data } = command;
      this.logger.log(
        `Saving payment method for user: ${data.userId}, provider: ${data.provider}`,
      );

      // If this should be the default, update existing defaults first
      if (data.isDefault) {
        const existingDefault =
          await this.paymentMethodRepo.findDefaultByUserId(data.userId);
        if (existingDefault) {
          await this.paymentMethodRepo.update(existingDefault.id, {
            isDefault: false,
          });
        }
      }

      // Create payment method
      const paymentMethod = await this.paymentMethodRepo.create({
        userId: data.userId,
        provider: data.provider,
        type: data.type,
        stripePaymentMethodId: data.stripePaymentMethodId,
        paypalPaymentMethodId: data.paypalPaymentMethodId,
        lastFour: data.lastFour,
        brand: data.brand,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        billingName: data.billingName,
        billingEmail: data.billingEmail,
        billingAddress: data.billingAddress,
        isDefault: data.isDefault || false,
        isActive: true,
      });

      this.logger.log(`Payment method saved successfully: ${paymentMethod.id}`);

      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to save payment method`, error.stack);
      if (error instanceof RpcException) {
        throw error;
      }
      if (error instanceof HttpException) {
        throw RpcExceptionHelper.from(error.getStatus(), error.message);
      }
      throw RpcExceptionHelper.internalError(error.message);
    }
  }
}
