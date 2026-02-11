export type NotificationMetadata = {
  eventId?: number;
  eventName?: string;
  eventStart?: string;
  assetId?: number;
  reminderMinutes?: number;
};

export type NotificationData = {
  id: number;
  userId: string;
  type: string;
  title: string;
  metadata?: NotificationMetadata | null;
  read: boolean;
  createdAt: string;
};

export class Notification {
  constructor(public readonly data: NotificationData) {}

  static fromApi(raw: NotificationData): Notification {
    return new Notification(raw);
  }

  get id(): number {
    return this.data.id;
  }

  get userId(): string {
    return this.data.userId;
  }

  get type(): string {
    return this.data.type;
  }

  get read(): boolean {
    return this.data.read;
  }

  get title(): string {
    return this.data.title;
  }

  get metadata(): NotificationMetadata | null | undefined {
    return this.data.metadata;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }
}
