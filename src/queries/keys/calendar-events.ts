export const calendarEventKeys = {
  all: ['calendar-events'] as const,
  lists: () => [...calendarEventKeys.all, 'list'] as const,
  list: (filters?: { assetId?: number }) => [...calendarEventKeys.lists(), filters] as const,
  details: () => [...calendarEventKeys.all, 'detail'] as const,
  detail: (id: number) => [...calendarEventKeys.details(), id] as const,
} as const;
