import { useFocusEffect, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { BackButton } from '../components/BackButton';
import { Checkbox } from '../components/Checkbox';
import { HabitsEmpty } from '../components/HabitsEmpty';
import { Loading } from '../components/Loading';
import { ProgressBar } from '../components/Progress.Bar';
import { api } from '../lib/axios';
import { generateProgressPercentage } from '../utils/generate-progress-percentage';

interface DayInfoProps {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
  }[];
}

interface Params {
  date: string;
}

export function Habit() {
  const [isLoading, setIsLoading] = useState(true);
  const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const isDateInPast = parsedDate.endOf('day').isBefore(new Date());
  const dayOfWeek = parsedDate.format('dddd');
  const dayAndMonth = parsedDate.format('DD/MM');

  const habitProgress = dayInfo?.possibleHabits.length
    ? generateProgressPercentage(
        dayInfo.possibleHabits.length,
        completedHabits.length
      )
    : 0;

  const fetchHabits = async () => {
    try {
      setIsLoading(true);

      const response = await api.get<DayInfoProps>('/day', {
        params: { date },
      });

      setDayInfo(response.data);
      setCompletedHabits(response.data.completedHabits);
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Ops',
        'Não foi possível carregar as informações. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHabits = async (habitId: string) => {
    try {
      await api.patch(`/habits/${habitId}/toggle`);

      if (completedHabits.includes(habitId)) {
        setCompletedHabits((s) => s.filter((h) => h !== habitId));
      } else {
        setCompletedHabits((s) => [...s, habitId]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Ops',
        'Não foi possível atualizar o status do hábito. Tente novamente.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitProgress} />

        <View
          className={clsx('mt-6', {
            ['opacity-20']: isDateInPast,
          })}
        >
          {dayInfo?.possibleHabits ? (
            dayInfo?.possibleHabits.map((h) => (
              <Checkbox
                key={h.id}
                title={h.title}
                checked={completedHabits.includes(h.id)}
                onPress={() => handleToggleHabits(h.id)}
                disabled={isDateInPast}
              />
            ))
          ) : (
            <HabitsEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos em uma data passada.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
