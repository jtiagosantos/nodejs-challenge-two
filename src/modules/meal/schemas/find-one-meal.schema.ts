import { z } from 'zod';

export const findOneMealRequestParamsSchema = z.object({
  mealId: z
    .string({ required_error: 'mealId is a required request param' })
    .uuid({ message: 'mealId should be a UUID' }),
});
