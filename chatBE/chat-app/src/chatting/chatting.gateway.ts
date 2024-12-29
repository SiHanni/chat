import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatFileDto, ChatMessageDto } from './dto/talk-chatting.dto';
import { UserChatting } from './entities/user-chatting.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './mongo/chat-message.schema';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthChatDto } from './dto/join-chatting.dto';
import { BadRequestException } from '@nestjs/common';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { S3Service } from 'src/common/s3/s3.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3Metadata } from 'src/common/s3/entities/s3.entity';
import { Readable } from 'stream';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: [
      'http://marutalk-build.s3-website.ap-northeast-2.amazonaws.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 5 * 1024 * 1024, // 5MB
})
export class ChattingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private s3Client: S3Client;

  constructor(
    @InjectRepository(UserChatting)
    private readonly userChatting: Repository<UserChatting>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
    @InjectRepository(S3Metadata)
    private readonly s3Repository: Repository<S3Metadata>,
    private readonly logger: CustomLoggerService,
    private configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  /** NestJS 모듈이 초기화 될 때 호출 */
  onModuleInit() {
    this.logger.log('WebSocket server initialized');
  }
  /** ws 서버에 연결될 떄 호출 (클라이언트가 서버에 연결을 시도할 때 실행) */
  handleConnection(client: Socket) {
    const authToken = client.handshake.auth.token;
    this.logger.log(`ws conn auth token:${authToken}`);
    if (!authToken) {
      this.logger.error(
        `No authentication token provided is WS  :${client.id}`,
      );
      throw new BadRequestException('No authentication token provided');
    }
    this.logger.log(
      `Client Connected: id:${client.id}, room:${JSON.stringify(client.rooms)}`,
    );
  }
  /** 클라이언트가 ws 서버와의 연결을 끊을 때 혹은 종료되었을 때(네트워크 이슈) 호출 */
  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id}, room:${JSON.stringify(client.rooms)}`,
    );
  }

  @SubscribeMessage('ping')
  async handlePing(client: Socket) {
    client.emit('pong', { message: 'pong' });
    // 추가 로직 필요
    //this.logger.log('ping-pong');
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const {
      room_id,
      sender_id,
      sender_email,
      sender_username,
      sender_profile_img,
      message,
    } = chatMessageDto;

    // room_id 에 대한 채팅방 데이터를 가져와서 room_type: open, private에 따라 로직을 분리하면 됌.
    this.logger.log(
      `received msg: room id:${chatMessageDto.room_id}, sender: ${chatMessageDto.sender_id}, msg: ${chatMessageDto.message}`,
    );

    const newMessage = new this.chatMessageModel({
      client_id: client.id,
      room_id: room_id,
      message: message,
      sender_id: sender_id,
      sender_email: sender_email,
      sender_username: sender_username,
      sender_profile_img: sender_profile_img,
      timestamp: new Date(),
    });
    try {
      await newMessage.save();
      console.log('MONGO SAVE TEST ');
    } catch (error) {
      this.logger.error(`Error saving message to MongoDB:, ${error}`);
    }
    try {
      this.server.to(`room-${room_id}`).emit('broadcastMessage', {
        message: message,
        sender_id: sender_id,
        sender_email: sender_email,
        sender_username: sender_username,
        sender_profile_img: sender_profile_img,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.log('err', error);
    }

    console.log(`Message from ${sender_id}: ${message}`);
  }

  @SubscribeMessage('sendFile')
  async handleFile(
    @MessageBody() chatFiledto: ChatFileDto,
    @ConnectedSocket() client: Socket,
  ) {
    const {
      room_id,
      sender_id,
      sender_email,
      sender_username,
      sender_profile_img,
      file_name,
      file_data,
      content_type,
    } = chatFiledto;

    const buffer = Buffer.from(file_data);
    const client_id = client.id;

    const s3Upload = await this.s3Service.uploadChatFileToS3(
      sender_id,
      room_id,
      buffer,
      file_name,
      content_type,
      client_id,
    );
    console.log('TESTS#', s3Upload);

    // TODO: uploadFileToS3에서 s3 경로 받아와서 몽고에 저장해야함
    const newMessage = new this.chatMessageModel({
      client_id: client.id,
      room_id: room_id,
      sender_id: sender_id,
      sender_email: sender_email,
      sender_username: sender_username,
      sender_profile_img: sender_profile_img,
      timestamp: new Date(),
      file_name: file_name,
      file_path: s3Upload,
    });
    console.log('QWE', newMessage);
    try {
      const m = await newMessage.save();
      console.log('mongoose:', m);
    } catch (error) {
      console.log('mongoose:', error);
    }

    this.server.to(`room-${room_id}`).emit('broadcastFile', {
      sender_id: sender_id,
      sender_username: sender_username,
      sender_email: sender_email,
      sender_profile_img: sender_profile_img,
      file_path: s3Upload,
      file_name: file_name,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('downloadFile')
  async handleDownloadFile(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const { file_url } = data;

    try {
      const metadata = await this.s3Repository.findOne({
        where: { s3_path: file_url },
      });
      if (metadata) {
        const s3_key = metadata.s3_key;
        const s3Params = {
          Bucket: this.configService.get<string>('S3_BUCKET'),
          Key: s3_key,
        };
        const command = new GetObjectCommand(s3Params);
        const fileData = await this.s3Client.send(command);
        console.log('FILE FROM S3', fileData);

        // S3에서 가져온 Stream을 Buffer로 변환
        if (fileData.Body instanceof Readable) {
          const chunks: Buffer[] = [];
          for await (const chunk of fileData.Body) {
            chunks.push(chunk); // 데이터를 chunks 배열에 저장
          }

          const fileBuffer = Buffer.concat(chunks);

          socket.emit('fileDownload', {
            file_data: fileBuffer,
            file_url: file_url,
            original_file_name: metadata.original_filename,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() authChatDto: AuthChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room_type, room_id, uid } = authChatDto;
    // open이면 그냥 들여보내고, private면 체크가 필요함

    const userCheck = await this.userChatting.find({
      where: { chatting: { id: room_id }, user: { id: uid } },
    });
    if (room_type === 'private') {
      client.join(`room-${room_id}`);
    } else if (userCheck.length < 1) {
      throw new BadRequestException('Invalid User');
    }

    client.join(`room-${room_id}`);
    console.log(`Client ${client.id} joined room ${room_id}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room_id: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`room-${room_id}`);
    console.log(`Client ${client.id} left room ${room_id}`);
    client.to(`room-${room_id}`).emit('roomLeft', { room_id });
  }
}
