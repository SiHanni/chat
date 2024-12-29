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
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInUserDto } from './dto/signIn-user.dto';
import { UpdateProfileImageDto, UpdateUserDto } from './dto/update-user.dto';
import { FriendDto } from './dto/friend.dto';
import { User } from './entities/user.entity';
import { UserFriend } from './entities/user-friend.entity';
import { Gender } from './dto/update-user.dto';
import { FriendInfoDto } from './dto/friend.dto';
import { UserDto } from './dto/user.dto';
import { CustomLoggerService } from '../common/logger/logger.service';
import { AuthService } from 'src/auth/auth.service';
import { ChangePwdInput } from './type';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFriend)
    private readonly userFriendRepository: Repository<UserFriend>,
    private readonly logger: CustomLoggerService,
    private authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  // 회원가입에는 이메일, 유저네임, 패스워드만 받고 프로필 이미지는 기본이미지, 폰 인증은 추후
  async signUp(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    if (!email || !username || !password) {
      throw new BadRequestException('Requied Data Missing');
    }
    const checkUser = await this.userRepository.findOne({
      where: [
        { email, is_active: true },
        { username, is_active: true },
      ],
    });

    if (checkUser) {
      if (checkUser.email === email) {
        throw new ConflictException({
          statusCode: 409,
          message: 'Email already exists',
        });
      }
      //if (checkUser.username === username) {
      //  throw new ConflictException('Username already exists');
      //}
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
      this.logger.error(`Save User Error :: ${JSON.stringify(newUser)}`);
      throw new InternalServerErrorException(
        'An error occurred while saving the user',
      );
    }
  }
  async signIn(signInUserDto: SignInUserDto): Promise<{
    accessToken: string;
    refreshToken: string;
    last_login: Date;
    user: UserDto;
  }> {
    const { email, password } = signInUserDto;
    if (!email || !password) {
      throw new BadRequestException('Required Data Missing');
    }

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

    const accessToken = this.authService.generateAccessToken(
      user.id,
      user.email,
    );
    const refreshToken = this.authService.generateRefreshToken(
      user.id,
      user.email,
    );
    user.refresh_token = refreshToken;
    await this.userRepository.save(user);
    try {
      this.logger.log(`user login :: ${(user.email, user.last_login)}`);
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        last_login: user.last_login,
        user: user,
      };
    } catch {
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }
  async getMyProfile(uid: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: uid },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async updateProfileImage(
    uid: number,
    updateProfileImgDto: UpdateProfileImageDto,
  ): Promise<{ status: string; new_profile_img: string }> {
    const { profile_img_name, profile_img_content_type, profile_img_data } =
      updateProfileImgDto;
    console.log(profile_img_content_type);
    console.log(profile_img_name);
    const user = await this.userRepository.findOne({
      where: { id: uid },
    });

    try {
      if (profile_img_data) {
        const buffer = Buffer.from(profile_img_data);

        const s3Upload = await this.s3Service.uploadProfileImgToS3(
          uid,
          buffer,
          profile_img_name,
          profile_img_content_type,
        );
        if (s3Upload) {
          user.profile_img = s3Upload;
          await this.userRepository.save(user);

          return { status: 'success', new_profile_img: s3Upload };
        }
      }
    } catch (error) {
      this.logger.error(
        `error occured in profile image update user:${user.id}, ${error}`,
      );
    }
  }

  async updateProfile(
    uid: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const { username, gender, status_msg } = updateUserDto;

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
    try {
      if (gender) {
        console.log(gender, Gender.FEMALE);
        if (![Gender.MALE, Gender.FEMALE, Gender.ALIEN].includes(gender)) {
          throw new BadRequestException('Invalid gender value');
        }

        user.gender = gender;
      }

      if (status_msg) {
        user.status_msg = status_msg;
      }
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        `error occured in profile update user:${user.id}, ${error}`,
      );
    }
  }

  async findFriend({ email }: FriendDto): Promise<FriendInfoDto> {
    const friend = await this.userRepository.findOne({
      where: { email: email },
    });
    console.log('QWE', friend);
    if (!friend) {
      throw new BadRequestException('Invalid User');
    }
    const friendInfo: FriendInfoDto = {
      username: friend.username,
      profile_img: friend.profile_img,
      status_msg: friend.status_msg,
      email: friend.email,
    };
    return friendInfo;
  }

  /** 친구 요청 */
  async sendFriendRequest(uid, { email }: FriendDto): Promise<UserFriend[]> {
    console.log('USER:', uid);
    console.log('EMAIL F', email);
    const user = await this.userRepository.findOne({ where: { id: uid } });
    const friend = await this.userRepository.findOne({
      where: { email: email },
    });

    if (uid === friend.id) {
      throw new BadRequestException('Inavalid request');
    }

    if (!user || !friend) {
      throw new BadRequestException('Inavalid request:: No target');
    }

    const alreadyFriend = await this.userFriendRepository.find({
      where: [
        {
          user: { id: uid },
          friend: { id: friend.id },
          is_accepted: true,
        },
        {
          user: { id: friend.id },
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
          friend: { id: friend.id },
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
      const lastRequestTime = existingRequest[0].created_at;
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
  async acceptFriendRequest(uid, { email }: FriendDto): Promise<UserFriend[]> {
    const reqProducer = await this.userFriendRepository.findOne({
      where: {
        user: { email: email },
        friend: { id: uid },
        is_accepted: false,
      },
    });
    console.log('A', reqProducer);
    const reqSubscriber = await this.userFriendRepository.findOne({
      where: {
        user: { id: uid },
        friend: { email: email },
        is_accepted: false,
      },
    });
    if (uid === reqProducer.id) {
      throw new BadRequestException('Inavalid request');
    }
    console.log('R', reqSubscriber);
    if (!reqProducer || !reqSubscriber) {
      throw new BadRequestException(
        'Friend request not found or already accepted.',
      );
    }
    const currentTime = new Date();
    reqProducer.is_accepted = true;
    reqProducer.accepted_at = currentTime;
    reqSubscriber.is_accepted = true;
    reqSubscriber.accepted_at = currentTime;

    return await this.userFriendRepository.save([reqProducer, reqSubscriber]);
  }

  async refuseFriendRequest(uid, { email }: FriendDto): Promise<boolean> {
    const reqProducer = await this.userFriendRepository.findOne({
      where: {
        user: { email: email },
        friend: { id: uid },
        is_accepted: false,
      },
    });
    const reqSubscriber = await this.userFriendRepository.findOne({
      where: {
        user: { id: uid },
        friend: { email: email },
        is_accepted: false,
      },
    });
    if (uid === reqProducer.id) {
      throw new BadRequestException('Inavalid request');
    }
    if (!reqProducer || !reqSubscriber) {
      throw new BadRequestException('invalid request');
    }
    try {
      await this.userFriendRepository.delete([
        reqProducer.id,
        reqSubscriber.id,
      ]);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFriendLists(uid: number): Promise<{
    uid: number;
    userInfo: FriendInfoDto;
    friends: FriendInfoDto[];
    friendCnt: number;
  }> {
    const getUser = await this.userRepository.findOne({
      where: { id: uid },
    });
    const userFriends = await this.userFriendRepository.find({
      where: [
        { user: { id: uid }, is_accepted: true, is_blacklist: false },
        //{ friend: { id: uid }, is_accepted: true, is_blacklist: false },
      ],
      relations: ['user', 'friend'],
    });
    const friendCnt = userFriends.length;
    const userInfo = {
      uid: getUser.id,
      username: getUser.username,
      profile_img: getUser.profile_img,
      status_msg: getUser.status_msg,
      email: getUser.email,
    };
    const friendInfo = userFriends.map((friend) => ({
      uid: friend.friend.id,
      username: friend.friend.username,
      profile_img: friend.friend.profile_img,
      status_msg: friend.friend.status_msg,
      email: friend.friend.email,
    }));
    return {
      uid: uid,
      userInfo: userInfo,
      friends: friendInfo,
      friendCnt: friendCnt,
    };
  }
  /** 나에게 들어온 친구 추가 요청 목록 */
  async getFriendRequests(uid: number): Promise<UserFriend[]> {
    return this.userFriendRepository.find({
      where: { user: { id: uid }, is_accepted: false, is_request: false },
      relations: ['friend'],
    });
  }

  /** 비밀번호 수정 */
  async changePassword(
    uid: number,
    pwdDto: ChangePwdInput,
  ): Promise<{ status: string }> {
    const user = await this.userRepository.findOne({
      where: { id: uid },
    });

    const passwordCheck = await bcrypt.compare(
      pwdDto.inputedOldPwd,
      user.password,
    );
    if (!passwordCheck) {
      throw new BadRequestException('Invalid password');
    }
    if (!pwdDto.newPwd) {
      throw new BadRequestException('Required Data Missing');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(pwdDto.newPwd, salt);

    try {
      const currentTime = new Date();
      await this.userRepository.update(uid, {
        password: hashedPassword,
        updated_at: currentTime,
      });
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`changePassword Error: ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
