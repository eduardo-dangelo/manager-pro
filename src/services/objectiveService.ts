import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { objectivesSchema, projectsSchema } from '@/models/Schema';

export type ObjectiveData = {
  name: string;
  description: string;
  projectId: number;
  status?: string;
  priority?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
};

export class ObjectiveService {
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
   * Create a new objective
   */
  static async createObjective(objectiveData: ObjectiveData, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(objectiveData.projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const newObjective = await db.insert(objectivesSchema).values({
        name: objectiveData.name,
        description: objectiveData.description,
        projectId: objectiveData.projectId,
        status: objectiveData.status || 'active',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newObjective[0];
    } catch (error) {
      console.error('Error creating objective:', error);
      throw error;
    }
  }

  /**
   * Get all objectives for a project
   */
  static async getObjectivesByProjectId(projectId: number, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const objectives = await db
        .select()
        .from(objectivesSchema)
        .where(eq(objectivesSchema.projectId, projectId))
        .orderBy(objectivesSchema.createdAt);

      return objectives;
    } catch (error) {
      console.error('Error fetching objectives:', error);
      throw error;
    }
  }

  /**
   * Get a single objective by ID
   */
  static async getObjectiveById(objectiveId: number, userId: string) {
    try {
      const objective = await db
        .select()
        .from(objectivesSchema)
        .where(
          and(
            eq(objectivesSchema.id, objectiveId),
            eq(objectivesSchema.userId, userId),
          ),
        )
        .limit(1);

      return objective[0] || null;
    } catch (error) {
      console.error('Error fetching objective:', error);
      throw error;
    }
  }

  /**
   * Update an objective
   */
  static async updateObjective(
    objectiveId: number,
    objectiveData: Partial<ObjectiveData>,
    userId: string,
  ) {
    try {
      const updatedObjective = await db
        .update(objectivesSchema)
        .set({
          ...objectiveData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(objectivesSchema.id, objectiveId),
            eq(objectivesSchema.userId, userId),
          ),
        )
        .returning();

      return updatedObjective[0] || null;
    } catch (error) {
      console.error('Error updating objective:', error);
      throw error;
    }
  }

  /**
   * Delete an objective
   */
  static async deleteObjective(objectiveId: number, userId: string) {
    try {
      await db
        .delete(objectivesSchema)
        .where(
          and(
            eq(objectivesSchema.id, objectiveId),
            eq(objectivesSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting objective:', error);
      throw error;
    }
  }
}
