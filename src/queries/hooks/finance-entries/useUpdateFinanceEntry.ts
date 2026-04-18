'use client';

import type { FinanceEntryData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, financeEntryKeys } from '@/queries/keys';

export type UpdateFinanceEntryPayload = {
  id: number;
  name?: string;
  kind?: FinanceEntryData['kind'];
  flow?: FinanceEntryData['flow'];
  amountCents?: number;
  category?: string | null;
  color?: string | null;
  manualAmounts?: FinanceEntryData['manualAmounts'];
  attachments?: FinanceEntryData['attachments'];
  effectiveDate?: string | Date | null;
  recurringFrequency?: FinanceEntryData['recurringFrequency'];
  recurringStart?: string | Date | null;
  recurringEnd?: string | Date | null;
};

function toIso(value?: string | Date | null) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return typeof value === 'string' ? value : value.toISOString();
}

export function useUpdateFinanceEntry(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateFinanceEntryPayload) => {
      const payload = {
        ...data,
        effectiveDate: toIso(data.effectiveDate),
        recurringStart: toIso(data.recurringStart),
        recurringEnd: toIso(data.recurringEnd),
      };
      const res = await fetch(`/${locale}/api/finance-entries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to update finance entry');
      }

      const { entry } = (await res.json()) as { entry: FinanceEntryData };
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeEntryKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
