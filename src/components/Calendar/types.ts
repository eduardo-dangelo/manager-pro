export type CalendarEvent = {
  id: number;
  assetId: number;
  userId: string;
  name: string;
  description: string | null;
  location: string | null;
  color: string | null;
  start: string;
  end: string;
  createdAt: string;
  updatedAt: string;
};

export type CalendarViewMode = 'month' | 'year' | 'schedule';
