import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async slowQuery(): Promise<string> {
    await this.userRepository.query('SELECT SLEEP(4.5)'); // 쿼리 직접 수행도 가능
    return '슬로우 쿼리 완료';
  }

  async errorQuery(): Promise<string> {
    await this.userRepository.query('SELECT * FROM not_a_real_table');
    return '쿼리 에러 발생 테스트';
  }
}
