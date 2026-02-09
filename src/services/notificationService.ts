import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { notificationsSchema } from '@/models/Schema';

const LIST_LIMIT = 50;

export type NotificationMetadata = {
  eventId?: number;
  eventName?: string;
  assetId?: number;
  type?: string;
  reminderMinutes?: number;
};

export type CreateNotificationData = {
  userId: string;
  type: string;
  title: string;
  metadata?: NotificationMetadata | null;
};

export class NotificationService {
  static async create(data: CreateNotificationData) {
    const [created] = await db
      .insert(notificationsSchema)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        metadata: data.metadata ?? null,
        read: false,
        createdAt: new Date(),
      })
      .returning();

    return created;
  }

  static async getByUserId(userId: string) {
    return db
      .select()
      .from(notificationsSchema)
      .where(eq(notificationsSchema.userId, userId))
      .orderBy(desc(notificationsSchema.createdAt))
      .limit(LIST_LIMIT);
  }

  static async markAsRead(notificationId: number, userId: string) {
    const [updated] = await db
      .update(notificationsSchema)
      .set({ read: true })
      .where(
        and(
          eq(notificationsSchema.id, notificationId),
          eq(notificationsSchema.userId, userId),
        ),
      )
      .returning();
    return updated ?? null;
  }

  static async existsEventReminder(userId: string, eventId: number, reminderMinutes: number): Promise<boolean> {
    const rows = await db
      .select({ id: notificationsSchema.id })
      .from(notificationsSchema)
      .where(
        and(
          eq(notificationsSchema.userId, userId),
          eq(notificationsSchema.type, 'event_reminder'),
          sql`${notificationsSchema.metadata}->>'eventId' = ${String(eventId)}`,
          sql`${notificationsSchema.metadata}->>'reminderMinutes' = ${String(reminderMinutes)}`,
        ),
      )
      .limit(1);
    return rows.length > 0;
  }
}
