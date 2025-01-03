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
@Unique(['requester', 'friend'])
export class UserFriend {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    nullable: true,
    default: null,
    precision: 0,
  })
  updated_at: Date;

  @Column({ default: false })
  is_request: boolean;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'requester_id', referencedColumnName: 'id' })
  requester: User;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'friend_id', referencedColumnName: 'id' })
  friend: User;

  @Column({ default: false })
  is_accepted: boolean;

  @Column({ default: false })
  is_blacklist: boolean;

  @Column({
    name: 'accepted_at',
    type: 'timestamp',
    nullable: true,
    default: null,
    precision: 0,
  })
  accepted_at: Date;
}
