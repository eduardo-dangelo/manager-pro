'use client';

import type { FinanceEntryData, FinanceManualAmounts } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, financeEntryKeys } from '@/queries/keys';

export type CreateFinanceEntryInput = {
  assetId: number;
  name: string;
  kind: FinanceEntryData['kind'];
  flow: FinanceEntryData['flow'];
  amountCents: number;
  category?: string | null;
  color?: string | null;
  manualAmounts?: FinanceManualAmounts | null;
  attachments?: FinanceEntryData['attachments'];
  effectiveDate?: string | Date | null;
  recurringFrequency?: 'monthly' | null;
  recurringStart?: string | Date | null;
  recurringEnd?: string | Date | null;
  initialAmountCents?: number | null;
  initialEffectiveDate?: string | Date | null;
};

function toIso(value?: string | Date | null) {
  if (!value) {
    return null;
  }
  return typeof value === 'string' ? value : value.toISOString();
}

export function useCreateFinanceEntry(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFinanceEntryInput) => {
      const payload = {
        ...data,
        effectiveDate: toIso(data.effectiveDate),
        recurringStart: toIso(data.recurringStart),
        recurringEnd: toIso(data.recurringEnd),
        initialEffectiveDate: toIso(data.initialEffectiveDate ?? null),
      };
      const res = await fetch(`/${locale}/api/finance-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create finance entry');
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
