'use client';

import type { UserPreferencesData } from '@/entities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/queries/keys';

export type UpdateUserPreferencesInput = Partial<{
  theme: string;
  projectsViewMode: string;
  projectsCardSize: string;
  projectsSortBy: string;
  hoverSoundEnabled: string;
}>;

export function useUpdateUserPreferences(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserPreferencesInput) => {
      const res = await fetch(`/${locale}/api/users/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update preferences');
      }
      return (await res.json()) as { success: boolean; preferences: Partial<UserPreferencesData> };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
