import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';

const app = fastify();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3333;

app.register(cors);

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

app.get('/habits', async (request, reply) => {
  const habits = await prisma.habit.findMany();

  return { habits };
});

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
