import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ChattingModule } from './chatting/chatting.module';
import * as path from 'path';

// TODO: 로컬 개발 완료되면 환경변수 config 같은거 활용해서 외부로 빼기

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
        logging: configService.get<string>('NODE_ENV') === 'development', // 개발 환경에서만 로그 출력
        timezone: 'Z',
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('MONGO_INITDB_ROOT_USERNAME')}:${configService.get<string>('MONGO_INITDB_ROOT_PASSWORD')}@${configService.get<string>('MONGO_HOST')}:${configService.get<number>('MONGO_PORT')}/${configService.get<string>('MONGO_DATABASE')}?authSource=admin`,
      }),
    }),
    //MongooseModule.forRootAsync({
    //  inject: [ConfigService],
    //  useFactory: () => ({
    //    //uri: `mongodb://admin:admin@localhost:27017`,
    //    uri: `mongodb://localhost:27017/chat`,
    //  }),
    //}),

    UsersModule,

    ChattingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
