export type EventReminders = {
  useDefault: boolean;
  overrides: { method: 'email' | 'popup'; minutes: number }[];
};

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
  reminders?: EventReminders | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarViewMode = 'month' | 'year' | 'schedule';
