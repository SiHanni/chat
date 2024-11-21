import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Chatting } from './entities/chatting.entity';
import { UserChatting } from './entities/user-chatting.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { LeaveChattingDto } from './dto/leave-chatting.dto';

import { Model } from 'mongoose';
import { ChatMessage } from './mongo/chat-message.schema';
import { ChatMessageDto } from './dto/talk-chatting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RoomType } from './entities/chatting.entity';

@Injectable()
export class ChattingService {
  constructor(
    @InjectRepository(Chatting)
    private readonly chattingRepository: Repository<Chatting>,
    @InjectRepository(UserChatting)
    private readonly userChattingRepository: Repository<UserChatting>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
  ) {}

  async createChatting(
    uid: number,
    createChattingDto: CreateChattingDto,
  ): Promise<Chatting> {
    const { name, friend_ids } = createChattingDto;

    const userCheck = await this.userRepository.find({
      where: { id: In(friend_ids) },
    });
    const validUser = userCheck.map((user) => user.id);
    const validUserIds = friend_ids.filter((id) => validUser.includes(id));
    const participants: number[] = !validUserIds.includes(uid)
      ? (validUserIds.push(uid), validUserIds)
      : validUserIds;
    const participantsName: string = userCheck
      .map((user) => user.username)
      .join(',');

    const chatName = name ? name : participantsName;
    const owner = await this.userRepository.findOne({
      where: { id: uid },
    });
    const newChatting = this.chattingRepository.create({
      name: chatName,
      owner: owner,
    });
    const saveChat = await this.chattingRepository.save(newChatting);

    for (const users_id of participants) {
      const user = await this.userRepository.findOne({
        where: { id: users_id },
      });
      if (!user) {
        throw new BadRequestException(`User not found`);
      }
      const userChat = this.userChattingRepository.create({
        chatting: saveChat,
        user: user,
        joined_at: new Date(),
      });
      await this.userChattingRepository.save(userChat);
    }
    return saveChat;
  }

  async leaveChatting(
    uid: number,
    leaveChattingDto: LeaveChattingDto,
  ): Promise<void> {
    const userChat = await this.userChattingRepository.findOne({
      where: {
        user: { id: uid },
        chatting: { id: leaveChattingDto.chatting_id },
      },
    });

    if (!userChat) {
      throw new BadRequestException('User is not in this chat room');
    }
    try {
      await this.userChattingRepository.remove(userChat);
    } catch {
      throw new InternalServerErrorException('error occured at leave chat');
    }
  }
  async saveMessage(messageDto: ChatMessageDto): Promise<ChatMessage> {
    const message = new this.chatMessageModel(messageDto);
    return message.save();
  }

  async getUserChatRooms(uid: number) {
    const openChats = await this.chattingRepository.find({
      where: { room_type: RoomType.OPEN },
    });
    const privateChats = await this.chattingRepository
      .createQueryBuilder('chatting')
      .innerJoin('user_chatting', 'uc', 'chatting.id = uc.chatting_id')
      .where('chatting.room_type = :room_type', { room_type: RoomType.PRIVATE })
      .andWhere('uc.user_id=:uid', { uid })
      .getMany();
    console.log(openChats);
    console.log(privateChats);
    return [...openChats, ...privateChats];
  }
}
