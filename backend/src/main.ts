import { NestFactory } from '@nestjs/core';
import { AppModule } from './Modules/app.module';
import { getEnvPath } from './config/config';

const bootstrap = async () => {
  const envPath = getEnvPath();

  if (!process.env.MONGODB_URL) {
    throw new Error(`MONGODB_URL is not defined in ${envPath}`);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
};

bootstrap();
