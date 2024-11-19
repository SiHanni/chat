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
//import { ChattingService } from './chatting.service';
import { ChatFileDto, ChatMessageDto } from './dto/talk-chatting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './mongo/chat-message.schema';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChattingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  //private fileStore: {
  //  [Socket_id: string]: { fileBuffer: Buffer; fileName: string };
  //} = {};
  constructor(
    //private readonly chattingService: ChattingService,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
  ) {}

  onModuleInit() {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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

    console.log('Message received:', chatMessageDto);

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
      await newMessage.save(); // 아직 동작 안함.
    } catch (error) {
      console.log('mongoose:', error);
    }
    try {
      this.server.to(`room-${room_id}`).emit('receiveMessage', {
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
    } = chatFiledto;
    // base64로 파일을 받았고, Buffer로 변환후 fs에 저장
    const buffer = Buffer.from(file_data, 'base64');
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

    const roomDir = path.join(uploadsDir, `room-${room_id}`);
    const userDir = path.join(roomDir, `${sender_id}`);
    await fsPromises.mkdir(userDir, { recursive: true });
    const filePath = path.join(userDir, file_name);

    // 저장
    try {
      await fsPromises.writeFile(filePath, buffer);
    } catch (err) {
      console.error('File save failed:', err);
      return;
    }

    const newMessage = new this.chatMessageModel({
      client_id: client.id,
      room_id: room_id,
      sender_id: sender_id,
      sender_email: sender_email,
      sender_username: sender_username,
      sender_profile_img: sender_profile_img,
      timestamp: new Date(),
      file_name: file_name,
      file_path: filePath,
    });
    try {
      await newMessage.save(); // 아직 동작 안함.
    } catch (error) {
      console.log('mongoose:', error);
    }

    const fileUrl = `/uploads/${path.relative(uploadsDir, filePath)}`;
    this.server.to(`room-${room_id}`).emit('receiveFile', {
      sender_id: sender_id,
      sender_username: sender_username,
      sender_email: sender_email,
      sender_profile_img: sender_profile_img,
      file_url: fileUrl,
      file_name: file_name,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('downloadFile')
  handleDownloadFile(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const { file_url } = data;
    console.log(file_url);
    const uploadsDir = path.join(__dirname, '..', '..');
    console.log(uploadsDir);
    const filePath = path.join(uploadsDir, file_url);

    // 파일을 base64로 읽기
    fsPromises
      .readFile(filePath, { encoding: 'base64' })
      .then((fileData) => {
        // base64로 인코딩된 파일을 클라이언트로 전송
        socket.emit('fileDownload', {
          file_data: fileData,
          file_url: file_url,
        });
      })
      .catch((error) => {
        console.error('Error reading file:', error);
      });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room_id: number,
    @ConnectedSocket() client: Socket,
  ) {
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
  }
}
