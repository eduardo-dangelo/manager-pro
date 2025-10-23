import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { objectivesSchema, projectsSchema, sprintsSchema, todosSchema } from '@/models/Schema';

export type ProjectData = {
  name: string;
  description: string;
  color?: string;
  status?: string;
  type?: string | null;
  tabs?: string[];
};

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(projectData: ProjectData, userId: string) {
    try {
      console.error('Creating project with data:', { projectData, userId });
      const newProject = await db.insert(projectsSchema).values({
        name: projectData.name,
        description: projectData.description,
        color: projectData.color || 'gray',
        status: projectData.status || 'active',
        type: projectData.type || null,
        tabs: projectData.tabs || ['overview'],
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newProject[0];
    } catch (error) {
      console.error('Error creating project:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  /**
   * Get all projects for a user
   */
  static async getProjectsByUserId(userId: string) {
    try {
      const projects = await db
        .select()
        .from(projectsSchema)
        .where(eq(projectsSchema.userId, userId))
        .orderBy(projectsSchema.updatedAt);

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get a single project by ID (with ownership verification)
   */
  static async getProjectById(projectId: number, userId: string) {
    try {
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

      return project[0] || null;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Get project with all related data (objectives, tasks, sprints)
   */
  static async getProjectWithRelations(projectId: number, userId: string) {
    try {
      const project = await this.getProjectById(projectId, userId);

      if (!project) {
        return null;
      }

      // Fetch related data
      const [objectives, todos, sprints] = await Promise.all([
        db
          .select()
          .from(objectivesSchema)
          .where(eq(objectivesSchema.projectId, projectId)),
        db
          .select()
          .from(todosSchema)
          .where(eq(todosSchema.projectId, projectId)),
        db
          .select()
          .from(sprintsSchema)
          .where(eq(sprintsSchema.projectId, projectId)),
      ]);

      return {
        ...project,
        objectives,
        todos,
        sprints,
      };
    } catch (error) {
      console.error('Error fetching project with relations:', error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  static async updateProject(
    projectId: number,
    projectData: Partial<ProjectData>,
    userId: string,
  ) {
    try {
      const updatedProject = await db
        .update(projectsSchema)
        .set({
          ...projectData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectsSchema.id, projectId),
            eq(projectsSchema.userId, userId),
          ),
        )
        .returning();

      return updatedProject[0] || null;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: number, userId: string) {
    try {
      // Delete related data first
      await Promise.all([
        db.delete(objectivesSchema).where(eq(objectivesSchema.projectId, projectId)),
        db.delete(todosSchema).where(eq(todosSchema.projectId, projectId)),
        db.delete(sprintsSchema).where(eq(sprintsSchema.projectId, projectId)),
      ]);

      // Delete the project
      await db
        .delete(projectsSchema)
        .where(
          and(
            eq(projectsSchema.id, projectId),
            eq(projectsSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}
