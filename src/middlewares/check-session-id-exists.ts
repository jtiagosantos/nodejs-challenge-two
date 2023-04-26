import { FastifyRequest, FastifyReply } from 'fastify';

export const checkSessionIdExists = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const sesionId = request.cookies.sessionId;

  if (!sesionId) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
};
