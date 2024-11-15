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
import { Gender } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFriend)
    private readonly userFriendRepository: Repository<UserFriend>,
    private jwtService: JwtService,
    private configService: ConfigService,
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
  async signIn(
    signInUserDto: SignInUserDto,
  ): Promise<{ accessToken: string; last_login: Date }> {
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
    user.last_login = new Date();
    await this.userRepository.save(user);
    // TODO: JWT 발행 , JWT 정책 필요
    const payload = { subject: user.id, username: user.username };
    const secret = this.configService.get<string>('JWT_SECRET');
    try {
      return {
        accessToken: await this.jwtService.signAsync(payload, { secret }),
        last_login: user.last_login,
      };
    } catch {
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  async updateProfile(
    uid: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { username, profile_img, gender } = updateUserDto;

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

    if (gender) {
      console.log(gender, Gender.FEMALE);
      if (![Gender.MALE, Gender.FEMALE, Gender.ALIEN].includes(gender)) {
        throw new BadRequestException('Invalid gender value');
      }
      user.gender = gender;
    }
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
  // async signOut(): Promise<{ msg: string }> {}

  /** 친구 요청 */
  async sendFriendRequest(
    uid,
    { friend_id }: FriendDto,
  ): Promise<UserFriend[]> {
    if (uid === friend_id) {
      throw new BadRequestException('Inavalid request');
    }
    const user = await this.userRepository.findOne({ where: { id: uid } });
    const friend = await this.userRepository.findOne({
      where: { id: friend_id },
    });
    if (!user || !friend) {
      throw new BadRequestException('Inavalid request:: No target');
    }

    //const existingRequest = await this.userFriendRepository
    //  .createQueryBuilder('user_friends')
    //  .where(
    //    '(user_friends.user_id = :uid AND user_friends.friend_id = :friend_id AND user_friends.is_accepted = true)' +
    //      'OR' +
    //      '(user_friends.user_id = :friend_id AND user_friends.friend_id = :uid AND user_friends.is_accepted = true)',
    //    { uid, friend_id },
    //  ).getMany();
    const alreadyFriend = await this.userFriendRepository.find({
      where: [
        {
          user: { id: uid },
          friend: { id: friend_id },
          is_accepted: true,
        },
        {
          user: { id: friend_id },
          friend: { id: uid },
          is_accepted: true,
        },
      ],
    });
    if (alreadyFriend.length > 0) {
      throw new BadRequestException('Inavalid request:: Already friend');
    }

    const existingRequest = await this.userFriendRepository.find({
      where: [
        {
          user: { id: uid },
          friend: { id: friend_id },
          is_accepted: false,
        },
        //{
        //  user: { id: friend_id },
        //  friend: { id: user_id },
        //  is_accepted: false,
        //},
      ],
    });
    if (existingRequest.length > 0) {
      // 10초 제한
      const lastRequestTime = existingRequest[0].createdAt;
      const currentTime = new Date();
      const timeDiff =
        (currentTime.getTime() - lastRequestTime.getTime()) / 1000;
      if (timeDiff < 10) {
        throw new BadRequestException(
          'Too many requests. Please try again later.',
        );
      }
      await this.userFriendRepository.remove(existingRequest);
      const userToFriend = this.userFriendRepository.create({
        user: user,
        friend: friend,
        is_accepted: false,
        is_request: true,
      });
      return await this.userFriendRepository.save([userToFriend]);
    }
    const userToFriend = this.userFriendRepository.create({
      user: user,
      friend: friend,
      is_accepted: false,
      is_request: true,
    });
    const friendToUser = this.userFriendRepository.create({
      user: friend,
      friend: user,
      is_accepted: false,
    });

    return await this.userFriendRepository.save([userToFriend, friendToUser]);
  }
  /** 친구 수락 */
  // 자기 자신이 보낸 요청에 대해선 수락이 되면 안됌
  // 애초에 클라이언트는 나에게 요청이 들어온 것만 확인할 수 있을거라 괜찮긴 할 것
  // 뭔가 리팩토링이 필요할 것 같긴함.
  async acceptFriendRequest(
    uid,
    { friend_id }: FriendDto,
  ): Promise<UserFriend[]> {
    if (uid === friend_id) {
      throw new BadRequestException('Inavalid request');
    }
    const reqProducer = await this.userFriendRepository.findOne({
      where: {
        user: { id: friend_id },
        friend: { id: uid },
        is_accepted: false,
      },
    });
    console.log('A', reqProducer);
    const reqSubscriber = await this.userFriendRepository.findOne({
      where: {
        user: { id: uid },
        friend: { id: friend_id },
        is_accepted: false,
      },
    });
    console.log('R', reqSubscriber);
    if (!reqProducer || !reqSubscriber) {
      throw new BadRequestException(
        'Friend request not found or already accepted.',
      );
    }
    const currentTime = new Date();
    reqProducer.is_accepted = true;
    reqProducer.acceptedAt = currentTime;
    reqSubscriber.is_accepted = true;
    reqSubscriber.acceptedAt = currentTime;

    return await this.userFriendRepository.save([reqProducer, reqSubscriber]);
  }
  /** 테스트가 필요한 코드 EntityManager */
  //async acceptFriendRequest(
  //  uid: number,
  //  { friend_id }: FriendDto,
  //  manager: EntityManager, // 트랜잭션을 위한 EntityManager 추가
  //): Promise<UserFriend[]> {
  //  // 1. 친구 요청을 한 번에 확인
  //  const friendRequest = await manager.findOne(UserFriend, {
  //    where: [
  //      { user: { id: friend_id }, friend: { id: uid }, is_accepted: false },
  //      { user: { id: uid }, friend: { id: friend_id }, is_accepted: false },
  //    ],
  //  });
  //
  //  if (!friendRequest) {
  //    throw new BadRequestException(
  //      'Friend request not found or already accepted.',
  //    );
  //  }
  //
  //  // 2. 친구 요청 수락 처리
  //  friendRequest.is_accepted = true;
  //
  //  // 3. 트랜잭션으로 저장
  //  await manager.save(UserFriend, friendRequest);
  //
  //  return [friendRequest];
  //}

  async getFriendLists(uid: number): Promise<User[]> {
    console.log('i', uid);
    const userFriends = await this.userFriendRepository.find({
      where: [
        { user: { id: uid }, is_accepted: true, is_blacklist: false },
        //{ friend: { id: uid }, is_accepted: true, is_blacklist: false },
      ],
      relations: ['user', 'friend'],
    });
    return userFriends
      .map((userFriend) => userFriend.friend)
      .filter((friend) => friend.id !== uid);
    //return userFriends.map((userFriend) =>
    //  userFriend.user.id === uid ? userFriend.friend : userFriend.user,
    //);
  }
  /** 나에게 들어온 친구 추가 요청 목록 */
  async getFriendRequests(uid: number): Promise<UserFriend[]> {
    return this.userFriendRepository.find({
      where: { user: { id: uid }, is_accepted: false, is_request: false },
      relations: ['friend'],
    });
  }
}
