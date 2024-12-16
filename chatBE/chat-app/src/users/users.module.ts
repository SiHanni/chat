import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFriend } from './entities/user-friend.entity';
import { AuthService } from 'src/auth/auth.service';
import { TokenHistory } from 'src/auth/entities/auth-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFriend, TokenHistory]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
