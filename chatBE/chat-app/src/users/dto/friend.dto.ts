import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class FriendDto {
  @IsInt()
  @IsNotEmpty()
  friend_id: number;
}

export class FriendInfoDto {
  @IsString()
  username: string;
  @IsString()
  profile_img: string;
  @IsString()
  status_msg: string;
}
