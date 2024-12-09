import { Injectable, LoggerService } from '@nestjs/common';
import winston from 'winston';
import { winstonConfig } from './winston.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // 로그 레벨 설정
      ...winstonConfig,
    });
  }
  log(message: string, context?: string) {
    this.logger.info({ message, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ message, trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn({ message, context });
  }

  debug?(message: string, context?: string) {
    this.logger.debug({ message, context });
  }

  verbose?(message: string, context?: string) {
    this.logger.verbose({ message, context });
  }
}
