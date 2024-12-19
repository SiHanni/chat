import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/common/type/user.type';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { TokenHistory } from './entities/auth-history.entity';
import { checkTimeDiff } from 'src/common/time';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TokenHistory)
    private readonly tokenHistory: Repository<TokenHistory>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  generateAccessToken = (uid: number, email: string) => {
    try {
      const expiresIn = 30 * 60; //(30분)
      const tokenType = this.configService.get<string>('JWT_TOKEN_TYPE');
      const secretKey = this.configService.get<string>('JWT_SECRET');

      const payload: JWTPayload = {
        subject: uid,
        email: email,
        token_type: tokenType,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: secretKey,
        expiresIn: expiresIn,
      });
      this.logger.log(`generate access token :: user info = {uid: ${uid}}`);
      return accessToken;
    } catch (error) {
      this.logger.error(
        `Error generating access token : uid:${uid}, error: ${error}`,
      );
      throw new Error('Error generating access token');
    }
  };

  generateRefreshToken = (uid: number, email: string) => {
    try {
      const expiresIn = 60 * 60 * 24 * 7; // 1주
      const tokenType = this.configService.get<string>('JWT_TOKEN_TYPE');
      const secretKey = this.configService.get<string>('JWT_REFRESH_SECRET');

      const payload: JWTPayload = {
        subject: uid,
        email: email,
        token_type: tokenType,
      };

      const refreshToken = this.jwtService.sign(payload, {
        secret: secretKey,
        expiresIn: expiresIn,
      });
      const newTokenHistory = this.tokenHistory.create({
        uid: uid,
        email: email,
        refresh_token: refreshToken,
      });
      this.tokenHistory.save(newTokenHistory);
      this.logger.log(`generate refresh token :: user info = {uid: ${uid}}`);
      return refreshToken;
    } catch (error) {
      this.logger.error(
        `Error generating refresh token : uid:${uid}, error: ${error}`,
      );
      throw new Error('Error generating refresh token');
    }
  };

  async updateTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Requied Data Missing');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const { subject: uid, email, exp } = decoded;
      this.logger.log(JSON.stringify({ uid: uid, email: email, exp: exp }));

      const userData = await this.userRepository.findOne({
        where: { id: uid },
      });

      if (userData.id !== uid || userData.refresh_token !== refreshToken) {
        this.logger.error(
          `Security Error: Refresh Token Inconsistency, uid : ${uid}`,
        );
        throw new UnauthorizedException();
      }
      const userEmail = userData.email;

      const newAccessToken = this.generateAccessToken(uid, userEmail);

      const timediff = checkTimeDiff(exp);
      const refreshTokenStandard =
        this.configService.get<number>('REFRESH_TOKEN_EXP_HOUR') * 60 * 60; //(12시간)
      // 12시간보다 많이 남았다면 리프레쉬 토큰은 기존의 것으로 반환한다.
      if (timediff >= refreshTokenStandard) {
        //this.logger.log(`token update::uid:${uid}: Ac`);
        return {
          msg: 'success',
          accessToken: newAccessToken,
          refreshToken: refreshToken,
        };
      } else {
        const newRefreshToken = this.generateRefreshToken(uid, userEmail);

        userData.refresh_token = newRefreshToken;
        //await this.userRepository.save(userData);
        const updateData = await this.userRepository.update(
          { id: uid },
          { refresh_token: newRefreshToken },
        );
        if (updateData.affected === 0) {
          throw new InternalServerErrorException('Update Data failed');
        }
        this.logger.log(`token update::uid:${uid}: Ac & Re`);
        return {
          msg: 'success',
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }
    } catch (error) {
      this.logger.error(`Error updating tokens :refreshToken: uid: ${error}`);
      throw new Error('Error updating tokens');
    }
  }
}
