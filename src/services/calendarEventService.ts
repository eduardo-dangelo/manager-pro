import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetsSchema, calendarEventsSchema } from '@/models/Schema';

export type CalendarEventData = {
  assetId: number;
  name: string;
  description?: string | null;
  location?: string | null;
  color?: string | null;
  start: Date;
  end: Date;
};

export class CalendarEventService {
  private static async verifyAssetOwnership(assetId: number, userId: string) {
    const asset = await db
      .select()
      .from(assetsSchema)
      .where(
        and(
          eq(assetsSchema.id, assetId),
          eq(assetsSchema.userId, userId),
        ),
      )
      .limit(1);

    return asset.length > 0;
  }

  static async create(eventData: CalendarEventData, userId: string) {
    const hasAccess = await this.verifyAssetOwnership(eventData.assetId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Asset not found or access denied');
    }

    const [created] = await db
      .insert(calendarEventsSchema)
      .values({
        assetId: eventData.assetId,
        userId,
        name: eventData.name,
        description: eventData.description ?? null,
        location: eventData.location ?? null,
        color: eventData.color ?? null,
        start: eventData.start,
        end: eventData.end,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  static async getById(eventId: number, userId: string) {
    const [event] = await db
      .select()
      .from(calendarEventsSchema)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      )
      .limit(1);

    return event ?? null;
  }

  static async getByAssetId(assetId: number, userId: string) {
    const hasAccess = await this.verifyAssetOwnership(assetId, userId);
    if (!hasAccess) {
      throw new Error('Unauthorized: Asset not found or access denied');
    }

    return db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.assetId, assetId))
      .orderBy(calendarEventsSchema.start);
  }

  static async getByUserId(userId: string) {
    return db
      .select()
      .from(calendarEventsSchema)
      .where(eq(calendarEventsSchema.userId, userId))
      .orderBy(calendarEventsSchema.start);
  }

  static async update(
    eventId: number,
    updates: Partial<CalendarEventData>,
    userId: string,
  ) {
    const existing = await this.getById(eventId, userId);
    if (!existing) {
      return null;
    }

    if (updates.assetId !== undefined && updates.assetId !== existing.assetId) {
      const hasAccess = await this.verifyAssetOwnership(updates.assetId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.location !== undefined) {
      updateData.location = updates.location;
    }
    if (updates.color !== undefined) {
      updateData.color = updates.color;
    }
    if (updates.start !== undefined) {
      updateData.start = updates.start;
    }
    if (updates.end !== undefined) {
      updateData.end = updates.end;
    }
    if (updates.assetId !== undefined) {
      updateData.assetId = updates.assetId;
    }

    const [updated] = await db
      .update(calendarEventsSchema)
      .set(updateData as Record<string, unknown>)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      )
      .returning();

    return updated ?? null;
  }

  static async delete(eventId: number, userId: string) {
    await db
      .delete(calendarEventsSchema)
      .where(
        and(
          eq(calendarEventsSchema.id, eventId),
          eq(calendarEventsSchema.userId, userId),
        ),
      );
    return true;
  }
}
