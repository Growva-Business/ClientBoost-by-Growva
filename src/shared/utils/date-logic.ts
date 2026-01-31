import { DateTime } from 'luxon';

/**
 * Converts a UTC timestamp from Supabase to a Salon's local display format.
 */
export const formatToSalonTime = (
  utcTimestamp: string | null | undefined, 
  salonTimezone: string = 'UTC', 
  format: string = 'yyyy-MM-dd hh:mm a'
): string => {
  if (!utcTimestamp) return '';
  return DateTime.fromISO(utcTimestamp)
    .setZone(salonTimezone)
    .toFormat(format);
};

/**
 * Combines local date/time from a UI picker into a UTC string for the database.
 */

export const toUTC = (date: string, time: string, timezone: string): string => {
  return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm', { zone: timezone })
    .toUTC()
    .toISO() || '';
};

// 🧸 Add this new function here!
export const fromUTC = (utcString: string, timezone: string): DateTime => {
  return DateTime.fromISO(utcString).setZone(timezone);
};

/**
 * Checks if the current salon time is within the Marketing Window (09:00 - 22:30).
 */
export const isMarketingAllowed = (salonTimezone: string): boolean => {
  const localNow = DateTime.now().setZone(salonTimezone);
  const currentTotalMinutes = (localNow.hour * 60) + localNow.minute;
  
  const morningLimit = 9 * 60;      // 09:00 AM
  const nightLimit = (22 * 60) + 30; // 10:30 PM

  return currentTotalMinutes >= morningLimit && currentTotalMinutes <= nightLimit;
};