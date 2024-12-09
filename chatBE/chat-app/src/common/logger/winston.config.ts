import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

winston.addColors({
  error: 'bold red',
  warn: 'italic yellow',
  info: 'cyan',
  debug: 'green',
  verbose: 'blue',
  silly: 'magenta',
});

export const winstonConfig = {
  level: 'info', // 기본 로그 레벨 설정
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),
    new DailyRotateFile({
      dirname: 'logs',
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
