import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  assetsSchema,
  calendarEventsSchema,
  objectivesSchema,
  sprintsSchema,
  todosSchema,
} from '@/models/Schema';

export type AssetData = {
  name?: string;
  description?: string;
  color?: string;
  status?: string;
  type?: string | null;
  tabs?: string[];
  // Conditional fields for vehicles
  registrationNumber?: string;
  // Conditional fields for properties
  address?: string;
  // JSON field for type-specific metadata
  metadata?: Record<string, any>;
};

export class AssetService {
  /**
   * Get default tabs based on asset type
   */
  static getDefaultTabsForType(type: string | null | undefined): string[] {
    switch (type) {
      case 'vehicle':
        return ['overview', 'docs', 'gallery', 'calendar', 'finance'];
      case 'property':
        return ['overview', 'gallery', 'calendar', 'listing', 'docs', 'finance'];
      case 'person':
        return ['overview', 'calendar', 'finance'];
      case 'project':
        return ['overview', 'todos', 'sprints', 'timeline', 'insights'];
      case 'trip':
        return ['overview', 'calendar'];
      case 'custom':
      default:
        return ['overview'];
    }
  }

  /**
   * Create a new asset
   */
  static async createAsset(assetData: AssetData, userId: string) {
    try {
      console.error('Creating asset with data:', { assetData, userId });
      const insertData: any = {
        type: assetData.type!,
        tabs: this.getDefaultTabsForType(assetData.type!) || [],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (assetData.name !== undefined) {
        insertData.name = assetData.name;
      }
      if (assetData.description !== undefined) {
        insertData.description = assetData.description;
      }
      if (assetData.color !== undefined) {
        insertData.color = assetData.color;
      }
      if (assetData.status !== undefined) {
        insertData.status = assetData.status;
      }
      if (assetData.registrationNumber !== undefined) {
        insertData.registrationNumber = assetData.registrationNumber;
      }
      if (assetData.address !== undefined) {
        insertData.address = assetData.address;
      }
      if (assetData.metadata !== undefined) {
        insertData.metadata = assetData.metadata;
      }

      const newAsset = await db.insert(assetsSchema).values(insertData).returning();

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
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (assetData.name !== undefined) {
        updateData.name = assetData.name;
      }
      if (assetData.description !== undefined) {
        updateData.description = assetData.description;
      }
      if (assetData.color !== undefined) {
        updateData.color = assetData.color;
      }
      if (assetData.status !== undefined) {
        updateData.status = assetData.status;
      }
      if (assetData.type !== undefined && assetData.type !== null) {
        updateData.type = assetData.type;
      }
      if (assetData.tabs !== undefined) {
        updateData.tabs = assetData.tabs;
      }
      if (assetData.registrationNumber !== undefined) {
        updateData.registrationNumber = assetData.registrationNumber;
      }
      if (assetData.address !== undefined) {
        updateData.address = assetData.address;
      }
      if (assetData.metadata !== undefined) {
        updateData.metadata = assetData.metadata;
      }

      const updatedAsset = await db
        .update(assetsSchema)
        .set(updateData)
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
        db.delete(calendarEventsSchema).where(eq(calendarEventsSchema.assetId, assetId)),
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
