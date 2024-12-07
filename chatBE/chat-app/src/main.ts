import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  console.log('Port', port);
  app.enableCors({
    origin: [
      'http://marutalk-build.s3-website.ap-northeast-2.amazonaws.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ], // 나중에 프론트 도메인 생기면 수정필요. 와일드카드 격인 *는 너무 느슨함.
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  console.log('SERVER PORT', port);
  await app.listen(port ?? 3000);
}
bootstrap();
