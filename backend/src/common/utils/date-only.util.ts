const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?=$|T)/;

export const BUSINESS_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/**
 * Normalize an ISO date/date-time or Date into a calendar date (YYYY-MM-DD).
 *
 * Availability is stored in PostgreSQL as DATE, so it must not be converted
 * through the server's local timezone.
 */
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
