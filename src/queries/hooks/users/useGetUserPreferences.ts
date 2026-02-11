'use client';

import type { UserPreferencesData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/queries/keys';

export function useGetUserPreferences(locale: string) {
  return useQuery({
    queryKey: userKeys.preferences(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/users/preferences`);
      if (!res.ok) {
        throw new Error('Failed to fetch user preferences');
      }
      return (await res.json()) as UserPreferencesData;
    },
  });
}
