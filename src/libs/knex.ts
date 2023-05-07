import { knex as setupKnex, Knex } from 'knex';
import { env } from '../env';

export const config = {
  client: 'pg',
  connection: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  },
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
} as Knex.Config;

export const knex = setupKnex(config);
