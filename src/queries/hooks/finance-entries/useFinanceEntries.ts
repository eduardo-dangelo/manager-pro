'use client';

import type { FinanceEntryData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { financeEntryKeys } from '@/queries/keys';

type UseFinanceEntriesParams = {
  locale: string;
  assetId?: number;
  year?: number;
};

export function useFinanceEntries({ locale, assetId, year }: UseFinanceEntriesParams) {
  return useQuery({
    queryKey: financeEntryKeys.list({ assetId, year }),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (assetId) {
        searchParams.set('assetId', String(assetId));
      }
      if (year) {
        searchParams.set('year', String(year));
      }

      const qs = searchParams.toString();
      const url = `/${locale}/api/finance-entries${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch finance entries');
      }
      const { entries } = (await res.json()) as { entries: FinanceEntryData[] };
      return (entries ?? []).map(e => ({
        ...e,
        category: e.category ?? null,
        color: e.color ?? null,
        manualAmounts: e.manualAmounts ?? null,
        attachments: e.attachments ?? null,
      }));
    },
  });
}
