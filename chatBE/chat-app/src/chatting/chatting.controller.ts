import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { Chatting } from './entities/chatting.entity';
import { AuthGuard } from 'src/auth/auth.guard';

interface CustomRequest extends Request {
  user?: {
    subject: number;
    username: string;
  };
}

@Controller('chat')
export class ChattingController {
  constructor(private readonly chattingService: ChattingService) {}

  /** 채팅방 생성 */
  @Post('create')
  @UseGuards(AuthGuard)
  async createChatting(
    @Req() request: Request,
    @Body() createChattingDto: CreateChattingDto,
  ): Promise<Chatting> {
    const uid = (request as CustomRequest).user?.subject;
    return this.chattingService.createChatting(uid, createChattingDto);
  }
  @Get('rooms')
  @UseGuards(AuthGuard)
  async getUserChatRooms(@Req() request: Request) {
    const uid = (request as CustomRequest).user?.subject;
    return this.chattingService.getUserChatRooms(uid);
  }
}
