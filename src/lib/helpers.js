import {
  isSameDay,
  isSameMonth,
  isWithinInterval,
  subDays,
  endOfToday,
} from "date-fns";

export function minutesToHM(totalMinutes) {
  const total = Number(totalMinutes) || 0;
  if (total <= 0) return "-";

  const hours = Math.floor(total / 60);
  const minutes = Math.floor(total % 60);
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min${minutes === 1 ? "" : "s"}`);
  }

  return parts.length ? parts.join(" ") : "-";
}

export const filterLogsByDateRange = (logs, range = "today") => {
  const today = endOfToday();
  const strategies = {
    today: (date) => isSameDay(date, today),
    yesterday: (date) => isSameDay(date, subDays(today, 1)),
    thisMonth: (date) => isSameMonth(date, today),
    last90Days: (date) =>
      isWithinInterval(date, {
        start: subDays(today, 90),
        end: today,
      }),
  };

  const filterFn = strategies[range];
  if (!filterFn) return [];

  return logs?.filter((log) => {
    const logDate = new Date(log.date);
    return filterFn(logDate);
  });
};
