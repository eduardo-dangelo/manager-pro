import { and, eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { projectsSchema, tasksSchema } from '@/models/Schema';

export type TaskData = {
  name: string;
  description: string;
  projectId: number;
  objectiveId?: number | null;
  parentTaskId?: number | null;
  status?: string;
  priority?: string;
  dueDate?: Date | null;
  assigneeId?: string | null;
  sprintIds?: number[] | null;
};

export class TaskService {
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
   * Create a new task
   */
  static async createTask(taskData: TaskData, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(taskData.projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const newTask = await db.insert(tasksSchema).values({
        name: taskData.name,
        description: taskData.description,
        projectId: taskData.projectId,
        objectiveId: taskData.objectiveId || null,
        parentTaskId: taskData.parentTaskId || null,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        assigneeId: taskData.assigneeId || null,
        sprintIds: taskData.sprintIds || null,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return newTask[0];
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for a project
   */
  static async getTasksByProjectId(projectId: number, userId: string) {
    try {
      // Verify project ownership
      const hasAccess = await this.verifyProjectOwnership(projectId, userId);
      if (!hasAccess) {
        throw new Error('Unauthorized: Project not found or access denied');
      }

      const tasks = await db
        .select()
        .from(tasksSchema)
        .where(eq(tasksSchema.projectId, projectId))
        .orderBy(tasksSchema.createdAt);

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(taskId: number, userId: string) {
    try {
      const task = await db
        .select()
        .from(tasksSchema)
        .where(
          and(
            eq(tasksSchema.id, taskId),
            eq(tasksSchema.userId, userId),
          ),
        )
        .limit(1);

      return task[0] || null;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  static async updateTask(
    taskId: number,
    taskData: Partial<TaskData>,
    userId: string,
  ) {
    try {
      const updatedTask = await db
        .update(tasksSchema)
        .set({
          ...taskData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tasksSchema.id, taskId),
            eq(tasksSchema.userId, userId),
          ),
        )
        .returning();

      return updatedTask[0] || null;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: number, userId: string) {
    try {
      await db
        .delete(tasksSchema)
        .where(
          and(
            eq(tasksSchema.id, taskId),
            eq(tasksSchema.userId, userId),
          ),
        );

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}
