interface Props {
  completed: number;
}

export function Habit({ completed }: Props) {
  return (
    <div className="bg-zinc-900 w-10 text-white rounded m-2 flex items-center justify-center p-8">
      Habit: {completed}
    </div>
  );
}
