import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Req,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Res,
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
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { Response } from 'express';

interface CustomRequest extends Request {
  user?: {
    subject: number;
    username: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post('signUp')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @Post('signIn')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signIn(
    @Body() signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, last_login, user } =
      await this.usersService.signIn(signInUserDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken, last_login, user };
  }

  @Get('getMyProfile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() request: Request) {
    this.logger.log('Logger TEST');
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
  async findFriend(@Query() friendDto: FriendDto): Promise<FriendInfoDto> {
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
    if (!uid) {
      throw new BadRequestException('Invalid Request');
    }
    return this.usersService.getFriendLists(uid);
  }

  @Get('friend/requests')
  @UseGuards(AuthGuard)
  async getFriendRequests(@Req() request: Request) {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.getFriendRequests(uid);
  }
  //가드 사용 예시
  //@UseGuards(AuthGuard)
  //@Get('profile')
  //getProfile(@Request() req) {
  //  return req.user;
  //}
}
