import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const port = process.env.NODE_ENV === 'development' ? 3002 : Number(process.env.PORT) || 3001;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(`CORS allowed origin: ${frontendUrl}`);
}

bootstrap();
