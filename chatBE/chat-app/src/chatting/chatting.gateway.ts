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
import { ChatMessageDto } from './dto/talk-chatting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './mongo/chat-message.schema';

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
        sender_id: sender_id,
        message: message,
        timestamp: newMessage.timestamp,
      });
    } catch (error) {
      console.log('err', error);
    }

    console.log(`Message from ${sender_id}: ${message}`);
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
