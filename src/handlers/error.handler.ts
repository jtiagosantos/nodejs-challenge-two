import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

import { ZodError } from 'zod';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { MealNotFoundError } from '../modules/meal/errors/meal-not-found.error';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({ error: error.message });
  }

  if (error instanceof MealNotFoundError) {
    return reply.status(404).send({ error: error.message });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: error.errors.map((error) => error.message),
    });
  }

  reply.status(500).send(error);
};
