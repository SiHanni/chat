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
import { Repository, Not } from 'typeorm';
import { AuthChatDto } from './dto/join-chatting.dto';
import { BadRequestException } from '@nestjs/common';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { S3Service } from 'src/common/s3/s3.service';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { S3Metadata } from 'src/common/s3/entities/s3.entity';
import { Readable } from 'stream';
import { AuthService } from 'src/auth/auth.service';
import { S3Content } from 'src/common/s3/entities/s3.entity';
import { ChattingHistory } from './entities/chatting-history.entity';
import { User } from 'src/users/entities/user.entity';
import { jwtDecode } from 'src/common/jsonDecoder';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: [
      `${process.env.MAIN_DOMAIN}`,
      `${process.env.ALB_ROUTE_RECORD}`,
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
  @WebSocketServer() // 해당 데코레이터가 웹소켓 서버 인스턴스를 자동 주입함.(초기화 필요 x)
  server: Server;
  private s3Client: S3Client;
  // TODO: 중요:: 이건 테스트 끝나면 바로 zookeeper znode 또는 redis로 꼭 대체할 것
  clientMap = new Map<number, any>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserChatting)
    private readonly userChatting: Repository<UserChatting>,
    @InjectRepository(ChattingHistory)
    private readonly chattingHistory: Repository<ChattingHistory>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
    @InjectRepository(S3Metadata)
    private readonly s3Repository: Repository<S3Metadata>,
    private readonly logger: CustomLoggerService,
    private configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly authService: AuthService,
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
  }

  /** NestJS 모듈이 초기화 될 때 호출 */
  onModuleInit() {
    this.logger.log('WebSocket server initialized');
  }
  /** 클라이언트가 WebSocket에 연결되었을 때 실행할 코드를 정의. */
  async handleConnection(client: Socket) {
    const authToken = client.handshake.auth.token;
    //this.logger.log(`ws conn auth token:${authToken}`);

    if (!authToken) {
      this.logger.error(`No authentication token :: ${client.id}`);
      throw new BadRequestException('No authentication token provided');
    }
    const userInfo = await jwtDecode(authToken);
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > userInfo.exp) {
      this.logger.error(`Token expired :: ${client.id}`);
    }
    this.clientMap.set(userInfo.subject, client);
    this.logger.log(`Client Connected: id:${client.id}`);
  }
  /** 클라이언트가 WebSocket 연결을 해제했을 때 실행할 코드를 정의. */
  async handleDisconnect(client: Socket) {
    const authToken = client.handshake.auth.token;
    //this.logger.log(`ws conn auth token:${authToken}`);

    if (!authToken) {
      this.logger.error(`No authentication token :: ${client.id}`);
      throw new BadRequestException('No authentication token provided');
    }
    const userInfo = await jwtDecode(authToken);
    this.clientMap.delete(userInfo.subject);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  async handlePing(client: Socket) {
    //this.logger.log(`client: [${client.id}], chatting healt check`);
    client.emit('pong', { message: 'pong' });

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
      //console.log('MONGO SAVE TEST ');
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
    const userInRoom = await this.userChatting.find({
      where: { chatting: { id: room_id }, user: { id: Not(sender_id) } },
    });
    for (const member of userInRoom) {
      const chatMemberId = member.user.id;
      const client = this.clientMap.get(chatMemberId);

      // TODO: client.emit('newMessage', { 서버 - 서버 꼭 다시 시도하기
      if (client) {
        try {
          this.server.emit('newMessage', {
            room_id,
            chatMemberId,
          });
        } catch (error) {
          console.log(error);
        }
      }
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

    const uploadValidator = await this.authService.fileUploadValidator(
      sender_id,
      S3Content.CHAT,
    );
    console.log(uploadValidator);
    if (uploadValidator) {
      const s3Upload = await this.s3Service.uploadChatFileToS3(
        sender_id,
        room_id,
        buffer,
        file_name,
        content_type,
        client_id,
      );

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

      try {
        await newMessage.save();
        //console.log('mongoose:', m);
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

      const userInRoom = await this.userChatting.find({
        where: { chatting: { id: room_id }, user: { id: Not(sender_id) } },
      });
      for (const member of userInRoom) {
        const chatMemberId = member.user.id;
        const client = this.clientMap.get(chatMemberId);

        // TODO: client.emit('newMessage', { 서버 - 서버 꼭 다시 시도하기
        if (client) {
          try {
            this.server.emit('newMessage', {
              room_id,
              chatMemberId,
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    } else {
      client.emit('fileUploadStatus', {
        status: 'failed',
        message: `일일 파일전송 횟수 초과
        (5회)`,
      });
    }
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
      this.logger.log(error);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() authChatDto: AuthChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room_type, room_id, uid } = authChatDto;
    // open이면 그냥 들여보내고, private면 체크가 필요함

    const userCheck = await this.userChatting.findOne({
      where: { chatting: { id: room_id }, user: { id: uid } },
    });
    const user = await this.userRepository.findOne({
      where: { id: uid },
    });
    // history check
    const chatHistory = await this.chattingHistory.findOne({
      where: { chatting: { id: room_id }, user: { id: uid } },
    });
    const currentTime = new Date();

    if (!chatHistory) {
      const newChatHistory = await this.chattingHistory.create({
        user: user,
        chatting: userCheck.chatting,
        last_enter: currentTime,
      });
      await this.chattingHistory.save(newChatHistory);
    }
    await this.chattingHistory.update(
      { user: { id: uid }, chatting: { id: room_id } },
      { last_enter: currentTime },
    );
    if (room_type === 'private') {
      client.join(`room-${room_id}`);
    } else if (userCheck) {
      throw new BadRequestException('Invalid User');
    }

    client.join(`room-${room_id}`);
    console.log(`Client ${client.id} joined room ${room_id}`);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() authChatDto: AuthChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room_id, uid } = authChatDto;
    try {
      client.leave(`room-${room_id}`);
      const currentTime = new Date();
      await this.chattingHistory.update(
        { user: { id: uid }, chatting: { id: room_id } },
        { last_exit: currentTime },
      );
    } catch (error) {
      this.logger.error(error);
    }
    console.log(`Client ${client.id} left room ${room_id}`);
    client.to(`room-${room_id}`).emit('roomLeft', { room_id });
  }

  @SubscribeMessage('unReadChatInfo')
  async handleChatInfo(
    @MessageBody() data: { room_id: number; chatMemberId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { room_id, chatMemberId } = data;
    console.log('qwe');
    const chattingHistory = await this.chattingHistory.findOne({
      where: { user: { id: chatMemberId }, chatting: { id: room_id } },
    });
    const lastExitTime = chattingHistory.last_exit;
    const messageCnt = await this.chatMessageModel.countDocuments({
      room_id: room_id.toString(),
      timestamp: { $gt: lastExitTime },
    });

    const lastMessageQuery = await this.chatMessageModel
      .findOne({
        room_id: room_id.toString(),
        timestamp: { $gt: lastExitTime },
      })
      .sort({ timestamp: -1 })
      .exec();
    let lastMessage: string;
    if (lastMessageQuery.message) {
      lastMessage = lastMessageQuery.message;
    } else if (lastMessageQuery.file_name) {
      lastMessage = '파일이 전송되었습니다.';
    }

    client.emit('newChatRoomInfo', {
      room_id,
      messageCnt,
      lastMessage,
    });
  }
}
