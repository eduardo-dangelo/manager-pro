'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetKeys, calendarEventKeys } from '@/queries/keys';

export type SyncVehicleRemindersResult = {
  synced: boolean;
  created: number;
  updated: number;
  tabs?: string[];
};

export function useSyncVehicleReminders(locale: string, assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/${locale}/api/vehicles/${assetId}/sync-reminder-events`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to sync reminder events');
      }
      return (await res.json()) as SyncVehicleRemindersResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assetId) });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}
