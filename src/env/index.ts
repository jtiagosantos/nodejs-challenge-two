import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_HOST: z.string({
    required_error: 'DATABASE_HOST is a required environment variable',
  }),
  DATABASE_PORT: z.coerce.number({
    required_error: 'DATABASE_PORT is a required environment variable',
  }),
  DATABASE_USER: z.string({
    required_error: 'DATABASE_USER is a required environment variable',
  }),
  DATABASE_PASSWORD: z.string({
    required_error: 'DATABASE_PASSWORD is a required environment variable',
  }),
  DATABASE_NAME: z.string({
    required_error: 'DATABASE_NAME is a required environment variable',
  }),
  PORT: z.coerce.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.log(`❌ Invalid environment variable`);
  _env.error.issues.forEach((error) => console.error(error));

  process.exit(1);
}

export const env = _env.data;
