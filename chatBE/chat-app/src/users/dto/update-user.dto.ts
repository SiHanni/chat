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
  phone_number?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  status_msg?: string;
}

export class UpdateProfileImageDto {
  @IsOptional()
  @IsString()
  profile_img_name?: string;

  @IsOptional()
  @IsString()
  profile_img_data?: Buffer;

  @IsOptional()
  @IsString()
  profile_img_content_type?: string;
}
