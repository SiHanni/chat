import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChattingService } from './chatting.service';
import { ChatMessageDto } from './dto/talk-chatting.dto';
import { ChatMessage } from './mongo/chat-message.schema';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChattingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chattingService: ChattingService) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() room_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room_id);
    console.log(`${client.id} joined room: ${room_id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    { message, sender_id, room_id }: ChatMessageDto, // 메시지 DTO
    @ConnectedSocket() client: Socket,
  ) {
    // 메시지 MongoDB에 저장
    const savedMessage = await this.chattingService.saveMessage(message);

    // 채팅방에 참여한 모든 사용자에게 메시지 전송
    this.server.to(message.room_id.toString()).emit('newMessage', savedMessage);
  }
}
