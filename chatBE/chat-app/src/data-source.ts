import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

const migrationsDir =
  process.env.NODE_ENV === 'production'
    ? 'src/migration/prod/*.ts'
    : 'src/migration/dev/*.ts';

const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_POR),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    'dist/auth/entities/*.js',
    'dist/chatting/entities/*.js',
    'dist/users/entities/*.js',
    //'dist/**/entities/*.js'
  ],
  migrations: [migrationsDir],
  synchronize: false,
  logging: true,
  migrationsRun: true,
  migrationsTableName: 'migrations',
});

export default AppDataSource;
