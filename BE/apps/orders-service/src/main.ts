import { NestFactory } from '@nestjs/core';
import { OrdersCheckoutServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersCheckoutServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
