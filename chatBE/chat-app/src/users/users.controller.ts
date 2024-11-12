import {
  Controller,
  //Get,
  Post,
  Put,
  Body,
  Req,
  //Patch,
  Param,
  //Delete,
  //HttpException,
  //HttpStatus,
  UsePipes,
  ValidationPipe,
  //ParseIntPipe,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signIn-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import { User } from './entities/user.entity';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: {
    subject: number;
    username: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signUp')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @Post('signIn')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(@Body() signInUserDto: SignInUserDto) {
    return await this.usersService.signIn(signInUserDto);
  }

  @Put('update/:uid')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Param('uid') uid: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request, // 인증된 사용자의 정보는 request.user에 저장
  ) {
    const userIdFromJwt = (request as CustomRequest).user?.subject;
    if (userIdFromJwt !== uid) {
      throw new UnauthorizedException('not allowed user request');
    }
    return await this.usersService.updateProfile(uid, updateUserDto);
  }

  // 가드 사용 예시
  // @UseGuards(AuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
