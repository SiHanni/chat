// src/utils/typeorm-sentry-logger.ts
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import * as Sentry from '@sentry/node';

export class SimpleTypeOrmSentryLogger implements TypeOrmLogger {
  private readonly slowQueryThreshold = 300; // ms 기준

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const start = Date.now();
    console.log('[QUERY]', query);
    if (queryRunner) {
      queryRunner.data = {
        ...(queryRunner.data || {}),
        __sentryQueryStart: start,
        __sentryQuery: query,
        __sentryParams: parameters,
      };
    }
  }

  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    const err = error instanceof Error ? error : new Error(error);
    Sentry.captureException(err, {
      extra: {
        query,
        parameters,
      },
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    console.log('[SLOW QUERY]', query);
    if (time > this.slowQueryThreshold) {
      Sentry.captureMessage(
        `[SLOW QUERY] ${time}ms\n${query}\nParams: ${JSON.stringify(parameters)}`,
        'warning',
      );
    }
  }

  log(level: 'log' | 'info' | 'warn', message: any) {
    if (level === 'warn') {
      Sentry.captureMessage(`[TypeORM Warn] ${message}`, 'warning');
    }
  }

  logMigration(message: string) {
    console.log('[Migration]', message);
  }

  logSchemaBuild(message: string) {
    console.log('[SchemaBuild]', message);
  }
}
