import {
  Controller,
  Get,
  Post,
  //Put,
  Body,
  Req,
  Patch,
  Delete,
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
import { FriendDto } from './dto/friend.dto';
import { FriendInfoDto } from './dto/friend.dto';
import { UserFriend } from './entities/user-friend.entity';
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

  @Get('getMyProfile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() request: Request) {
    const userIdFromJwt = (request as CustomRequest).user?.subject;
    if (!userIdFromJwt) {
      throw new UnauthorizedException('not allowed user request');
    }
    return await this.usersService.getMyProfile(userIdFromJwt);
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const userIdFromJwt = (request as CustomRequest).user?.subject;
    if (!userIdFromJwt) {
      throw new UnauthorizedException('not allowed user request');
    }
    return await this.usersService.updateProfile(userIdFromJwt, updateUserDto);
  }

  @Get('find-friend')
  @UseGuards(AuthGuard)
  async findFriend(@Body() friendDto: FriendDto): Promise<FriendInfoDto> {
    return this.usersService.findFriend(friendDto);
  }

  @Post('send/friend-request')
  @UseGuards(AuthGuard)
  async sendFriendRequest(
    @Req() request: Request,
    @Body() friendDto: FriendDto,
  ): Promise<UserFriend[]> {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.sendFriendRequest(uid, friendDto);
  }

  @Patch('accept/friend-request')
  @UseGuards(AuthGuard)
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() friendDto: FriendDto,
  ): Promise<UserFriend[]> {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.acceptFriendRequest(uid, friendDto);
  }

  @Delete('refuse/friend-request')
  @UseGuards(AuthGuard)
  async refuseFriendRequest(
    @Req() request: Request,
    @Body() friendDto: FriendDto,
  ): Promise<boolean> {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.refuseFriendRequest(uid, friendDto);
  }

  @Get('friends/lists')
  @UseGuards(AuthGuard)
  async getFriends(@Req() request: Request) {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.getFriendLists(uid);
  }

  @Get('friend/requests')
  @UseGuards(AuthGuard)
  async getFriendRequests(@Req() request: Request) {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.getFriendRequests(uid);
  }
  // 가드 사용 예시
  // @UseGuards(AuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
