import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './common/logger/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  const logger = app.get(CustomLoggerService);
  const timeZone = configService.get<string>('TZ') || 'Asia/Seoul';

  const config = new DocumentBuilder()
    .setTitle('MaruTalk')
    .setDescription('MaruTalk API Document')
    .setVersion('1.1.19')
    .addBearerAuth()
    .addTag('maru')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  process.env.TZ = timeZone;

  app.enableCors({
    origin: [
      `${process.env.MAIN_DOMAIN}`,
      `${process.env.ALB_ROUTE_RECORD}`,
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(port ?? 3000);
  logger.log(`Server is starting in port ${port}:: ${process.env.TZ}`);
}
bootstrap();
