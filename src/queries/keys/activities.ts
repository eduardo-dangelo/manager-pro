export const activityKeys = {
  all: ['activities'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters?: { assetId?: number }) => [...activityKeys.lists(), filters] as const,
} as const;
