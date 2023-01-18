import cors from '@fastify/cors';
import fastify from 'fastify';

import { appRoutes } from './routes';

const app = fastify();

const PORT = process.env.PORT || 3333;

app.register(cors);

app.get('/', async (request, reply) => {
  return { nlw: 'setup' };
});

app.register(appRoutes);

const start = async () => {
  try {
    await app.listen({ port: Number(PORT) });

    console.log(`Server is running on port: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
