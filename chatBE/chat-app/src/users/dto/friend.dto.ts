import { IsInt, IsNotEmpty } from 'class-validator';

export class FriendDto {
  @IsInt()
  @IsNotEmpty()
  friend_id: number;
}
