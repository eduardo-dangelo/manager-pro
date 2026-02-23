import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetActivitiesSchema, assetsSchema } from '@/models/Schema';

/* eslint-disable style/operator-linebreak */
export type ActivityAction =
  | 'asset_created'
  | 'asset_updated'
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'doc_uploaded'
  | 'image_uploaded';
/* eslint-enable style/operator-linebreak */

export type ActivityCreateData = {
  assetId: number;
  action: ActivityAction;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: Record<string, unknown> | null;
};

export class ActivityService {
  static async create(data: ActivityCreateData, userId: string) {
    const [created] = await db
      .insert(assetActivitiesSchema)
      .values({
        assetId: data.assetId,
        userId,
        action: data.action,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        metadata: data.metadata ?? null,
        createdAt: new Date(),
      })
      .returning();

    return created;
  }

  static async getByAssetId(assetId: number, userId: string) {
    const activities = await db
      .select()
      .from(assetActivitiesSchema)
      .where(
        and(
          eq(assetActivitiesSchema.assetId, assetId),
          eq(assetActivitiesSchema.userId, userId),
        ),
      )
      .orderBy(desc(assetActivitiesSchema.createdAt));

    return activities;
  }

  static async getByUserId(userId: string, limit = 100) {
    const activities = await db
      .select({
        id: assetActivitiesSchema.id,
        assetId: assetActivitiesSchema.assetId,
        userId: assetActivitiesSchema.userId,
        action: assetActivitiesSchema.action,
        entityType: assetActivitiesSchema.entityType,
        entityId: assetActivitiesSchema.entityId,
        metadata: assetActivitiesSchema.metadata,
        createdAt: assetActivitiesSchema.createdAt,
        assetName: assetsSchema.name,
        assetType: assetsSchema.type,
      })
      .from(assetActivitiesSchema)
      .innerJoin(assetsSchema, eq(assetActivitiesSchema.assetId, assetsSchema.id))
      .where(
        and(
          eq(assetActivitiesSchema.userId, userId),
          eq(assetsSchema.userId, userId),
        ),
      )
      .orderBy(desc(assetActivitiesSchema.createdAt))
      .limit(limit);

    return activities;
  }
}
