import { z } from 'zod';

export const findOneDietRequestParamsSchema = z.object({
  dietId: z
    .string({ required_error: 'dietId is a required request param' })
    .uuid({ message: 'dietId should be a UUID' }),
});
