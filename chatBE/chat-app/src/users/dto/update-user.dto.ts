import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  ALIEN = 'alien',
}

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  profile_img?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
