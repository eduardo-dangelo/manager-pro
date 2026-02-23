'use client';

import type { Activity } from '@/components/Activity/types';
import { useQuery } from '@tanstack/react-query';
import { activityKeys } from '@/queries/keys';

export function useGetActivities(
  locale: string,
  assetId?: number | null,
) {
  return useQuery({
    queryKey: activityKeys.list(assetId ? { assetId } : undefined),
    queryFn: async () => {
      const url
        = assetId != null
          ? `/${locale}/api/activities?assetId=${assetId}`
          : `/${locale}/api/activities`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch activities');
      }
      const { activities } = (await res.json()) as { activities: Activity[] };
      return activities ?? [];
    },
  });
}
