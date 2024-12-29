import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum Content {
  CHAT = 'chat',
  PROFILE = 'profile',
}
@Entity('s3_metadata')
export class S3Metadata {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    precision: 0,
  })
  created_at: Date;

  @Column({ default: null })
  room_id: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  original_filename: string;

  @Column()
  uuid: string;

  @Column()
  s3_path: string;

  @Column()
  s3_key: string;

  @Column({ default: null })
  client_id: string;

  @Column({
    type: 'enum',
    enum: Content,
    default: null,
  })
  content_type: Content;
}
