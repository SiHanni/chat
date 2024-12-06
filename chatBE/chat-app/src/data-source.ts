import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_POR || '3306'),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    'dist/auth/entities/*.js',
    'dist/chatting/entities/*.js',
    'dist/users/entities/*.js',
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
