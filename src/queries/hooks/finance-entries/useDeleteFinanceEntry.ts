'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, financeEntryKeys } from '@/queries/keys';

type DeleteFinanceEntryPayload = {
  id: number;
};

export function useDeleteFinanceEntry(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteFinanceEntryPayload) => {
      const res = await fetch(`/${locale}/api/finance-entries/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to delete finance entry');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeEntryKeys.all });
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
    },
  });
}
