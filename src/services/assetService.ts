import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { objectivesSchema, assetsSchema, sprintsSchema, todosSchema } from '@/models/Schema';

export type AssetData = {
  name: string;
  description: string;
  color?: string;
  status?: string;
  type?: string | null;
  tabs?: string[];
};

export class AssetService {
  /**
   * Create a new asset
   */
  static async createAsset(assetData: AssetData, userId: string) {
    try {
      console.error('Creating asset with data:', { assetData, userId });
      const newAsset = await db.insert(assetsSchema).values({
        name: assetData.name,
        description: assetData.description,
        color: assetData.color || 'gray',
        status: assetData.status || 'active',
        type: assetData.type || null,
        tabs: assetData.tabs || ['overview'],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newAsset[0];
    } catch (error) {
      console.error('Error creating asset:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  /**
   * Get all assets for a user
   */
  static async getAssetsByUserId(userId: string) {
    try {
      const assets = await db
        .select()
        .from(assetsSchema)
        .where(eq(assetsSchema.userId, userId))
        .orderBy(assetsSchema.updatedAt);

      return assets;
    } catch (error) {
      console.error('Error fetching assets:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // If assets table doesn't exist, try projects table as fallback
      if (error instanceof Error && error.message.includes('does not exist')) {
        console.error('Assets table might not exist. Please ensure migration 0005 has been applied.');
      }
      throw error;
    }
  }

  /**
   * Get a single asset by ID (with ownership verification)
   */
  static async getAssetById(assetId: number, userId: string) {
    try {
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

      return asset[0] || null;
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  }

  /**
   * Get asset with all related data (objectives, tasks, sprints)
   */
  static async getAssetWithRelations(assetId: number, userId: string) {
    try {
      const asset = await this.getAssetById(assetId, userId);

      if (!asset) {
        return null;
      }

      // Fetch related data
      const [objectives, todos, sprints] = await Promise.all([
        db
          .select()
          .from(objectivesSchema)
          .where(eq(objectivesSchema.assetId, assetId)),
        db
          .select()
          .from(todosSchema)
          .where(eq(todosSchema.assetId, assetId)),
        db
          .select()
          .from(sprintsSchema)
          .where(eq(sprintsSchema.assetId, assetId)),
      ]);

      return {
        ...asset,
        objectives,
        todos,
        sprints,
      };
    } catch (error) {
      console.error('Error fetching asset with relations:', error);
      throw error;
    }
  }

  /**
   * Update an asset
   */
  static async updateAsset(
    assetId: number,
    assetData: Partial<AssetData>,
    userId: string,
  ) {
    try {
      const updatedAsset = await db
        .update(assetsSchema)
        .set({
          ...assetData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(assetsSchema.id, assetId),
            eq(assetsSchema.userId, userId),
          ),
        )
        .returning();

      return updatedAsset[0] || null;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  }

  /**
   * Delete an asset
   */
  static async deleteAsset(assetId: number, userId: string) {
    try {
      // Delete related data first
      await Promise.all([
        db.delete(objectivesSchema).where(eq(objectivesSchema.assetId, assetId)),
        db.delete(todosSchema).where(eq(todosSchema.assetId, assetId)),
        db.delete(sprintsSchema).where(eq(sprintsSchema.assetId, assetId)),
      ]);

      // Delete the asset
      await db
        .delete(assetsSchema)
        .where(
          and(
            eq(assetsSchema.id, assetId),
            eq(assetsSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }
}

