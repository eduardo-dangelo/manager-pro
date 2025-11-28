import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { assetsSchema, sprintsSchema } from '@/models/Schema';

export type SprintData = {
  name: string;
  description: string;
  assetId: number;
  workSpaceId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
};

export class SprintService {
  /**
   * Verify asset ownership
   */
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

  /**
   * Create a new sprint
   */
  static async createSprint(sprintData: SprintData, userId: string) {
    try {
      // Verify asset ownership
      const hasAccess = await this.verifyAssetOwnership(sprintData.assetId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }

      const newSprint = await db.insert(sprintsSchema).values({
        name: sprintData.name,
        description: sprintData.description,
        assetId: sprintData.assetId,
        workSpaceId: sprintData.workSpaceId || null,
        startDate: sprintData.startDate || null,
        endDate: sprintData.endDate || null,
        status: sprintData.status || 'planned',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newSprint[0];
    } catch (error) {
      console.error('Error creating sprint:', error);
      throw error;
    }
  }

  /**
   * Get all sprints for an asset
   */
  static async getSprintsByAssetId(assetId: number, userId: string) {
    try {
      // Verify asset ownership
      const hasAccess = await this.verifyAssetOwnership(assetId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Asset not found or access denied');
      }

      const sprints = await db
        .select()
        .from(sprintsSchema)
        .where(eq(sprintsSchema.assetId, assetId))
        .orderBy(sprintsSchema.createdAt);

      return sprints;
    } catch (error) {
      console.error('Error fetching sprints:', error);
      throw error;
    }
  }

  /**
   * Get a single sprint by ID
   */
  static async getSprintById(sprintId: number, userId: string) {
    try {
      const sprint = await db
        .select()
        .from(sprintsSchema)
        .where(
          and(
            eq(sprintsSchema.id, sprintId),
            eq(sprintsSchema.userId, userId),
          ),
        )
        .limit(1);

      return sprint[0] || null;
    } catch (error) {
      console.error('Error fetching sprint:', error);
      throw error;
    }
  }

  /**
   * Update a sprint
   */
  static async updateSprint(
    sprintId: number,
    sprintData: Partial<SprintData>,
    userId: string,
  ) {
    try {
      const updatedSprint = await db
        .update(sprintsSchema)
        .set({
          ...sprintData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sprintsSchema.id, sprintId),
            eq(sprintsSchema.userId, userId),
          ),
        )
        .returning();

      return updatedSprint[0] || null;
    } catch (error) {
      console.error('Error updating sprint:', error);
      throw error;
    }
  }

  /**
   * Delete a sprint
   */
  static async deleteSprint(sprintId: number, userId: string) {
    try {
      await db
        .delete(sprintsSchema)
        .where(
          and(
            eq(sprintsSchema.id, sprintId),
            eq(sprintsSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting sprint:', error);
      throw error;
    }
  }
}
