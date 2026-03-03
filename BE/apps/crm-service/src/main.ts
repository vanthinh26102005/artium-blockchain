import { NestFactory } from '@nestjs/core';
import { CrmMarketingServiceModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(CrmMarketingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
