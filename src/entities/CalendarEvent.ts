export type EventReminders = {
  useDefault: boolean;
  overrides: { method: 'email' | 'popup'; minutes: number }[];
};

export type CalendarEventData = {
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

export type ReminderUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export type ReminderRow = {
  id: string;
  amount: number;
  unit: ReminderUnit;
};

const MINUTES_PER: Record<ReminderUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 24 * 60,
  weeks: 7 * 24 * 60,
};

export class CalendarEvent {
  constructor(public readonly data: CalendarEventData) {}

  static fromApi(raw: CalendarEventData): CalendarEvent {
    return new CalendarEvent(raw);
  }

  get id(): number {
    return this.data.id;
  }

  get assetId(): number {
    return this.data.assetId;
  }

  get userId(): string {
    return this.data.userId;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description;
  }

  get location(): string | null {
    return this.data.location;
  }

  get color(): string | null {
    return this.data.color;
  }

  get start(): string {
    return this.data.start;
  }

  get end(): string {
    return this.data.end;
  }

  get reminders(): CalendarEventData['reminders'] {
    return this.data.reminders;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get updatedAt(): string {
    return this.data.updatedAt;
  }

  /** Format Date to YYYY-MM-DD for input[type="date"] */
  static toDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** Parse date string + time string (HH:mm) into Date */
  static parseDateTime(dateStr: string, timeStr: string): Date {
    const parts = timeStr.split(':').map(Number);
    const hh = parts[0] ?? 0;
    const mm = parts[1] ?? 0;
    const d = new Date(dateStr);
    d.setHours(hh, mm, 0, 0);
    return d;
  }

  static reminderRowToMinutes(_eventStart: Date, row: ReminderRow): number {
    if (row.amount <= 0) {
      return 0;
    }
    return row.amount * MINUTES_PER[row.unit];
  }

  static minutesToReminderRow(minutes: number): Pick<ReminderRow, 'amount' | 'unit'> {
    if (minutes < 60) {
      return { amount: minutes, unit: 'minutes' };
    }
    if (minutes < 24 * 60) {
      return { amount: Math.round(minutes / 60), unit: 'hours' };
    }
    if (minutes < 7 * 24 * 60) {
      return { amount: Math.round(minutes / (24 * 60)), unit: 'days' };
    }
    return { amount: Math.round(minutes / (7 * 24 * 60)), unit: 'weeks' };
  }
}
