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
import { S3Service } from 'src/common/s3/s3.service';
import { S3Metadata } from 'src/common/s3/entities/s3.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFriend, TokenHistory, S3Metadata]),
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
  providers: [UsersService, AuthService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
