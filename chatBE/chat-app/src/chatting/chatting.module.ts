import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatting } from './entities/chatting.entity';
import { UserChatting } from './entities/user-chatting.entity';
import { ChattingController } from './chatting.controller';
import { ChattingGateway } from './chatting.gateway';
import { ChattingService } from './chatting.service';
import { User } from '../users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatting, UserChatting, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  controllers: [ChattingController], // REST API 컨트롤러
  providers: [ChattingService, ChattingGateway], // 웹소켓 게이트웨이
})
export class ChattingModule {}
