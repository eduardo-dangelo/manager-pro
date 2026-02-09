export type NotificationMetadata = {
  eventId?: number;
  eventName?: string;
  assetId?: number;
  reminderMinutes?: number;
};

export type Notification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  metadata?: NotificationMetadata | null;
  read: boolean;
  createdAt: string;
};
