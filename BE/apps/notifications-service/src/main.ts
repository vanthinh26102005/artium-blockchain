import { NestFactory } from '@nestjs/core';
import { NotificationsServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsServiceModule);
  await app.listen(process.env.port ?? 3002);
}
bootstrap();
