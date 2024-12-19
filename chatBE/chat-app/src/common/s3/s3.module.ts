import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { S3Metadata } from './entities/s3.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, S3Metadata])],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
