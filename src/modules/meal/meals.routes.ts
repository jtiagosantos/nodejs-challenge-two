import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

import { knex } from '../../libs/knex';

import { checkSessionIdExists } from '../../middlewares/check-session-id-exists';

import { filterTruthyValuesOfObject } from '../../helpers/filter-truthy-values-of-object';

import { createOneMealBodySchema } from './schemas/create-one-meal.schema';
import {
  updateOneMealBodySchema,
  updateOneMealRequestParamsSchema,
} from './schemas/update-one-meal.schema';
import { deleteOneMealRequestParamsSchema } from './schemas/delete-one-meal.schema';
import { findOneMealRequestParamsSchema } from './schemas/find-one-meal.schema';

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    try {
      const { name, description, datetime, isDiet } = createOneMealBodySchema.parse(
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

      await knex('meals').insert({
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
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { mealId } = updateOneMealRequestParamsSchema.parse(request.params);
        const body = updateOneMealBodySchema.parse(request.body);

        if (!body) {
          return reply.status(200).send();
        }

        const meal = await knex('meals')
          .where('id', '=', mealId)
          .select('session_id')
          .first();

        if (!meal?.session_id) {
          return reply.status(404).send({ error: 'Meal not found' });
        }

        const { sessionId } = request.cookies;

        if (sessionId !== meal.session_id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const rawMeal = {
          name: body?.name,
          description: body?.description,
          datetime: body?.datetime,
          is_diet: body?.isDiet,
        };
        const updatedDiet = filterTruthyValuesOfObject(rawMeal);

        await knex('meals').where('id', mealId).update(updatedDiet);

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
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { mealId } = deleteOneMealRequestParamsSchema.parse(request.params);

        const meal = await knex('meals')
          .where('id', '=', mealId)
          .select('session_id')
          .first();

        if (!meal?.session_id) {
          return reply.status(404).send({ error: 'Meal not found' });
        }

        const { sessionId } = request.cookies;

        if (sessionId !== meal.session_id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        await knex('meals').where('id', '=', mealId).del();

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

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const sessionId = request.cookies.sessionId as string;

        const meals = await knex('meals').where('session_id', '=', sessionId).select();

        reply.send({ meals });
      } catch (error) {
        reply.status(500).send(error);
      }
    },
  );

  app.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const { mealId } = findOneMealRequestParamsSchema.parse(request.params);

        const meal = await knex('meals').where('id', '=', mealId).select('*').first();

        if (!meal?.session_id) {
          return reply.status(404).send({ error: 'Meal not found' });
        }

        const { sessionId } = request.cookies;

        if (sessionId !== meal.session_id) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        reply.send(meal);
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

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      try {
        const sessionId = request.cookies.sessionId as string;

        const rawResult = (await knex.raw(
          `
            SELECT count, isDiet
            FROM (
              SELECT
                COUNT(*) OVER (
                  PARTITION BY M.is_diet
                  ORDER BY M.is_diet ASC
                ) AS count,
                M.is_diet AS isDiet
              FROM meals AS M
              WHERE M.session_id = ?
            )
            GROUP BY isDiet
          `,
          [sessionId],
        )) as Array<{ count: number; isDiet: 0 | 1 }>;

        let offDietMeals = 0;
        let mealsWithinTheDiet = 0;

        if (rawResult.length === 2) {
          offDietMeals = rawResult[0].count;
          mealsWithinTheDiet = rawResult[1].count;
        } else if (rawResult.length === 1) {
          const [{ count, isDiet }] = rawResult;

          switch (isDiet) {
            case 0:
              offDietMeals = count;
              break;
            case 1:
              mealsWithinTheDiet = count;
              break;
          }
        }

        const meals = await knex('meals').where('session_id', '=', sessionId).select();

        let bestSequenceWithinTheDiet = 0;
        let control = 0;

        meals.forEach((diet) => {
          if (diet.is_diet) {
            control++;

            if (control > bestSequenceWithinTheDiet) {
              bestSequenceWithinTheDiet = control;
            }
          } else {
            control = 0;
          }
        });

        const metrics = {
          totalMeals: mealsWithinTheDiet + offDietMeals,
          mealsWithinTheDiet,
          offDietMeals,
          bestSequenceWithinTheDiet,
        };

        reply.send(metrics);
      } catch (error) {
        reply.status(500).send(error);
      }
    },
  );
};
