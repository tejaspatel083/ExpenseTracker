import { PaycheckEntry, UserIncomeSettings, UserProfileName } from '../types';

/**
 * Returns all dates (YYYY-MM-DD) in `yearMonth` that fall on the bi-weekly schedule
 * aligned with `anchorThursdayDate`.
 */
export function getBiweeklyThursdays(yearMonth: string, anchorThursdayDate: string = '2026-11-05'): string[] {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const anchor = new Date(anchorThursdayDate + 'T00:00:00');
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const dates: string[] = [];

  // Rewind anchor before start of month
  const cur = new Date(anchor);
  while (cur > startDate) {
    cur.setDate(cur.getDate() - 14);
  }

  // Step forward 14 days and collect matches within this month
  while (cur <= endDate) {
    if (cur >= startDate && cur <= endDate) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
    }
    cur.setDate(cur.getDate() + 14);
  }

  return dates.sort();
}

/**
 * Formats a date string 'YYYY-MM-DD' as 'Thu, Nov 5'
 */
export function formatPaydayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = date.getDate();
  return `${dayName}, ${monthName} ${dayNum}`;
}

/**
 * Generates default paychecks for a given month and user settings
 */
export function generateDefaultPaychecks(
  month: string,
  user: UserProfileName,
  settings: UserIncomeSettings
): PaycheckEntry[] {
  const dates = getBiweeklyThursdays(month, settings.anchorThursday);
  
  return dates.map((date, idx) => ({
    id: `pay-${user.toLowerCase()}-${month}-${idx + 1}`,
    month,
    user,
    date,
    label: `Paycheck ${idx + 1} (${formatPaydayLabel(date)})`,
    amount: settings.defaultPaycheckAmount
  }));
}

