import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { logs } from './logs';
import { errorHandler } from './handlers/error.handler';
import { mealsRoutes } from './modules/meal/meals.routes';

export const app = fastify();

app.addHook('preHandler', logs);

app.setErrorHandler(errorHandler);

app.register(cookie);
app.register(mealsRoutes, {
  prefix: 'meals',
});
