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
import { FriendDto } from './dto/friend.dto';
import { User } from './entities/user.entity';
import { UserFriend } from './entities/user-friend.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userFriendRepository: Repository<UserFriend>,
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
  async sendFriendRequest(
    uid: number,
    { friend_id }: FriendDto,
  ): Promise<UserFriend> {
    if (uid === friend_id) {
      throw new NotFoundException(
        'You cannot send a friend request to yourself.',
      );
    }
    const user = await this.userRepository.findOne({ where: { id: uid } });
    const friend = await this.userFriendRepository.findOne({
      where: { id: friend_id },
    });
    if (!user || !friend) {
      throw new NotFoundException('User or friend not found.');
    }
    const existingRequest = await this.userFriendRepository.findOne({
      where: [
        { user: { id: uid }, friend: { id: friend_id } },
        { user: { id: friend_id }, friend: { id: uid } },
      ],
    });
    if (existingRequest) {
      throw new NotFoundException(
        'Friend request already exists or friendship is established.',
      );
    }
    const friendRequest = this.userFriendRepository.create({
      user,
      friend,
      is_accepted: false,
    });

    return await this.userFriendRepository.save(friendRequest);
  }
  async acceptFriendRequest(
    uid: number,
    { friend_id }: FriendDto,
  ): Promise<UserFriend> {
    const friendRequest = await this.userFriendRepository.findOne({
      where: [
        { user: { id: uid }, friend: { id: friend_id }, is_accepted: false },
        { user: { id: friend_id }, friend: { id: uid }, is_accepted: false },
      ],
    });
    if (!friendRequest) {
      throw new NotFoundException(
        'Friend request not found or already accepted.',
      );
    }
    friendRequest.is_accepted = true;
    return await this.userFriendRepository.save(friendRequest);
  }
  async getFriendLists(uid: number): Promise<User[]> {
    const userFriends = await this.userFriendRepository.find({
      where: [
        { user: { id: uid }, is_accepted: true, is_blacklist: false },
        { friend: { id: uid }, is_accepted: true, is_blacklist: false },
      ],
      relations: ['user', 'friend'],
    });
    return userFriends.map((userFriend) =>
      userFriend.user.id === uid ? userFriend.friend : userFriend.user,
    );
  }
  async getFriendRequests(uid: number): Promise<UserFriend[]> {
    return this.userFriendRepository.find({
      where: { friend: { id: uid }, is_accepted: false },
      relations: ['user'],
    });
  }
}
