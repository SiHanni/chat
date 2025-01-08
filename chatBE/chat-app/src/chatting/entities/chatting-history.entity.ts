import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Chatting } from './chatting.entity';

@Entity('chatting_history')
@Unique(['user', 'chatting'])
export class ChattingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Chatting, { eager: true, nullable: false })
  @JoinColumn({ name: 'chatting_id', referencedColumnName: 'id' })
  chatting: Chatting;

  @Column({ nullable: true })
  last_enter: Date;

  @Column({ nullable: true })
  last_exit: Date;
}
