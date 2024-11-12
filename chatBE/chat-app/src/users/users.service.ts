import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import isImageUrl from 'image-url-validator';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signIn-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  // 회원가입에는 이메일, 유저네임, 패스워드만 받고 프로필 이미지는 기본이미지, 폰 인증은 추후
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    const checkUser = await this.userRepository.findOne({
      where: [
        { email, is_active: true },
        { username, is_active: true },
      ],
    });

    if (checkUser) {
      if (checkUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (checkUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      is_active: true,
    });
    try {
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while saving the user',
      );
    }
  }
  async signIn(signInUserDto: SignInUserDto): Promise<{ accessToken: string }> {
    const { email, password } = signInUserDto;

    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw new UnauthorizedException('Invalid password');
    }

    // TODO: JWT 발행 , JWT 정책 필요
    const payload = { subject: user.id, username: user.username };
    try {
      return { accessToken: await this.jwtService.signAsync(payload) };
    } catch {
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  async updateProfile(
    uid: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { username, profile_img } = updateUserDto;

    const user = await this.userRepository.findOne({
      where: { id: uid },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (username) {
      const checkUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (checkUsername && checkUsername.id !== user.id) {
        throw new BadRequestException('Already used username');
      }
      user.username = username;
    }

    if (profile_img) {
      const isValidImageUrl = await isImageUrl(profile_img);
      if (!isValidImageUrl) {
        throw new BadRequestException('Inavalid image Url');
      }
      user.profile_img = profile_img;
    }
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
  // async signOut(): Promise<{ msg: string }> {}
}
