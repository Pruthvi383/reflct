import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isFriday,
  isSaturday,
  isSunday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

export function getCurrentWeekStart(date = new Date()) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekWindow(date = new Date()) {
  return {
    start: getCurrentWeekStart(date),
    end: endOfWeek(date, { weekStartsOn: 1 })
  };
}

export function isEntryWindowOpen(date = new Date()) {
  return isFriday(date) || isSaturday(date) || isSunday(date);
}

export function daysUntilNextFriday(date = new Date()) {
  if (isEntryWindowOpen(date)) return 0;

  const currentDay = date.getDay();
  const friday = 5;
  const delta = currentDay < friday ? friday - currentDay : 7 - currentDay + friday;
  return delta;
}

export function getEntryCountdownCopy(date = new Date()) {
  const days = daysUntilNextFriday(date);
  if (days === 0) return "Entry is open now.";
  if (days === 1) return "Opens in 1 day.";
  return `Opens in ${days} days.`;
}

export function formatWeekLabel(isoDate: string) {
  return `Week of ${format(parseISO(isoDate), "MMM d")}`;
}

export function formatMonthYear(month: number, year: number) {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

export function getMonthRange(month: number, year: number) {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return { start, end };
}

export function isDateInMonth(date: string, month: number, year: number) {
  const current = parseISO(date);
  return isWithinInterval(current, getMonthRange(month, year));
}

export function getFocusTrend(values: number[]) {
  if (values.length < 2) return "consistent" as const;
  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const avg = (items: number[]) => items.reduce((sum, value) => sum + value, 0) / items.length;

  const delta = avg(secondHalf) - avg(firstHalf);
  if (delta > 0.5) return "improving" as const;
  if (delta < -0.5) return "declining" as const;
  return "consistent" as const;
}

export function hasMissedLastWeek(lastEntryDate: string | null, today = new Date()) {
  if (!lastEntryDate) return true;
  const previousSunday = addDays(startOfWeek(today, { weekStartsOn: 1 }), -1);
  return differenceInCalendarDays(previousSunday, parseISO(lastEntryDate)) > 0;
}
