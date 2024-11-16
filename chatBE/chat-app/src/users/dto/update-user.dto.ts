import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  ALIEN = 'alien',
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

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
