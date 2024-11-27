import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
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

    const users = await this.userRepository.find({
      where: { id: In([...friend_ids, uid]) },
    });

    if (!users.length) {
      throw new NotFoundException('No valid users found.');
    }

    const validUserIds = users.map((user) => user.id);
    if (!validUserIds.includes(uid)) validUserIds.push(uid);
    const participantsName = users.map((user) => user.username).join(', ');

    const chatName = name ? name : participantsName;
    const owner = await this.userRepository.findOne({
      where: { id: uid },
    });
    const newChatting = this.chattingRepository.create({
      name: chatName,
      owner: owner,
    });
    const saveChat = await this.chattingRepository.save(newChatting);

    //for (const users_id of validUserIds) {
    //  const userChat = this.userChattingRepository.create({
    //    chatting: saveChat,
    //    user: { id: users_id },
    //    joined_at: new Date(),
    //  });
    //  await this.userChattingRepository.save(userChat);
    //}
    const userChattingEntries = validUserIds.map((user_id) => ({
      chatting: saveChat,
      user: users.find((user) => user.id === user_id),
      joined_at: new Date(),
    }));
    await this.userChattingRepository.save(userChattingEntries);
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
    //console.log(openChats);
    //console.log(privateChats);
    return { uid: uid, chat: [...openChats, ...privateChats] };
  }

  async getMessages(uid: number, room_id: number) {
    // 해당 uid가 해당 채팅방에 속해있는 유저인지 부터 확인
    const userCheck = await this.userChattingRepository.find({
      where: { user: { id: uid }, chatting: { id: room_id } },
    });

    if (userCheck.length < 1) {
      throw new BadRequestException('no room');
    }
    const messages = await this.chatMessageModel
      .find({ room_id })
      .select(
        'message sender_id sender_email sender_username sender_profile_img room_id timestamp file_name file_path',
      )
      .sort({ Timestamp: 1 });
    return messages;

    // 채팅 메세지를 몽고 디비에서 가져와 반환
  }
}
