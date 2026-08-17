const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?=$|T)/;

export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function normalizeDateOnly(value: string | Date): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new RangeError('Ngày không hợp lệ');
    }

    return [
      value.getUTCFullYear(),
      String(value.getUTCMonth() + 1).padStart(2, '0'),
      String(value.getUTCDate()).padStart(2, '0'),
    ].join('-');
  }

  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new RangeError('Ngày phải có định dạng YYYY-MM-DD');
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('Ngày không hợp lệ');
  }

  return `${yearText}-${monthText}-${dayText}`;
}

/** Convert a normalized calendar date to the Date value Prisma expects for @db.Date. */
export function toPrismaDate(value: string | Date): Date {
  return new Date(`${normalizeDateOnly(value)}T00:00:00.000Z`);
}

/** Return the current calendar date in the shop's business timezone. */
export function getBusinessDateOnly(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDaysToDateOnly(value: string | Date, days: number): Date {
  const date = toPrismaDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** Number of whole days between two normalized YYYY-MM-DD strings (b - a). */
export function diffDays(a: string | Date, b: string | Date): number {
  const aDate = toPrismaDate(a);
  const bDate = toPrismaDate(b);
  return Math.round((bDate.getTime() - aDate.getTime()) / (24 * 60 * 60 * 1000));
}

/** Return `min` of two date-only strings. Inputs must be normalized YYYY-MM-DD. */
export function minDateOnly(a: string | Date, b: string | Date): string {
  const aStr = normalizeDateOnly(a);
  const bStr = normalizeDateOnly(b);
  return aStr <= bStr ? aStr : bStr;
}

/** Day of week using Mon=1..Sun=7 for a normalized YYYY-MM-DD string. */
export function weekdayIndex(value: string | Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const date = toPrismaDate(value);
  // JS: Sun=0..Sat=6; we want Mon=1..Sun=7.
  const jsDay = date.getUTCDay();
  return ((jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
}

/** Vietnamese label for a weekday index (1=Thứ 2 ... 7=Chủ nhật). */
export function weekdayLabel(index: 1 | 2 | 3 | 4 | 5 | 6 | 7): string {
  const labels = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return labels[index];
}

/** Return Monday of the week containing the given date (Vietnam timezone). */
export function getMondayOfWeek(value: string | Date): string {
  const normalized = normalizeDateOnly(value);
  const date = toPrismaDate(normalized);
  const jsDay = date.getUTCDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  date.setUTCDate(date.getUTCDate() + diff);
  return normalizeDateOnly(date);
}
