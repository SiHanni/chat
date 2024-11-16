import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['*', 'http://localhost:3001'], // 나중에 프론트 도메인 생기면 수정필요. 와일드카드 격인 *는 너무 느슨함.
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
