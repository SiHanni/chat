import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './common/logger/logger.service';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  const logger = app.get(CustomLoggerService);
  const timeZone = configService.get<string>('TZ') || 'Asia/Seoul';
  process.env.TZ = timeZone;
  console.log(process.env.TZ);

  app.enableCors({
    origin: [
      'http://marutalk-build.s3-website.ap-northeast-2.amazonaws.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(port ?? 3000);
  logger.log(`Server is starting in port ${port}!`);
  logger.log('test for action6');
}
bootstrap();
