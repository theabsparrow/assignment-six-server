export const getCurrentISOWeek = (): number => {
  const date = new Date();
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor((date.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
};

export const getLastFourWeeks = (currentWeek: number): number[] => {
  const weeks: number[] = [];
  for (let i = 3; i >= 0; i--) {
    let w = currentWeek - i;
    if (w <= 0) {
      w += 52;
    }
    weeks.push(w);
  }
  return weeks;
};

interface WeekData {
  _id: number;
  count: number;
}

export const mergeWeeksWithMongoData = (mongoData: WeekData[]): WeekData[] => {
  const currentWeek = getCurrentISOWeek();
  const lastFourWeeks = getLastFourWeeks(currentWeek);
  const weekMap = new Map<number, number>(
    mongoData.map((d) => [d._id, d.count])
  );
  const result = lastFourWeeks.map((week) => ({
    _id: week,
    count: weekMap.get(week) || 0,
  }));
  return result;
};
