export const userKeys = {
  all: ['users'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
} as const;
