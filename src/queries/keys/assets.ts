export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters?: { type?: string }) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetKeys.details(), id] as const,
  vehicle: {
    lookup: (registration: string) => [...assetKeys.all, 'vehicle', 'lookup', registration] as const,
    syncReminders: (assetId: number) => [...assetKeys.all, 'vehicle', 'sync-reminders', assetId] as const,
  },
} as const;
