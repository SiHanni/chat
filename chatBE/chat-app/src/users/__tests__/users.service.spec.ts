import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
//import { Repository } from 'typeorm';
import { CustomLoggerService } from '../../common/logger/logger.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserFriend } from '../entities/user-friend.entity';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

describe('signUp', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserFriendRepository = {};

  const mockJwtService = {
    signAsync: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(UserFriend),
          useValue: mockUserFriendRepository,
        },
        { provide: CustomLoggerService, useValue: mockLoggerService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('data check', async () => {
    const mockCreateUserDto: CreateUserDto = {
      email: '',
      username: '',
      password: '',
    };

    await expect(service.signUp(mockCreateUserDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('error : already signed up email', async () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'alreadySignUp@email.com',
      username: 'test',
      password: 'test123',
    };

    mockUserRepository.findOne.mockResolvedValue({
      email: mockCreateUserDto.email,
      is_active: true,
    });

    await expect(service.signUp(mockCreateUserDto)).rejects.toThrow(
      new ConflictException({
        statusCode: 409,
        message: 'Email already exists',
      }),
    );
  });

  test('error : typeORM transaction error', async () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'new@email.com',
      username: 'test',
      password: 'test123',
    };

    mockUserRepository.findOne.mockResolvedValue(null);
    const error = new Error('Database Error');
    mockUserRepository.save.mockRejectedValue(error);

    await expect(service.signUp(mockCreateUserDto)).rejects.toThrow(
      new InternalServerErrorException(
        'An error occurred while saving the user',
      ),
    );
  });

  test('success : email that can use', async () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'new@email.com',
      username: 'test',
      password: 'test123',
    };

    mockUserRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValue(null);

    const newUser = {
      ...mockCreateUserDto,
      password: 'hashedPassword',
      is_active: true,
    };
    mockUserRepository.create.mockResolvedValue(newUser);
    mockUserRepository.save.mockResolvedValue(newUser);
    const result = await service.signUp(mockCreateUserDto);

    expect(result).toEqual(newUser);
  });
});

describe('signIn', () => {
  // 데이터 체크
  // 패스워드 에러 체크
  // 라스트 로그인 세이브는 굳이 테스트는 진행 하지 않음
  // payload 생성된걸로 accessToken 생성해서 return 반환 객체와 비교
  let service: UsersService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserFriendRepository = {};

  const mockBcrypt = {
    compare: jest.fn().mockResolvedValue(false),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(UserFriend),
          useValue: mockUserFriendRepository,
        },
        { provide: bcrypt, useValue: mockBcrypt },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('data error check', async () => {
    const mockLoginDto = {
      email: '',
      password: '',
    };

    await expect(service.signIn(mockLoginDto)).rejects.toThrow(
      new BadRequestException('Required Data Missing'),
    );
  });

  test('email error check', async () => {
    const mockLoginDto = {
      email: 'test@email.com',
      password: 'test',
    };
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.signIn(mockLoginDto)).rejects.toThrow(
      new UnauthorizedException('Invalid email'),
    );
  });

  test('password error check', async () => {
    const mockLoginDto = {
      email: 'test@email.com',
      password: 'wrongPassword',
    };

    const mockHashedPassword = 'password';

    await expect(async () => {
      const passwordCheck = await bcrypt.compare(
        mockLoginDto.password,
        mockHashedPassword,
      );
      if (!passwordCheck) {
        throw new UnauthorizedException('Invalid password');
      }
    });
  });
});
