import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from './lib/prisma';

export async function appRoutes(app: FastifyInstance) {
  app.get('/habits', async (request, reply) => {
    const habits = await prisma.habit.findMany();

    return { habits };
  });

  app.post('/habits', async (request, reply) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(request.body);

    const today = dayjs().startOf('day').toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((d) => ({
            week_day: d,
          })),
        },
      },
    });
  });

  app.get('/day', async (request, reply) => {
    const createDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = createDayParams.parse(request.query);

    const parsedDate = dayjs(date).startOf('day');
    const weekDay = dayjs(parsedDate).get('day');

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((d) => d.habit_id);

    return { possibleHabits, completedHabits };
  });
}
