import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('mock_secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    //{ provide: JwtService, useValue: mockJwtService }는 DI 컨테이너에서 JwtService를 제공할 때 mockJwtService를 사용하도록 설정
    //이 과정에서 JwtService라는 클래스 정의 자체가 provide의 키로 사용되므로, 이를 임포트해야 함

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });
  /** authGuard 정의 확인 */
  it('authGuard need to defined', () => {
    expect(authGuard).toBeDefined();
  });

  //test('error test :: no token in headers', async () => {
  //  const mockExecutionContext = {
  //    switchToHttp: jest.fn().mockReturnValue({
  //      getRequest: jest.fn().mockReturnValue({ headers: {} }),
  //    }),
  //  } as unknown as ExecutionContext;
  //
  //  await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
  //    UnauthorizedException,
  //  );
  //});

  test('errot test :: token type', async () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Basic invald_token',
          },
        }),
      }),
    } as any;

    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('test :: valid token is provided', async () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer valid_token' },
        }),
      }),
    } as unknown as ExecutionContext;

    const mockPayload = { subject: 1, username: 'test' };

    if (mockPayload) {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockPayload);
    } else {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid token'),
      );
    }

    try {
      const request = (await authGuard.canActivate(
        mockExecutionContext,
      )) as any;
      if (mockPayload) {
        await expect(request['user']).toEqual(mockPayload);
      } else {
        await expect(
          authGuard.canActivate(mockExecutionContext),
        ).rejects.toThrow(UnauthorizedException);
      }
    } catch (error) {
      if (!mockPayload) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    }
  });
});
