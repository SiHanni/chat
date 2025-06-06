import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // 나중에 모든 엔드포인트는 암호화하던가 하기
  @Post('update/token')
  @ApiOperation({ summary: 'Auth 토큰 업데이트: 서버용' })
  @ApiResponse({
    status: 200,
    description: '성공적으로 Auth 토큰이 생성/갱신 됌',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @UseGuards(AuthGuard)
  async updateTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenInCookie = req.cookies['refreshToken'];

    if (!refreshTokenInCookie) {
      throw new UnauthorizedException();
    }
    const { msg, accessToken, refreshToken } =
      await this.authService.updateTokens(refreshTokenInCookie);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { msg, accessToken };
  }
}
