import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '설효림', description: '유저 닉네임(고유)' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'sh@ab.com', description: '유저 이메일(고유)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234', description: '유저 비밀번호' })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is too weak',
  })
  password: string;

  @IsOptional()
  @IsString()
  profile_img?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;
}

// 문자열에 대문자와 소문자가 각각 하나 이상 포함되어야 함.
// 문자열에 숫자나 특수문자(공백이 아닌 문자)가 하나 이상 포함되어야 함.
// 문자열은 **마침표(.)**나 **줄바꿈(\n)**으로 끝날 수 없음.
