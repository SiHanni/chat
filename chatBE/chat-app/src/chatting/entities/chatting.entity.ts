import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
  createdAt: Date;

  @Column({ nullable: true })
  name: string; // 채팅방 이름, 만약 없다면 디폴트로 뭐하지..

  @Column({ default: 0 })
  participantCount: number; // 채팅방 참가자 수

  @Column({ type: 'varchar', length: 24, nullable: true })
  mongoRoomId: string; // MongoDB 채팅방의 _id (24자 길이 문자열)
  // MongoDB의 _id는 ObjectId라는 특수한 타입이기 때문에, MySQL에서는 이를 문자열로 저장하는 것이 일반적
}
