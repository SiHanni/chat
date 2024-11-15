import { IsInt } from 'class-validator';

export class CreateChattingDto {
  name?: string;
  @IsInt({ each: true })
  friend_ids: number[];
}
