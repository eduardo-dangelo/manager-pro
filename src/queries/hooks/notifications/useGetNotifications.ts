'use client';

import type { NotificationData } from '@/entities';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '@/entities';
import { notificationKeys } from '@/queries/keys';

export function useGetNotifications(locale: string) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const res = await fetch(`/${locale}/api/notifications`);
      if (!res.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const { notifications } = (await res.json()) as { notifications: NotificationData[] };
      return (notifications ?? []).map((n: NotificationData) => Notification.fromApi(n));
    },
  });
}
