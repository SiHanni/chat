import {
  Controller,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // 나중에 모든 엔드포인트는 암호화하던가 하기
  @Post('updatetoken')
  @UseGuards(AuthGuard)
  async updateTokens(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    console.log('USER REFRESH TOKEN IN HTTP ONLY COOKIE', refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return await this.authService.updateTokens(refreshToken);
  }
}
