import { IsString, IsEmail, IsNumber } from 'class-validator';

export class UserDto {
  @IsNumber()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  profile_img: string;
}
