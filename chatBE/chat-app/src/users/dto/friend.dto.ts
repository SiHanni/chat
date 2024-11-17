import { IsString } from 'class-validator';

export class FriendDto {
  @IsString()
  email: string;
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
