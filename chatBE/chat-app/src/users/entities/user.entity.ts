import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UserGrade {
  NORMAL = 'normal',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  MARU = 'maru',
}

@Entity('user')
export class User {
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

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profile_img: string;

  @Column({ default: null })
  status_msg: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  last_login: Date;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({
    type: 'enum',
    enum: UserGrade,
    default: UserGrade.NORMAL,
  })
  user_grade: UserGrade;
}
