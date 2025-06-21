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
//import { SentryModule } from '@sentry/nestjs/setup';
import { ExceptionsFilter } from './utils/error.filter';
import { APP_FILTER } from '@nestjs/core';
import { SimpleTypeOrmSentryLogger } from './utils/error.query';
import { TestModule } from './test/test.module'; // 센트리 테스트용

@Module({
  imports: [
    //SentryModule.forRoot(), 커스텀 필터 사용을 위해 주석처리
    TestModule,
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
        logging: true, //configService.get<string>('NODE_ENV') === 'development',
        logger: new SimpleTypeOrmSentryLogger(), // 커스텀 로거
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

    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: ExceptionsFilter }],
})
export class AppModule {}
