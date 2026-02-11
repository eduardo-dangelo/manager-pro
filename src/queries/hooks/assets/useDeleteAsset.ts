'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, calendarEventKeys } from '@/queries/keys';

export function useDeleteAsset(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: number) => {
      const res = await fetch(`/${locale}/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete asset');
      }
      return assetId;
    },
    onSuccess: (assetId) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all });
      queryClient.removeQueries({ queryKey: assetKeys.detail(assetId) });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}
