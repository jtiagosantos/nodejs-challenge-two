import { z } from 'zod';

export const createOneMealBodySchema = z.object(
  {
    name: z.string({ required_error: 'name is a required field' }),
    description: z.string({ required_error: 'description is a required field' }),
    datetime: z
      .string({ required_error: 'datetime is a required field' })
      .datetime()
      .transform((value) => new Date(value)),
    isDiet: z.boolean({ required_error: 'isDiet is a required field' }),
  },
  {
    required_error: 'name, description, datetime and isDiet are required fields',
  },
);
