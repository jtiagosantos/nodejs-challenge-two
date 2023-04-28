import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../errors/unauthorized.error';

export const checkSessionIdExists = async (request: FastifyRequest) => {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    throw new UnauthorizedError();
  }
};
