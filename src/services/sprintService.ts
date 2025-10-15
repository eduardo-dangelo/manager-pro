import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { projectsSchema, sprintsSchema } from '@/models/Schema';

export type SprintData = {
  name: string;
  description: string;
  projectId: number;
  workSpaceId?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
};

export class SprintService {
  /**
   * Verify project ownership
   */
  private static async verifyProjectOwnership(projectId: number, userId: string) {
    const project = await db
      .select()
      .from(projectsSchema)
      .where(
        and(
          eq(projectsSchema.id, projectId),
          eq(projectsSchema.userId, userId),
        ),
      )
      .limit(1);

    return project.length > 0;
  }

  /**
   * Create a new sprint
   */
  static async createSprint(sprintData: SprintData, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(sprintData.projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const newSprint = await db.insert(sprintsSchema).values({
        name: sprintData.name,
        description: sprintData.description,
        projectId: sprintData.projectId,
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
   * Get all sprints for a project
   */
  static async getSprintsByProjectId(projectId: number, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const sprints = await db
        .select()
        .from(sprintsSchema)
        .where(eq(sprintsSchema.projectId, projectId))
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
