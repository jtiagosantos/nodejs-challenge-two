import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { knex } from '../../libs/knex';

import { checkSessionIdExists } from '../../middlewares/check-session-id-exists';

import { filterTruthyValuesOfObject } from '../../helpers/filter-truthy-values-of-object';

import { createOneDietBodySchema } from './schemas/create-one-diet.schema';
import {
  updateOneDietBodySchema,
  updateOneDietRequestParamsSchema,
} from './schemas/update-one-diet.schema';
import { deleteOneDietRequestParamsSchema } from './schemas/delete-one-diet.schema';

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

  app.put(
    '/:dietId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { dietId } = updateOneDietRequestParamsSchema.parse(request.params);
        const body = updateOneDietBodySchema.parse(request.body);

        if (!body) {
          return reply.status(200).send();
        }

        const diet = await knex('diets')
          .where('id', '=', dietId)
          .select('session_id')
          .first();

        if (!diet?.session_id) {
          return reply.status(404).send({ error: 'Diet not found' });
        }

        const { sessionId } = request.cookies;

        if (sessionId !== diet.session_id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const rawDiet = {
          name: body?.name,
          description: body?.description,
          datetime: body?.datetime,
          is_diet: body?.isDiet,
        };
        const updatedDiet = filterTruthyValuesOfObject(rawDiet);

        await knex('diets').where('id', dietId).update(updatedDiet);

        reply.status(204).send();
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .status(400)
            .send({ error: error.errors.map((error) => error.message) });
        }

        reply.status(500).send(error);
      }
    },
  );

  app.delete(
    '/:dietId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { dietId } = deleteOneDietRequestParamsSchema.parse(request.params);

        const diet = await knex('diets')
          .where('id', '=', dietId)
          .select('session_id')
          .first();

        if (!diet?.session_id) {
          return reply.status(404).send({ error: 'Diet not found' });
        }

        const { sessionId } = request.cookies;

        if (sessionId !== diet.session_id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        await knex('diets').where('id', '=', dietId).del();

        reply.status(204).send();
      } catch (error) {
        if (error instanceof ZodError) {
          return reply
            .status(400)
            .send({ error: error.errors.map((error) => error.message) });
        }

        reply.status(500).send(error);
      }
    },
  );
};
