import fastify from 'fastify';

import { logs } from './logs';

export const app = fastify();

app.addHook('preHandler', logs);
