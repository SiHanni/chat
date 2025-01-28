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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signIn-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FriendDto } from './dto/friend.dto';
import { FriendInfoDto } from './dto/friend.dto';
import { Request } from 'express';
import { Response } from 'express';
import { ChangePwdInput } from './type';

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
    //private readonly logger: CustomLoggerService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @Post('sign-in')
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

  @Get('profile')
  @UseGuards(AuthGuard)
  async getMyProfile(@Req() request: Request) {
    const userIdFromJwt = (request as CustomRequest).user?.subject;
    if (!userIdFromJwt) {
      throw new UnauthorizedException('not allowed user request');
    }
    return await this.usersService.getMyProfile(userIdFromJwt);
  }

  @Patch('profile-img')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profile_img_data'))
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('profile_img_name') profileImgName: string,
    @Body('profile_img_content_type') profileImgContentType: string,
    @Req() request: Request,
  ) {
    const userIdFromJwt = (request as CustomRequest).user?.subject;
    if (!userIdFromJwt) {
      throw new UnauthorizedException('not allowed user request');
    }
    return await this.usersService.updateProfileImage(userIdFromJwt, {
      profile_img_name: profileImgName,
      profile_img_content_type: profileImgContentType,
      profile_img_data: file.buffer, // multer가 파일을 buffer로 변환
    });
  }

  @Patch('profile')
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
  ): Promise<{ msg: string }> {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.sendFriendRequest(uid, friendDto);
  }

  @Patch('accept/friend-request')
  @UseGuards(AuthGuard)
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() friendDto: FriendDto,
  ): Promise<{ msg: string }> {
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

  @Get('friends')
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

  @Post('change-pwd')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() request: Request,
    @Body() changePwdDto: ChangePwdInput,
  ) {
    const uid = (request as CustomRequest).user?.subject;
    return this.usersService.changePassword(uid, changePwdDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logOut(@Req() request: Request, @Res() response: Response) {
    const uid = (request as CustomRequest).user?.subject;
    console.log(`${uid} request logout`);
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    return response.status(200).json({ message: 'Successfully logged out' });
  }
  //가드 사용 예시
  //@UseGuards(AuthGuard)
  //@Get('profile')
  //getProfile(@Request() req) {
  //  return req.user;
  //}
}
