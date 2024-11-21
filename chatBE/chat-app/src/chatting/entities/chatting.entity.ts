import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum RoomType {
  OPEN = 'open',
  PRIVATE = 'private',
}

@Entity('chatting')
export class Chatting {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  created_at: Date;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 24, nullable: true })
  mongoRoom_id: string; // MongoDB 채팅방의 _id (24자 길이 문자열)
  // MongoDB의 _id는 ObjectId라는 특수한 타입이기 때문에, MySQL에서는 이를 문자열로 저장하는 것이 일반적

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.PRIVATE,
  })
  room_type: RoomType;
}
