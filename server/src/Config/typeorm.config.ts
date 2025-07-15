/* eslint-disable prettier/prettier */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

dotenv.config();

const HOST = process.env.POSTGRES_HOST || 'postgres';
const PORT_DB = parseInt(process.env.POSTGRES_PORT || '5432', 10);
const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';

const POSTGRES_DATABASE = process.env.POSTGRES_DB || 'postgres';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: HOST,
  port: PORT_DB,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: [join(__dirname, '..', 'src', 'Model', '*.model.{ts,js}')],
  migrations: [join(__dirname, '..', 'src', 'migrations', '*.{ts,js}')],
  synchronize: true,
  migrationsRun: true,
  logging: true,
});

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: HOST,
  port: PORT_DB,
  username: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DATABASE,
  entities: [join(__dirname, '..', 'src', 'Model', '*.model.{ts,js}')],
  migrations: [join(__dirname, '..', 'src', 'migrations', '*.{ts,js}')],
  synchronize: true,
  migrationsRun: true,
  logging: true,
};
export default config;
