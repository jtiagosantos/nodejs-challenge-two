import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { knex } from '../../libs/knex';

import { createOneDietBodySchema } from './schemas/create-one-diet.schema';

export const dietsRoutes = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    try {
      const { name, description, datetime, isDiet } = createOneDietBodySchema.parse(
        request.body,
      );

      let sessionId = request.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
        });
      }

      await knex('diets').insert({
        id: randomUUID(),
        session_id: sessionId,
        name,
        description,
        datetime,
        is_diet: isDiet,
      });

      reply.status(201).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ error: error.errors.map((error) => error.message) });
      }

      reply.status(500).send(error);
    }
  });
};
