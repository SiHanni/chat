import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ChattingModule } from './chatting/chatting.module';
import { LoggerModule } from './common/logger/logger.module';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './common/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(
        __dirname,
        `../.env.${process.env.NODE_ENV || 'development'}`,
      ),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<number>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USERNAME'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development', // 개발 환경에서는 true, 프로덕션에서는 false
        logging: configService.get<string>('NODE_ENV') === 'development',
        timezone: 'Z',
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('MONGO_INITDB_ROOT_USERNAME')}:${configService.get<string>('MONGO_INITDB_ROOT_PASSWORD')}@${configService.get<string>('MONGO_HOST')}:${configService.get<number>('MONGO_PORT')}/${configService.get<string>('MONGO_DATABASE')}?authSource=admin`,
      }),
    }),
    UsersModule,

    ChattingModule,

    LoggerModule,

    AuthModule,

    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
