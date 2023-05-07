import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';

import { knex } from '../../libs/knex';

import { UnauthorizedError } from '../../errors/unauthorized.error';
import { MealNotFoundError } from './errors/meal-not-found.error';

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
  });

  app.put(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
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
        throw new MealNotFoundError();
      }

      const { sessionId } = request.cookies;

      if (sessionId !== meal.session_id) {
        throw new UnauthorizedError();
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
    },
  );

  app.delete(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { mealId } = deleteOneMealRequestParamsSchema.parse(request.params);

      const meal = await knex('meals')
        .where('id', '=', mealId)
        .select('session_id')
        .first();

      if (!meal?.session_id) {
        throw new MealNotFoundError();
      }

      const { sessionId } = request.cookies;

      if (sessionId !== meal.session_id) {
        throw new UnauthorizedError();
      }

      await knex('meals').where('id', '=', mealId).del();

      reply.status(204).send();
    },
  );

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId as string;

      const meals = await knex('meals').where('session_id', '=', sessionId).select();

      reply.send({ meals });
    },
  );

  app.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { mealId } = findOneMealRequestParamsSchema.parse(request.params);

      const meal = await knex('meals').where('id', '=', mealId).select('*').first();

      if (!meal?.session_id) {
        throw new MealNotFoundError();
      }

      const { sessionId } = request.cookies;

      if (sessionId !== meal.session_id) {
        throw new UnauthorizedError();
      }

      reply.send(meal);
    },
  );

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId as string;

      const rawResult = (await knex.raw(
        `
            SELECT is_diet, CAST(count AS INT)
            FROM (
              SELECT
                COUNT(*) OVER (
                  PARTITION BY M.is_diet
                  ORDER BY M.is_diet ASC
                ) AS count,
                M.is_diet
              FROM meals AS M
              WHERE M.session_id = ?
            ) AS count_by_diet_column
            GROUP BY is_diet, CAST(count AS INT)
          `,
        [sessionId],
      )) as { rows: Array<{ count: number; is_diet: boolean }> };

      const { rows } = rawResult;
      let offDietMeals = 0;
      let mealsWithinTheDiet = 0;

      if (rows.length === 2) {
        offDietMeals = rows[0].count;
        mealsWithinTheDiet = rows[1].count;
      } else if (rows.length === 1) {
        const [{ count, is_diet }] = rows;

        switch (is_diet) {
          case true:
            mealsWithinTheDiet = count;
            break;
          case false:
            offDietMeals = count;
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
    },
  );
};
