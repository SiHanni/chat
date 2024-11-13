// src/user/entities/user-friend.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_friends')
@Unique(['user', 'friend'])
export class UserFriend {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'friend_id', referencedColumnName: 'id' })
  friend: User;

  @Column({ default: false })
  is_accepted: boolean;

  @Column({ default: false })
  is_blacklist: boolean;
}
