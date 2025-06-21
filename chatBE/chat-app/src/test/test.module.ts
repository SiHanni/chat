import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { User } from '../users/entities/user.entity'; // 예시 엔티티

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
