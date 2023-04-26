import { z } from 'zod';

export const deleteOneDietRequestParamsSchema = z.object({
  dietId: z
    .string({ required_error: 'dietId is a required request param' })
    .uuid({ message: 'dietId should be a UUID' }),
});
