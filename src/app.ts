import fastify from 'fastify';
import cookie from '@fastify/cookie';

import { logs } from './logs';
import { dietsRoutes } from './modules/diets/diets.routes';

export const app = fastify();

app.addHook('preHandler', logs);

app.register(cookie);
app.register(dietsRoutes, {
  prefix: 'diets',
});
