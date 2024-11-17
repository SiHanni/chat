import { IsInt, IsOptional, IsString } from 'class-validator';

export class FriendDto {
  @IsInt()
  @IsOptional()
  friend_id?: number;
  @IsString()
  @IsOptional()
  email?: string;
}

export class FriendInfoDto {
  @IsString()
  username: string;
  @IsString()
  profile_img: string;
  @IsString()
  status_msg: string;
}
