import type { FinanceEntryData } from '@/entities';
import { getDefaultFinanceColor } from '@/components/Finance/financeDefaultColors';

export type MonthlyFinanceTotals = {
  income: number[];
  expense: number[];
};

export type EntryMonthlySeries = {
  entryId: number;
  name: string;
  flow: 'income' | 'expense';
  color: string;
  monthlyCents: number[];
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function getMonthIndex(date: Date) {
  return date.getMonth();
}

function toDate(value: string | null) {
  if (!value) {
    return null;
  }
  return new Date(value);
}

function monthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function monthInRecurringWindow(year: number, monthIndex: number, recurringStart: Date, recurringEnd: Date | null) {
  const monthMid = new Date(year, monthIndex, 15);
  if (monthMid < startOfMonth(recurringStart)) {
    return false;
  }
  if (recurringEnd && monthMid > endOfMonth(recurringEnd)) {
    return false;
  }
  return true;
}

export function intersectsYear(entry: FinanceEntryData, year: number) {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  if (entry.kind === 'one_time') {
    const effectiveDate = toDate(entry.effectiveDate);
    if (!effectiveDate) {
      return false;
    }
    return effectiveDate >= yearStart && effectiveDate <= yearEnd;
  }

  if (entry.kind === 'recurring' || entry.kind === 'manual_recurring') {
    const recurringStart = toDate(entry.recurringStart);
    if (!recurringStart) {
      return false;
    }
    const recurringEnd = toDate(entry.recurringEnd);
    return recurringStart <= yearEnd && (!recurringEnd || recurringEnd >= yearStart);
  }

  return false;
}

function monthlyCentsForEntry(entry: FinanceEntryData, year: number): number[] {
  const monthly = Array.from({ length: 12 }, () => 0);

  if (entry.kind === 'one_time') {
    const effectiveDate = toDate(entry.effectiveDate);
    if (!effectiveDate || effectiveDate.getFullYear() !== year) {
      return monthly;
    }
    const monthIndex = getMonthIndex(effectiveDate);
    if (monthIndex >= 0 && monthIndex < 12) {
      monthly[monthIndex] = entry.amountCents;
    }
    return monthly;
  }

  if (entry.kind === 'recurring') {
    const recurringStart = toDate(entry.recurringStart);
    if (!recurringStart) {
      return monthly;
    }
    const recurringEnd = toDate(entry.recurringEnd);
    const start = recurringStart > new Date(year, 0, 1) ? recurringStart : new Date(year, 0, 1);
    const end = recurringEnd && recurringEnd < new Date(year, 11, 31, 23, 59, 59, 999)
      ? recurringEnd
      : new Date(year, 11, 31, 23, 59, 59, 999);

    if (start > end) {
      return monthly;
    }

    const rangeStart = startOfMonth(start);
    const rangeEnd = endOfMonth(end);

    for (let m = 0; m < 12; m++) {
      const monthFirst = new Date(year, m, 1);
      const monthLast = endOfMonth(monthFirst);
      if (monthLast < rangeStart || monthFirst > rangeEnd) {
        continue;
      }
      monthly[m] = entry.amountCents;
    }
    return monthly;
  }

  // manual_recurring
  const recurringStart = toDate(entry.recurringStart);
  if (!recurringStart) {
    return monthly;
  }
  const recurringEnd = toDate(entry.recurringEnd);
  for (let m = 0; m < 12; m++) {
    if (!monthInRecurringWindow(year, m, recurringStart, recurringEnd)) {
      continue;
    }
    const key = monthKey(year, m);
    const cents = entry.manualAmounts?.[key] ?? 0;
    monthly[m] = cents;
  }
  return monthly;
}

export function buildEntryMonthlySeries(entries: FinanceEntryData[], year: number): EntryMonthlySeries[] {
  const eligible = entries
    .filter(e => intersectsYear(e, year))
    .sort((a, b) => a.id - b.id);

  let expenseOrd = 0;
  let incomeOrd = 0;

  return eligible.map((entry) => {
    const ord = entry.flow === 'expense' ? expenseOrd++ : incomeOrd++;
    const color = entry.color ?? getDefaultFinanceColor(entry.flow, ord);
    return {
      entryId: entry.id,
      name: entry.name,
      flow: entry.flow,
      color,
      monthlyCents: monthlyCentsForEntry(entry, year),
    };
  });
}

export function aggregateMonthlyTotals(entries: FinanceEntryData[], year: number): MonthlyFinanceTotals {
  const income = Array.from({ length: 12 }, () => 0);
  const expense = Array.from({ length: 12 }, () => 0);

  entries.forEach((entry) => {
    const series = monthlyCentsForEntry(entry, year);
    const bucket = entry.flow === 'income' ? income : expense;
    for (let m = 0; m < 12; m++) {
      bucket[m] = (bucket[m] ?? 0) + series[m];
    }
  });

  return { income, expense };
}

/** `true` for months strictly after the current calendar month when `year` is the current year; all future if `year` is later; none if earlier. */
export function buildFutureMonthFlags(year: number, now: Date = new Date()): boolean[] {
  const y = now.getFullYear();
  const currentMonth = now.getMonth();
  if (year > y) {
    return Array.from({ length: 12 }, () => true);
  }
  if (year < y) {
    return Array.from({ length: 12 }, () => false);
  }
  return Array.from({ length: 12 }, (_, monthIndex) => monthIndex > currentMonth);
}

export function sumMonthlyCentsWithFutureMask(
  monthly: number[],
  futureFlags: boolean[],
  mode: 'realized' | 'all',
): number {
  let sum = 0;
  for (let m = 0; m < 12; m++) {
    const v = monthly[m] ?? 0;
    if (mode === 'all') {
      sum += v;
    } else if (!futureFlags[m]) {
      sum += v;
    }
  }
  return sum;
}
