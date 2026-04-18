import type { FinanceEntryData } from '@/entities';
import { describe, expect, it } from 'vitest';
import {
  aggregateMonthlyTotals,
  buildEntryMonthlySeries,
  buildFutureMonthFlags,
  intersectsYear,
  sumMonthlyCentsWithFutureMask,
} from './financeAggregations';

const base = (over: Partial<FinanceEntryData>): FinanceEntryData => ({
  id: 1,
  assetId: 1,
  userId: 'u1',
  name: 'Test',
  kind: 'one_time',
  flow: 'income',
  amountCents: 100,
  category: null,
  color: null,
  manualAmounts: null,
  attachments: null,
  effectiveDate: null,
  recurringFrequency: null,
  recurringStart: null,
  recurringEnd: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

describe('financeAggregations', () => {
  it('expands monthly recurring entries into each matching month', () => {
    const entries = [
      base({
        id: 1,
        name: 'Rent',
        kind: 'recurring',
        flow: 'income',
        amountCents: 100000,
        recurringFrequency: 'monthly',
        recurringStart: '2026-03-15T00:00:00.000Z',
        recurringEnd: '2026-06-20T00:00:00.000Z',
      }),
    ];

    const result = aggregateMonthlyTotals(entries, 2026);

    expect(result.income[2]).toBe(100000);
    expect(result.income[3]).toBe(100000);
    expect(result.income[4]).toBe(100000);
    expect(result.income[5]).toBe(100000);
    expect(result.income[1]).toBe(0);
    expect(result.income[6]).toBe(0);
  });

  it('filters entries by year intersection for one-time and recurring items', () => {
    const oneTimeInYear = base({
      id: 2,
      name: 'Bonus',
      kind: 'one_time',
      flow: 'income',
      amountCents: 25000,
      effectiveDate: '2026-08-01T00:00:00.000Z',
    });
    const recurringCrossYear = base({
      id: 3,
      name: 'Loan payment',
      kind: 'recurring',
      flow: 'expense',
      amountCents: 15000,
      recurringFrequency: 'monthly',
      recurringStart: '2025-11-01T00:00:00.000Z',
      recurringEnd: '2026-02-01T00:00:00.000Z',
    });
    const outOfYear = {
      ...oneTimeInYear,
      id: 4,
      effectiveDate: '2027-01-01T00:00:00.000Z',
    };

    expect(intersectsYear(oneTimeInYear, 2026)).toBe(true);
    expect(intersectsYear(recurringCrossYear, 2026)).toBe(true);
    expect(intersectsYear(outOfYear, 2026)).toBe(false);
  });

  it('uses manual_amounts keys for manual_recurring per month', () => {
    const gas = base({
      id: 10,
      kind: 'manual_recurring',
      flow: 'expense',
      amountCents: 0,
      recurringStart: '2026-01-01T00:00:00.000Z',
      recurringEnd: null,
      manualAmounts: {
        '2026-01': 5000,
        '2026-02': 7200,
      },
    });
    const totals = aggregateMonthlyTotals([gas], 2026);

    expect(totals.expense[0]).toBe(5000);
    expect(totals.expense[1]).toBe(7200);
    expect(totals.expense[2]).toBe(0);
  });

  it('buildEntryMonthlySeries returns one row per entry with resolved colors', () => {
    const entries = [
      base({
        id: 1,
        kind: 'recurring',
        flow: 'expense',
        amountCents: 1000,
        color: '#ff0000',
        recurringFrequency: 'monthly',
        recurringStart: '2026-01-01T00:00:00.000Z',
        recurringEnd: null,
      }),
    ];
    const series = buildEntryMonthlySeries(entries, 2026);

    expect(series).toHaveLength(1);
    expect(series[0]?.color).toBe('#ff0000');
    expect(series[0]?.monthlyCents[0]).toBe(1000);
  });

  it('buildFutureMonthFlags: past year has no future months', () => {
    const now = new Date(2026, 5, 15);
    const flags = buildFutureMonthFlags(2025, now);
    expect(flags.every(f => !f)).toBe(true);
  });

  it('buildFutureMonthFlags: future year marks every month', () => {
    const now = new Date(2026, 5, 15);
    const flags = buildFutureMonthFlags(2027, now);
    expect(flags.every(f => f)).toBe(true);
  });

  it('buildFutureMonthFlags: current year marks months after current month only', () => {
    const now = new Date(2026, 5, 15);
    const flags = buildFutureMonthFlags(2026, now);
    expect(flags.slice(0, 5).every(f => !f)).toBe(true);
    expect(flags[5]).toBe(false);
    expect(flags[6]).toBe(true);
    expect(flags[11]).toBe(true);
  });

  it('sumMonthlyCentsWithFutureMask sums realized months only', () => {
    const monthly = [100, 200, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const flags = [false, false, true, true, true, true, true, true, true, true, true, true];
    expect(sumMonthlyCentsWithFutureMask(monthly, flags, 'realized')).toBe(300);
    expect(sumMonthlyCentsWithFutureMask(monthly, flags, 'all')).toBe(600);
  });
});
