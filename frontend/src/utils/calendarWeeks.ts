export const getMonday = (dateString: string): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
  return date.toISOString().slice(0, 10);
};

export const addDays = (dateString: string, amount: number): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

export const getWeekNumberFromAnchor = (
  anchorWeekStart: string,
  weekStart: string,
): number => {
  const anchor = new Date(`${anchorWeekStart}T00:00:00Z`);
  const current = new Date(`${weekStart}T00:00:00Z`);
  return Math.floor((current.getTime() - anchor.getTime()) / 604800000) + 1;
};
