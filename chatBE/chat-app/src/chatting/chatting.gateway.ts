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
import { ChattingService } from './chatting.service';
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
    private readonly chattingService: ChattingService,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMsg')
  async handleMsg(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { room_id, sender_id, message } = chatMessageDto;

    const newMsg = new this.chatMessageModel({
      client_id: client.id,
      room_id: room_id,
      sender_id: sender_id,
      message: message,
      timestamp: new Date(),
    });
    await newMsg.save();

    this.server.to(`room-${room_id}`).emit('receiveMessage', {
      sender_id: sender_id,
      message: message,
      timestamp: newMsg.timestamp,
    });

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
