export const financeEntryKeys = {
  all: ['finance-entries'] as const,
  lists: () => [...financeEntryKeys.all, 'list'] as const,
  list: (filters?: { assetId?: number; year?: number }) => [...financeEntryKeys.lists(), filters] as const,
} as const;
