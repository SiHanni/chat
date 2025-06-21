// src/test/test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('slow')
  async testSlowQuery() {
    return this.testService.slowQuery();
  }

  @Get('error')
  async testErrorQuery() {
    return this.testService.errorQuery();
  }
}
