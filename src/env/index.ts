import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is a required environment variable',
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
