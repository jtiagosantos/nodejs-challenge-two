import { z } from 'zod';

export const updateOneDietBodySchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    datetime: z
      .string()
      .datetime()
      .transform((value) => new Date(value))
      .optional(),
    isDiet: z.boolean().optional(),
  })
  .optional();

export const updateOneDietRequestParamsSchema = z.object({
  dietId: z
    .string({ required_error: 'dietId is a required request param' })
    .uuid({ message: 'dietId should be a UUID' }),
});
