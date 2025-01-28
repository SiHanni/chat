import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { Chatting } from './entities/chatting.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { LeaveChattingDto } from './dto/leave-chatting.dto';

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
  @Post('room')
  @UseGuards(AuthGuard)
  async createChatting(
    @Req() request: Request,
    @Body() createChattingDto: CreateChattingDto,
  ): Promise<Chatting> {
    const uid = (request as CustomRequest).user?.subject;
    if (!uid) {
      throw new BadRequestException('Invalid Request');
    }
    return this.chattingService.createChatting(uid, createChattingDto);
  }
  @Get('rooms')
  @UseGuards(AuthGuard)
  async getUserChatRooms(@Req() request: Request) {
    const uid = (request as CustomRequest).user?.subject;
    if (!uid) {
      throw new BadRequestException('Invalid Request');
    }
    return this.chattingService.getUserChatRooms(uid);
  }
  @Get('messages')
  @UseGuards(AuthGuard)
  async getMessages(
    @Req() request: Request,
    @Query('room_id') room_id: number,
  ) {
    const uid = (request as CustomRequest).user?.subject;
    if (!room_id || !uid) {
      throw new BadRequestException('Invalid Request');
    }
    return this.chattingService.getMessages(uid, room_id);
  }
  @Post('leave')
  @HttpCode(HttpStatus.OK) // 성공시 200 상태 코드 반환
  @UseGuards(AuthGuard)
  async leaveChatting(
    @Req() request: Request,
    @Body() leaveChattingDto: LeaveChattingDto,
  ): Promise<{ message: string }> {
    const uid = (request as CustomRequest).user?.subject;
    if (!uid) {
      throw new BadRequestException('Invalid Request');
    }

    try {
      await this.chattingService.leaveChatting(uid, leaveChattingDto);
      return { message: 'Successfully left the chat room' };
    } catch (error) {
      console.error('Error leaving chat room:', error);
      throw new InternalServerErrorException('Failed to leave the chat room');
    }
  }
}
