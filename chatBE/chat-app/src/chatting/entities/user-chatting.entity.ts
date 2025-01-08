import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chatting } from './chatting.entity';

@Entity('user_chatting')
@Unique(['user', 'chatting'])
export class UserChatting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chatting, { eager: true, nullable: false })
  @JoinColumn({ name: 'chatting_id', referencedColumnName: 'id' })
  chatting: Chatting;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ default: true })
  is_active: boolean; // 채팅방에서 유효한 참가자인지 여부 (나간 참가자 처리 등)

  @Column({ nullable: true })
  joined_at: Date; // 참가 일시
}
