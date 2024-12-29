import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from '../logger/logger.service';
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentDate } from '../time';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Content, S3Metadata } from './entities/s3.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private configService: ConfigService,
    private readonly logger: CustomLoggerService,
    @InjectRepository(S3Metadata)
    private readonly s3Repository: Repository<S3Metadata>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      region: this.configService.get<string>('AWS_REGION'),
    });

    const environment = process.env.NODE_ENV || 'development';
    if (environment === 'production') {
      this.bucketName = this.configService.get<string>('S3_BUCKET');
      this.logger.log('production s3 bucket');
    } else {
      this.bucketName = this.configService.get<string>('S3_BUCKET');
      this.logger.log('development s3 bucket');
    }
  }

  async uploadToS3() {}
  async uploadChatFileToS3(
    sender_id: number,
    room_id: number,
    file_buffer: Buffer,
    file_name: string,
    content_type: string,
    client_id: string,
  ) {
    // uuid 생성
    const uuid = uuidv4();
    this.logger.log(`UUID:::${uuid}`);
    // 파일 경로 생성
    const todayDir = getCurrentDate();
    const s3Path = `uploads/${todayDir}/${room_id}/${uuid}`;
    // s3업로드
    const s3Params = {
      Key: s3Path,
      Body: file_buffer,
      Bucket: this.bucketName,
      ContentType: content_type,
      ACL: ObjectCannedACL.public_read,
    };
    const command = new PutObjectCommand(s3Params);
    try {
      const uploadS3 = await this.s3Client.send(command);
      if (uploadS3) {
        const sender = await this.userRepository.findOne({
          where: { id: sender_id },
        });
        if (sender) {
          const s3PullPath = `https://${this.bucketName}.s3.ap-northeast-2.amazonaws.com/${s3Path}`;
          const s3Metadata = await this.s3Repository.create({
            room_id: room_id,
            user: sender,
            original_filename: file_name,
            uuid: uuid,
            s3_path: s3PullPath,
            s3_key: s3Path,
            client_id: client_id,
            content_type: S3Content.CHAT,
          });
          await this.s3Repository.save(s3Metadata);
          return s3PullPath;
        }
      }
    } catch (error) {
      this.logger.error(`S3 Upload Error::${error}`);
    }
  }

  async uploadProfileImgToS3(
    uid: number,
    file_buffer: Buffer,
    file_name: string,
    content_type: string,
  ) {
    const uuid = uuidv4();
    const s3Path = `uploads/user_profileImg/${uuid}`;

    const s3Params = {
      Key: s3Path,
      Body: file_buffer,
      Bucket: this.bucketName,
      ContentType: content_type,
      ACL: ObjectCannedACL.public_read,
    };
    const command = new PutObjectCommand(s3Params);
    try {
      const uploadS3 = await this.s3Client.send(command);
      if (uploadS3) {
        const user = await this.userRepository.findOne({
          where: { id: uid },
        });
        if (user) {
          const s3PullPath = `https://${this.bucketName}.s3.ap-northeast-2.amazonaws.com/${s3Path}`;
          const s3Metadata = await this.s3Repository.create({
            user: user,
            original_filename: file_name,
            uuid: uuid,
            s3_path: s3PullPath,
            s3_key: s3Path,
            content_type: S3Content.PROFILE,
          });
          await this.s3Repository.save(s3Metadata);
          return s3PullPath;
        }
      }
    } catch (error) {
      this.logger.error(`S3 Upload Error::${error}`);
    }
  }
}
