import { z } from 'zod';

export const updateOneMealBodySchema = z
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

export const updateOneMealRequestParamsSchema = z.object({
  mealId: z
    .string({ required_error: 'mealId is a required request param' })
    .uuid({ message: 'mealId should be a UUID' }),
});
