import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { APP_CONFIG_KEY } from './core/config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  app.useWebSocketAdapter(new WsAdapter(app));

  const configService = app.get(ConfigService);
  const appConfig = configService.get<{ port: number; apiPrefix: string; corsOrigin: string }>(
    APP_CONFIG_KEY,
  );

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: appConfig?.corsOrigin ?? 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix(appConfig?.apiPrefix ?? 'api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Akıllı Garson API')
    .setDescription('Akıllı Garson — Restaurant Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Restaurant-Id', in: 'header' }, 'restaurant-id')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = appConfig?.port ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application running on http://localhost:${port}/${appConfig?.apiPrefix ?? 'api/v1'}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
