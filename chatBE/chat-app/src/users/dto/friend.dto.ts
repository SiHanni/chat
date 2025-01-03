import { IsString, IsNumber } from 'class-validator';

export class FriendDto {
  @IsNumber()
  friend_id?: number;
  @IsString()
  email?: string;
  @IsString()
  username?: string;
}

export class FriendInfoDto {
  @IsString()
  username: string;
  @IsString()
  profile_img: string;
  @IsString()
  status_msg: string;
  @IsString()
  email: string;
}
