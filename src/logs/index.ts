import { FastifyRequest } from 'fastify';

export const logs = async (request: FastifyRequest) => {
  console.log(`⚡[${request.method}] ${request.url}`);
};
