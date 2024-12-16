import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // 나중에 모든 엔드포인트는 암호화하던가 하기
  @Post('updatetoken')
  @UseGuards(AuthGuard)
  async updateTokens(@Body() body: { refreshToken: string }) {
    return await this.authService.updateTokens(body);
  }
}
