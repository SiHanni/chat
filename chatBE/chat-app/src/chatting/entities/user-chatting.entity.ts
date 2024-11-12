import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chatting } from './chatting.entity';

@Entity('user_chatting')
export class UserChatting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chatting, { eager: true })
  @JoinColumn({ name: 'chatting_id' })
  chatting: Chatting;

  @Column({ default: true })
  is_active: boolean; // 채팅방에서 유효한 참가자인지 여부 (나간 참가자 처리 등)

  @Column({ nullable: true })
  joinedAt: Date; // 참가 일시

  @Column({ nullable: true })
  leftAt: Date; // 나간 일시 (있다면)
}
